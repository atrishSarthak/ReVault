import { motion, AnimatePresence } from 'framer-motion'
import './DarkSection.css'

const CAROUSEL_CONTENT = [
    {
        id: 'gaming',
        themeHex: '#007bff',
        themeRgb: '0, 123, 255', // Blue
        eyebrow: "The future of gaming",
        leftTitle: "Level",
        leftAccent: "Up.",
        rightTitle: "Diamond",
        rightAccent: "Rank.",
        sub: "Dominate the leaderboard with verified gaming assets, seamlessly integrated and secure.",
        features: [
            { label: 'Rare Skins', icon: '◆' },
            { label: 'Weapons', icon: '◈' },
            { label: 'Avatars', icon: '◉' },
            { label: 'Powerups', icon: '◎' },
        ]
    },
    {
        id: 'digital',
        themeHex: '#A635FF',
        themeRgb: '166, 53, 255', // Purple
        eyebrow: "The future of ownership",
        leftTitle: "Digital",
        leftAccent: "Art.",
        rightTitle: "Neon",
        rightAccent: "Genesis.",
        sub: "ReVault is a next-generation marketplace to buy, sell, and manage verified digital assets — securely.",
        features: [
            { label: 'NFTs', icon: '◆' },
            { label: 'Real World Assets', icon: '◈' },
            { label: 'Tokenised Funds', icon: '◉' },
            { label: 'Smart Contracts', icon: '◎' },
        ]
    },
    {
        id: 'events',
        themeHex: '#FF5722',
        themeRgb: '255, 87, 34', // Orange
        eyebrow: "The future of events",
        leftTitle: "Premium",
        leftAccent: "Access.",
        rightTitle: "Ultra",
        rightAccent: "Miami.",
        sub: "Unlock exclusive real-world experiences and premium events with tokenized ticketing.",
        features: [
            { label: 'VIP Pass', icon: '◆' },
            { label: 'Backstage', icon: '◈' },
            { label: 'Meetups', icon: '◉' },
            { label: 'Merch', icon: '◎' },
        ]
    }
]

function DarkSection({ y, activeCardIndex = 1 }) {
    const content = CAROUSEL_CONTENT[activeCardIndex] || CAROUSEL_CONTENT[1]

    return (
        <motion.section
            className="dark-section"
            style={{
                y,
                // Pass dynamic theme colour via CSS variables to root of section
                '--theme-color': content.themeHex,
                '--theme-color-rgb': content.themeRgb
            }}
            aria-label="Features section"
        >
            <div className="dark-section__handle" aria-hidden="true" />

            <div className="dark-section__content">

                {/* ── LEFT col ── */}
                {/* Wrap in AnimatePresence for horizontal swipe */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${content.id}-left`}
                        className="dark-section__left"
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                        <p className="dark-section__eyebrow">{content.eyebrow}</p>

                        <h2 className="dark-section__headline">
                            {content.leftTitle}<br />
                            <span className="dark-section__headline--accent">{content.leftAccent}</span>
                        </h2>
                    </motion.div>
                </AnimatePresence>

                {/* ── CENTRE col ── (empty, cards fly in here) */}
                <div className="dark-section__centre" aria-hidden="true" />

                {/* ── RIGHT col ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${content.id}-right`}
                        className="dark-section__right"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                        <div className="dark-section__text">
                            <h2 className="dark-section__headline dark-section__headline--right">
                                {content.rightTitle}<br />
                                <span className="dark-section__headline--accent">{content.rightAccent}</span>
                            </h2>

                            <p className="dark-section__sub">
                                {content.sub}
                            </p>

                            <button className="dark-section__cta">
                                Explore Vault
                                <span>→</span>
                            </button>
                        </div>

                        <div className="dark-section__tiles">
                            {content.features.map(({ label, icon }) => (
                                <div key={label} className="dark-section__card">
                                    <span className="dark-section__card-icon">{icon}</span>
                                    <span className="dark-section__card-label">{label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

            </div>
        </motion.section>
    )
}

export default DarkSection
