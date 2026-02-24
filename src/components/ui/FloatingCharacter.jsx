import { motion } from 'framer-motion'
import heroCharacter from '../../assets/hero-character.png'
import './FloatingCharacter.css'

/**
 * FloatingCharacter
 *
 * A position:fixed element that lives ABOVE both Sheet 1 (z:1) and
 * Sheet 2 (z:10) at all times (z-index: 30).
 *
 * Behaviour:
 *  ─ Sheet 1 visible  → robot sits at bottom-right, fully visible
 *  ─ Scroll begins    → robot floats upward at parallax speed (slower
 *                        than the dark sheet), scales up slightly mid-scroll
 *  ─ Sheet 2 fully up → robot has settled at middle-right of Sheet 2
 *
 * Initial CSS anchor: bottom: 4vh; right: 6vw
 *  translateY(0)      = fully visible, bottom-right of hero
 *  translateY(-25vh)  = middle-right of Sheet 2
 *
 * Props:
 *  y     — MotionValue  e.g. "0vh" → "-25vh"
 *  scale — MotionValue  e.g. 1 → 1.10 → 1
 */
function FloatingCharacter({ y, scale }) {
    return (
        <motion.div
            className="floating-character"
            style={{ y, scale }}
            aria-hidden="true"
        >
            <img
                src={heroCharacter}
                alt=""
                className="floating-character__img"
                draggable="false"
            />
        </motion.div>
    )
}

export default FloatingCharacter
