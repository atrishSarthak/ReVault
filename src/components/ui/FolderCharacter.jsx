import { useState, useEffect } from 'react'
import { useTransform, motion, useMotionValueEvent } from 'framer-motion'
import './FolderCharacter.css'

/* ── Card data ───────────────────────────────────────────────── */
const CARDS = [
    { src: '/CardsReVault/GamingAcc1.png', alt: 'Gaming', tag: 'Gaming', name: 'Diamond Rank · LoL' },
    { src: '/CardsReVault/DigitalContent1.jpg', alt: 'Digital', tag: 'Digital', name: 'Neon Genesis Pack' },
    { src: '/CardsReVault/Events1.png', alt: 'Events', tag: 'Event', name: 'Ultra Miami 2025' },
]

/* ── Base definitions ────────────────────────────────────────── */
// 0 = left-back, 1 = center-front, 2 = right-back
const REST = [
    { x: -55, y: 12, rotate: -22, scale: 0.90, zIndex: 1, filter: 'brightness(0.65)' }, // left back
    { x: 0, y: 0, rotate: 0, scale: 1.00, zIndex: 3, filter: 'brightness(1.00)' }, // front
    { x: 55, y: 12, rotate: 22, scale: 0.90, zIndex: 2, filter: 'brightness(0.65)' }, // right back
]

const SPREAD = [
    { x: -230, y: 25, rotate: -3, scale: 1.00, filter: 'brightness(0.65)', zIndex: 1 }, // left
    { x: 0, y: 0, rotate: 0, scale: 1.35, filter: 'brightness(1.0)', zIndex: 3 }, // center (scale bumped to 1.35)
    { x: 230, y: 25, rotate: 3, scale: 1.00, filter: 'brightness(0.65)', zIndex: 2 }, // right
]

/**
 * FolderCharacter
 */
