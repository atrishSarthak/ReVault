import { useRef } from 'react'
import { useScroll, useTransform } from 'framer-motion'

/**
 * useScrollAnimation
 *
 * Single source of truth for all scroll-driven values.
 *
 * scrollYProgress is tracked against the 280vh scroll-container.
 *  progress 0   = top of container at top of viewport (hero fully visible)
 *  progress 1   = bottom of container at bottom of viewport
 *
 * Scroll budget: 280vh - 100vh = 180vh of actual scrolling.
 *
 * Derived values:
 *  sheetY         — dark sheet slides up from off-screen to covering hero
 *  characterY     — robot translates upward (parallax, slower than sheet)
 *  characterScale — subtle scale-up mid-scroll for "floating" feel
 *  heroScale      — hero text shrinks as sheet rises (MindMarket recede)
 *  heroOpacity    — hero text fades gently as sheet covers it
 */
export function useScrollAnimation() {
    const scrollContainerRef = useRef(null)

    const { scrollYProgress } = useScroll({
        target: scrollContainerRef,
        offset: ['start start', 'end end'],
    })

    // ── Sheet 2 slides up ─────────────────────────────────────────
    // Wide range [0.05 → 0.85] = 80% of scroll progress.
    // Previously [0.08 → 0.60] = 52% — this is much slower.
    // The sheet now takes ~144vh of scrolling to fully rise.
    const sheetY = useTransform(
        scrollYProgress,
        [0.05, 0.85],
        ['100%', '0%']
    )

    // ── Character Y parallax ──────────────────────────────────────
    // Moves with the sheet — matches the same overall range.
    const characterY = useTransform(
        scrollYProgress,
        [0, 0.85],
        ['0vh', '-25vh']
    )

    // ── Character scale ────────────────────────────────────────────
    // Scale peak stays at roughly the midpoint of the sheet travel.
    const characterScale = useTransform(
        scrollYProgress,
        [0, 0.40, 0.85],
        [1, 1.10, 1]
    )

    // ── Hero text scale (MindMarket recede effect) ─────────────────
    // Finishes before the sheet fully covers so the recession is
    // complete while the sheet is still approaching.
    const heroScale = useTransform(
        scrollYProgress,
        [0.05, 0.68],
        [1, 0.78]
    )

    // ── Hero text opacity ──────────────────────────────────────────
    // Completes the fade before the sheet fully covers.
    const heroOpacity = useTransform(
        scrollYProgress,
        [0.05, 0.62],
        [1, 0.2]
    )

    return {
        scrollContainerRef,
        sheetY,
        characterY,
        characterScale,
        heroScale,
        heroOpacity,
        scrollYProgress,
    }
}
