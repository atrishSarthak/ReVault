import { motion } from 'framer-motion'
import './HeroSection.css'

/**
 * HeroSection — Screen 1 (deep green background).
 *
 * The section itself stays sticky and full-height.
 * The content wrapper is a motion.div that receives:
 *   heroScale   — shrinks very subtly as Sheet 2 rises (1 → 0.93)
 *   heroOpacity — fades gently as Sheet 2 covers (1 → 0.35)
 *
 * This replicates the MindMarket "recede" effect where the hero
 * text appears to pull back as the new sheet slides up over it.
 */
function HeroSection({ heroScale, heroOpacity }) {
    return (
        <section className="hero" aria-label="Hero section">

            {/* Motion wrapper — only the content recedes, not the full section bg */}
            <motion.div
                className="hero__content"
                style={{
                    scale: heroScale,
                    opacity: heroOpacity,
                }}
            >
                <p className="hero__eyebrow">Secure · Decentralised · Trustless</p>

                <h1 className="hero__headline">
                    The Future of<br />
                    <span className="hero__headline--accent">Digital Assets</span>
                </h1>

                <p className="hero__sub">
                    ReVault is a next-generation marketplace to buy, sell<br />
                    and manage verified digital assets — securely.
                </p>

                <button className="hero__cta" aria-label="Get started">
                    Get started
                    <span className="hero__cta-arrow">→</span>
                </button>
            </motion.div>

            {/* Scroll hint fades out faster so it doesn't linger awkwardly */}
            <motion.div
                className="hero__scroll-hint"
                style={{ opacity: heroOpacity }}
                aria-hidden="true"
            >
                <span className="hero__scroll-label">Scroll to explore</span>
                <div className="hero__scroll-arrow" />
            </motion.div>

        </section>
    )
}

export default HeroSection