function FolderCharacter({ scrollYProgress, onActiveCardChange }) {

    const [slotAssigned, setSlotAssigned] = useState([0, 1, 2])
    const [isShuffling, setIsShuffling] = useState(false)
    const [isCarouselShuffling, setIsCarouselShuffling] = useState(false)
    const [scrollProg, setScrollProg] = useState(0)
    const [lastInteraction, setLastInteraction] = useState(Date.now())

    useMotionValueEvent(scrollYProgress, 'change', setScrollProg)

    /* ── Manual Carousel Handling ─────────────────────────────── */
    const handleCardClick = (cardIndex) => {
        // Only allow clicking when fully spread out in carousel mode
        if (scrollProg < 0.85) return

        const currentSlot = slotAssigned.indexOf(cardIndex)
        if (currentSlot === 1) return // Already the center active card

        setLastInteraction(Date.now()) // Resets the automatic timer
        setIsCarouselShuffling(true)

        setSlotAssigned(prev => {
            let next
            if (currentSlot === 2) {
                // Clicked right card -> rotate right to center
                next = [prev[1], prev[2], prev[0]]
            } else {
                // Clicked left card -> rotate left to center
                next = [prev[2], prev[0], prev[1]]
            }
            if (onActiveCardChange) onActiveCardChange(next[1])
            return next
        })

        // Match the slower carousel transition duration
        setTimeout(() => setIsCarouselShuffling(false), 1200)
    }

    /* ── Shuffle timer ────────────────────────────────────────── */
    useEffect(() => {
        // We now have TWO states where shuffling happens:
        // 1. Idle at top (scrollProg < 0.03) -> Deck deal logic
        // 2. Fully spread on Screen 2 (scrollProg > 0.85) -> Carousel horizontal swipe
        if (scrollProg > 0.03 && scrollProg < 0.85) return

        const timer = setInterval(() => {
            if (scrollProg <= 0.03) {
                setIsShuffling(true)
                setSlotAssigned(prev => [prev[1], prev[2], prev[0]])
                setTimeout(() => setIsShuffling(false), 1000)
            } else if (scrollProg >= 0.85) {
                setIsCarouselShuffling(true)
                setSlotAssigned(prev => {
                    const next = [prev[1], prev[2], prev[0]]
                    // Notify parent of the newly centered card (slot 1)
                    if (onActiveCardChange) onActiveCardChange(next[1])
                    return next
                })
                // Slower reset for the carousel transition
                setTimeout(() => setIsCarouselShuffling(false), 1200)
            }
            // Carousel waits longer between shifts (4.5s) instead of the fast shuffle tempo (2.7s)
        }, scrollProg >= 0.85 ? 4500 : 2700)

        return () => clearInterval(timer)
    }, [scrollProg, onActiveCardChange, lastInteraction])

    /* ── Wrapper scroll movement ── */
    // Compute exact horizontal drift for perfect Screen 2 centering.
    // CSS: Wrapper right edge = 22vw from right (so 78vw from left).
    // CSS layout: Card has left: 50% and width: 68% inside the wrapper.
    // Shift required = 0.5*ww - (0.78*ww - 0.16*cardW) = -0.28*ww + 0.16*cardW.
    const [targetX, setTargetX] = useState(-220)
    useEffect(() => {
        const updateCenterDrift = () => {
            const ww = window.innerWidth
            const cardW = Math.max(280, Math.min(ww * 0.26, 400)) // Matches CSS clamp(280px, 26vw, 400px)
            const driftX = -(ww * 0.28) + (cardW * 0.16)
            setTargetX(driftX)
        }
        updateCenterDrift()
        window.addEventListener('resize', updateCenterDrift)
        return () => window.removeEventListener('resize', updateCenterDrift)
    }, [])

    const wrapperX = useTransform(scrollYProgress, [0, 0.85], [0, targetX])
    const wrapperY = useTransform(scrollYProgress, [0, 0.85], [0, 55])

    /* ── Animation target factory ─────────────────────────────── */
    const getTarget = (cardIndex) => {
        const slot = slotAssigned.indexOf(cardIndex)

        // 1. SCROLLING OVERRIDE OR CAROUSEL OVERRIDE
        if (scrollProg > 0.03) {
            const t = Math.min(scrollProg / 0.85, 1)
            const rest = REST[slot]
            const spread = SPREAD[slot]
            return {
                x: rest.x + (spread.x - rest.x) * t,
                y: rest.y + (spread.y - rest.y) * t,
                rotate: rest.rotate + (spread.rotate - rest.rotate) * t,
                scale: rest.scale + (spread.scale - rest.scale) * t,
                filter: isCarouselShuffling ? spread.filter : (rest.filter + ` blur(0px)`), // let framer motion tween the filter
                // (trick: string-matching for filter interpolation if needed, but we can just use spread.filter if fully there)
                // actually better to just manual lerp or rely on Framer
            }
            // Overriding filter strictly when fully spread so the transition works optimally
        }

        // 2. SHUFFLE DECK ANIMATION 
        const rest = REST[slot]
        if (isShuffling) {
            if (slot === 1) { // 2 -> 1 (The PEEL: pulled out, up, and dropped on front)
                return {
                    x: [null, 60, rest.x],              // More subtle pull
                    y: [null, -20, rest.y],             // Less lift
                    rotate: [null, 25, rest.rotate],    // Increased mid-air rotation to 25deg
                    scale: [null, 1.01, rest.scale],
                    filter: [null, 'brightness(1)', rest.filter]
                }
            }
            if (slot === 0) { // 1 -> 0 (The TUCK: slides back and left to make room)
                return {
                    x: [null, -30, rest.x],
                    y: [null, 10, rest.y],
                    rotate: [null, -8, rest.rotate],
                    scale: [null, 0.95, rest.scale],
                    filter: [null, 'brightness(0.8)', rest.filter]
                }
            }
            if (slot === 2) { // 0 -> 2 (The SNEAK: slides across the bottom completely underneath)
                return {
                    x: [null, 0, rest.x],
                    y: [null, 15, rest.y],
                    rotate: [null, 0, rest.rotate],
                    scale: [null, 0.85, rest.scale],
                    filter: [null, 'brightness(0.5)', rest.filter]
                }
            }
        }

        // 3. IDLE (At rest)
        return {
            x: rest.x,
            y: rest.y,
            rotate: rest.rotate,
            scale: rest.scale,
            filter: rest.filter
        }
    }

    return (
        <motion.div
            className="folder-char"
            style={{ x: wrapperX, y: wrapperY }}
            aria-hidden="true"
        >
            {CARDS.map((card, cardIndex) => {
                const slot = slotAssigned.indexOf(cardIndex)
                const target = getTarget(cardIndex)

                // Transition settings
                let transitionMode
                if (scrollProg > 0.03) {
                    transitionMode = isCarouselShuffling
                        ? { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] } // slower, smoother horizontal wipe
                        : { type: 'tween', duration: 0 } // locked to scroll pointer
                } else {
                    transitionMode = isShuffling
                        ? { duration: 1.0, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.45, 1] }
                        : { type: 'spring', stiffness: 70, damping: 20 }
                }

                // Force layout target overrides if fully spread and running the carousel
                if (scrollProg >= 0.85) {
                    target.filter = SPREAD[slot].filter;
                }

                return (
                    <motion.div
                        key={card.alt}
                        className="folder-char__card"
                        onClick={() => handleCardClick(cardIndex)}
                        animate={{
                            x: target.x,
                            y: target.y,
                            rotate: target.rotate,
                            scale: target.scale,
                            filter: target.filter,
                        }}
                        transition={transitionMode}
                        style={{
                            zIndex: scrollProg > 0.03 ? SPREAD[slot].zIndex : REST[slot].zIndex,
                            cursor: scrollProg >= 0.85 && slot !== 1 ? 'pointer' : 'default'
                        }}
                    >
                        <img
                            src={card.src}
                            alt={card.alt}
                            className="folder-char__card-img"
                            draggable="false"
                        />
                        <div className="folder-char__card-label">
                            <span className="folder-char__card-tag">{card.tag}</span>
                            <span className="folder-char__card-name">{card.name}</span>
                        </div>
                    </motion.div>
                )
            })}

            {/* ── Carousel navigation buttons ── */}
            <motion.div
                className="folder-char__nav"
                initial={{ opacity: 0 }}
                animate={{ opacity: scrollProg >= 0.85 ? 1 : 0 }}
                style={{ pointerEvents: scrollProg >= 0.85 ? 'auto' : 'none' }}
                aria-hidden="true"
            >
                <button
                    className="folder-char__nav-btn folder-char__nav-btn--left"
                    onClick={() => handleCardClick(slotAssigned[0])}
                    aria-label="Previous card"
                >
                    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button
                    className="folder-char__nav-btn folder-char__nav-btn--right"
                    onClick={() => handleCardClick(slotAssigned[2])}
                    aria-label="Next card"
                >
                    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </motion.div>
        </motion.div>
    )
}

export default FolderCharacter
