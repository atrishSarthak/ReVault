import { useState } from 'react'
import { useMotionValueEvent } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import HeroSection from '../components/sections/HeroSection'
import DarkSection from '../components/sections/DarkSection'
import FolderCharacter from '../components/ui/FolderCharacter'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './LandingPage.css'

/**
 * LandingPage
 *
 * Layer order (z-index):
 *   z:   1  HeroSection (sticky)       — Sheet 1, light background
 *   z:  10  DarkSection (fixed)        — Sheet 2, slides up over hero
 *   z:  30  FloatingCharacter (fixed)  — robot, always visible above both
 *   z:1000  Navbar (fixed)             — top navigation, above everything
 *
 * Scroll effects:
 *   sheetY        → DarkSection slides up
 *   characterY    → FloatingCharacter moves upward (parallax)
 *   characterScale→ FloatingCharacter subtle scale pulse mid-scroll
 *   heroScale     → HeroSection content shrinks very subtly (recede)
 *   heroOpacity   → HeroSection content fades gently (recede)
 *
 * Navbar theming:
 *   `navbarDark` = true  → Sheet 1 visible → dark navbar (on light bg)
 *   `navbarDark` = false → Sheet 2 visible → light navbar (on dark bg)
 *   Threshold: scrollYProgress > 0.70 = sheet is substantially covering hero
 */
function LandingPage() {
    const {
        scrollContainerRef,
        sheetY,
        characterY,
        characterScale,
        heroScale,
        heroOpacity,
        scrollYProgress,
    } = useScrollAnimation()

    // true  → .navbar--light (beige pill) — contrasts the dark Screen 1
    // false → default dark pill           — contrasts the light Screen 2
    const [navbarDark, setNavbarDark] = useState(true)

    // Tracks which card is currently centered in the carousel on Screen 2
    // 0 = Gaming (purple), 1 = Digital (blue), 2 = Events (orange)
    const [activeCardIndex, setActiveCardIndex] = useState(1)

    useMotionValueEvent(scrollYProgress, 'change', (latest) => {
        // Screen 1 (dark bg, scroll < 0.70) → light beige navbar
        // Screen 2 (light bg, scroll >= 0.70) → dark navbar
        setNavbarDark(latest < 0.70)
    })

    return (
        <>
            {/* Navbar — always on top, theme switches based on which sheet is showing */}
            <Navbar dark={navbarDark} />

            {/* scroll-container: 280vh tall — provides the scroll budget */}
            <div className="scroll-container" ref={scrollContainerRef}>
                <HeroSection
                    heroScale={heroScale}
                    heroOpacity={heroOpacity}
                />
            </div>

            {/* Sheet 2 — fixed, slides up over hero */}
            <DarkSection y={sheetY} activeCardIndex={activeCardIndex} />

            {/* Folder — fixed, always above both sheets, cards parallax upward */}
            <FolderCharacter
                y={characterY}
                scrollYProgress={scrollYProgress}
                onActiveCardChange={setActiveCardIndex}
            />
        </>
    )
}

export default LandingPage
