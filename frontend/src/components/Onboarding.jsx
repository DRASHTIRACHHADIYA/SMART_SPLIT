import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Onboarding - Premium FULLSCREEN immersive motion onboarding
 * Shows 3 visually rich animated screens with parallax effects:
 * 1. Food Theme (plate, pizza, burger, coffee, coins floating)
 * 2. Travel Theme (sky gradient, airplane, clouds, tickets)
 * 3. Settlement Theme (shared food, payment confirmation)
 */

const screens = [
    {
        id: 1,
        title: "Split food expenses effortlessly",
        subtitle: "Dinners, lunches, and late-night cravings — all covered",
        gradient: "linear-gradient(165deg, #F8B195 0%, #F67280 50%, #C06C84 100%)",
        illustration: "food"
    },
    {
        id: 2,
        title: "Trips made simple",
        subtitle: "Split expenses on vacations and adventures with friends",
        gradient: "linear-gradient(165deg, #A8E6CF 0%, #56C596 50%, #3D8B7A 100%)",
        illustration: "travel"
    },
    {
        id: 3,
        title: "Settle up, stress-free",
        subtitle: "Track balances and close out trips with ease",
        gradient: "linear-gradient(165deg, #89C4E1 0%, #5B9DC9 50%, #3A6EA5 100%)",
        illustration: "settlement"
    }
];

// ==========================================
// SCREEN 1: FOOD / DINING THEME - FULLSCREEN
// ==========================================
const FoodIllustration = () => (
    <div className="illustration-fullscreen">
        <svg viewBox="0 0 100 100" className="onboarding-svg-fullscreen" preserveAspectRatio="xMidYMid slice">
            {/* Background floating elements - SLOW PARALLAX LAYER */}
            <motion.g
                className="parallax-background"
                initial={{ y: 0 }}
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Floating receipt top-right */}
                <motion.g
                    initial={{ rotate: 15, y: 0 }}
                    animate={{ rotate: [15, 22, 15], y: [-3, 3, -3] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "85% 15%" }}
                >
                    <rect x="78" y="8" width="16" height="22" rx="1.5" fill="white" opacity="0.95" />
                    <line x1="81" y1="13" x2="91" y2="13" stroke="#E0E0E0" strokeWidth="1" />
                    <line x1="81" y1="17" x2="89" y2="17" stroke="#E0E0E0" strokeWidth="1" />
                    <line x1="81" y1="21" x2="87" y2="21" stroke="#E0E0E0" strokeWidth="1" />
                    <line x1="81" y1="26" x2="91" y2="26" stroke="#2ECC71" strokeWidth="1.5" />
                </motion.g>

                {/* Soft decorative circles - background depth */}
                <circle cx="12" cy="20" r="8" fill="white" opacity="0.08" />
                <circle cx="88" cy="75" r="12" fill="white" opacity="0.06" />
                <circle cx="20" cy="80" r="6" fill="white" opacity="0.1" />
            </motion.g>

            {/* Middle layer - MEDIUM PARALLAX */}
            <motion.g
                className="parallax-middle"
                initial={{ y: 0 }}
                animate={{ y: [-1.5, 1.5, -1.5] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Large plate with pizza - CENTER FOCUS */}
                <motion.g
                    initial={{ scale: 0.96 }}
                    animate={{ scale: [0.96, 1.02, 0.96] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Plate shadow */}
                    <ellipse cx="50" cy="58" rx="28" ry="10" fill="rgba(0,0,0,0.15)" />
                    {/* Plate outer */}
                    <ellipse cx="50" cy="52" rx="26" ry="13" fill="#FFFFFF" />
                    <ellipse cx="50" cy="52" rx="23" ry="11.5" fill="#F5F5F5" />
                    <ellipse cx="50" cy="52" rx="20" ry="10" fill="#FAFAFA" />

                    {/* Pizza */}
                    <ellipse cx="50" cy="50" rx="17" ry="8.5" fill="#F4D03F" />
                    {/* Pepperoni */}
                    <circle cx="44" cy="48" r="2.5" fill="#E74C3C" />
                    <circle cx="52" cy="50" r="2.2" fill="#E74C3C" />
                    <circle cx="57" cy="47" r="2.5" fill="#E74C3C" />
                    <circle cx="47" cy="53" r="2" fill="#E74C3C" />
                    <circle cx="55" cy="52" r="2.2" fill="#E74C3C" />
                    {/* Basil leaves */}
                    <ellipse cx="46" cy="51" rx="1.8" ry="0.9" fill="#27AE60" transform="rotate(-20 46 51)" />
                    <ellipse cx="53" cy="49" rx="1.6" ry="0.8" fill="#2ECC71" transform="rotate(15 53 49)" />
                </motion.g>
            </motion.g>

            {/* Foreground layer - FAST PARALLAX */}
            <motion.g
                className="parallax-foreground"
                initial={{ y: 0 }}
                animate={{ y: [-3, 2, -3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Floating burger - left side */}
                <motion.g
                    initial={{ y: 0, rotate: -5 }}
                    animate={{ y: [-6, 4, -6], rotate: [-5, 2, -5] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Bun top */}
                    <ellipse cx="18" cy="35" rx="11" ry="5" fill="#DEB887" />
                    <ellipse cx="18" cy="37" rx="10" ry="4" fill="#D2691E" />
                    {/* Fillings */}
                    <rect x="8" y="38" width="20" height="3" rx="1" fill="#27AE60" />
                    <rect x="9" y="41" width="18" height="3.5" rx="1" fill="#8B4513" />
                    <rect x="8" y="44.5" width="20" height="2" rx="0.5" fill="#F1C40F" />
                    {/* Bun bottom */}
                    <ellipse cx="18" cy="48" rx="11" ry="4" fill="#DEB887" />
                </motion.g>

                {/* Coffee cup - right side */}
                <motion.g
                    initial={{ y: 0 }}
                    animate={{ y: [-4, 5, -4] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                >
                    <rect x="76" y="38" width="14" height="18" rx="2" fill="#FFFFFF" />
                    <rect x="78" y="40" width="10" height="5" rx="1" fill="#6F4E37" />
                    {/* Handle */}
                    <path d="M90 44 Q94 48 90 52" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                    {/* Steam */}
                    <motion.path
                        d="M82 34 Q84 29 82 24"
                        stroke="rgba(255,255,255,0.6)"
                        strokeWidth="1"
                        fill="none"
                        strokeLinecap="round"
                        animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.path
                        d="M86 35 Q88 30 86 25"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1"
                        fill="none"
                        strokeLinecap="round"
                        animate={{ opacity: [0.4, 0.9, 0.4], y: [0, -4, 0] }}
                        transition={{ duration: 2.3, repeat: Infinity, delay: 0.2 }}
                    />
                </motion.g>

                {/* Floating coins - scattered */}
                <motion.g
                    initial={{ y: 0, rotate: 0 }}
                    animate={{ y: [-8, 5, -8], rotate: [0, 15, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <circle cx="8" cy="65" r="5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.8" />
                    <text x="6" y="67" fontSize="4" fill="#DAA520" fontWeight="bold">₹</text>
                </motion.g>

                <motion.g
                    initial={{ y: 0, rotate: 0 }}
                    animate={{ y: [-5, 7, -5], rotate: [0, -12, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <circle cx="92" cy="68" r="4.5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.8" />
                    <text x="90" y="70" fontSize="3.5" fill="#DAA520" fontWeight="bold">₹</text>
                </motion.g>

                <motion.g
                    initial={{ y: 0, rotate: 5 }}
                    animate={{ y: [-6, 4, -6], rotate: [5, -8, 5] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                >
                    <circle cx="35" cy="78" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="0.6" />
                    <text x="33.2" y="80" fontSize="3" fill="#DAA520" fontWeight="bold">₹</text>
                </motion.g>
            </motion.g>
        </svg>
    </div>
);

// ==========================================
// SCREEN 2: TRAVEL / SKY THEME - FULLSCREEN
// ==========================================
const TravelIllustration = () => (
    <div className="illustration-fullscreen">
        <svg viewBox="0 0 100 100" className="onboarding-svg-fullscreen" preserveAspectRatio="xMidYMid slice">
            {/* Background clouds - SLOW PARALLAX */}
            <motion.g
                className="parallax-background"
                initial={{ x: 0 }}
                animate={{ x: [-4, 4, -4] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
                <ellipse cx="15" cy="75" rx="18" ry="9" fill="white" opacity="0.7" />
                <ellipse cx="28" cy="72" rx="12" ry="7" fill="white" opacity="0.7" />
                <ellipse cx="5" cy="80" rx="10" ry="6" fill="white" opacity="0.7" />
            </motion.g>

            <motion.g
                initial={{ x: 0 }}
                animate={{ x: [5, -5, 5] }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            >
                <ellipse cx="82" cy="80" rx="20" ry="10" fill="white" opacity="0.65" />
                <ellipse cx="95" cy="76" rx="14" ry="8" fill="white" opacity="0.65" />
                <ellipse cx="70" cy="85" rx="12" ry="7" fill="white" opacity="0.65" />
            </motion.g>

            {/* Middle layer clouds - MEDIUM PARALLAX */}
            <motion.g
                className="parallax-middle"
                initial={{ x: -3 }}
                animate={{ x: 6 }}
                transition={{ duration: 24, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            >
                <ellipse cx="50" cy="88" rx="22" ry="11" fill="white" opacity="0.85" />
                <ellipse cx="68" cy="84" rx="15" ry="8" fill="white" opacity="0.85" />
                <ellipse cx="35" cy="92" rx="14" ry="8" fill="white" opacity="0.85" />
            </motion.g>

            {/* Small decorative clouds - TOP */}
            <motion.g
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
                <ellipse cx="12" cy="18" rx="8" ry="4" fill="white" opacity="0.6" />
                <ellipse cx="18" cy="16" rx="6" ry="3.5" fill="white" opacity="0.6" />
            </motion.g>

            <motion.g
                animate={{ x: [0, -3, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            >
                <ellipse cx="85" cy="22" rx="10" ry="5" fill="white" opacity="0.55" />
                <ellipse cx="92" cy="20" rx="7" ry="4" fill="white" opacity="0.55" />
            </motion.g>

            {/* Sun with glow */}
            <motion.circle
                cx="85" cy="12"
                r="8"
                fill="#FFD93D"
                initial={{ scale: 0.95 }}
                animate={{ scale: [0.95, 1.1, 0.95] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
                cx="85" cy="12"
                r="12"
                fill="#FFD93D"
                opacity="0.2"
                initial={{ scale: 0.9 }}
                animate={{ scale: [0.9, 1.25, 0.9] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main airplane - smooth flight path */}
            <motion.g
                initial={{ x: -35, y: 15 }}
                animate={{ x: 120, y: -10 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
                {/* Contrail */}
                <motion.line
                    x1="-25" y1="42" x2="-5" y2="42"
                    stroke="white"
                    strokeWidth="1.2"
                    opacity="0.5"
                    strokeLinecap="round"
                />
                <motion.line
                    x1="-20" y1="45" x2="-3" y2="45"
                    stroke="white"
                    strokeWidth="0.8"
                    opacity="0.3"
                    strokeLinecap="round"
                />

                {/* Airplane body */}
                <ellipse cx="12" cy="42" rx="12" ry="3.2" fill="#FFFFFF" />
                {/* Cockpit */}
                <ellipse cx="22" cy="42" rx="3" ry="2.6" fill="#87CEEB" />
                {/* Tail */}
                <path d="M0 42 L-5 37 L2 39 Z" fill="#FFFFFF" />
                <path d="M0 42 L-3 46 L3 44 Z" fill="#E0E0E0" />
                {/* Wings */}
                <path d="M9 42 L5 50 L18 50 L14 42 Z" fill="#E0E0E0" />
                <path d="M9 42 L6 35 L16 35 L14 42 Z" fill="#FFFFFF" />
                {/* Engine */}
                <ellipse cx="10" cy="48" rx="2" ry="1.2" fill="#BDC3C7" />
                {/* Windows */}
                <circle cx="18" cy="41.5" r="0.9" fill="#3498DB" />
                <circle cx="15" cy="41.5" r="0.9" fill="#3498DB" />
                <circle cx="12" cy="41.5" r="0.9" fill="#3498DB" />
                <circle cx="9" cy="41.5" r="0.9" fill="#3498DB" />
                {/* Accent stripe */}
                <line x1="2" y1="42" x2="20" y2="42" stroke="#E74C3C" strokeWidth="0.6" />
            </motion.g>

            {/* Floating tickets - foreground */}
            <motion.g
                className="parallax-foreground"
                initial={{ y: 0, rotate: -8 }}
                animate={{ y: [-6, 4, -6], rotate: [-8, 5, -8] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Ticket 1 */}
                <rect x="8" y="55" width="18" height="10" rx="1.5" fill="#FFFFFF" />
                <rect x="8" y="55" width="5" height="10" rx="1.5" fill="#E74C3C" />
                <circle cx="20" cy="60" r="2" fill="#3498DB" opacity="0.5" />
                <line x1="14" y1="58" x2="24" y2="58" stroke="#E0E0E0" strokeWidth="0.5" />
                <line x1="14" y1="61" x2="22" y2="61" stroke="#E0E0E0" strokeWidth="0.5" />
            </motion.g>

            <motion.g
                initial={{ y: 0, rotate: 12 }}
                animate={{ y: [-4, 6, -4], rotate: [12, 3, 12] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
                {/* Ticket 2 */}
                <rect x="72" y="52" width="20" height="11" rx="1.5" fill="#FFFFFF" />
                <rect x="72" y="52" width="6" height="11" rx="1.5" fill="#2ECC71" />
                <circle cx="85" cy="57" r="2.5" fill="#F1C40F" opacity="0.5" />
                <line x1="80" y1="55" x2="90" y2="55" stroke="#E0E0E0" strokeWidth="0.5" />
                <line x1="80" y1="59" x2="88" y2="59" stroke="#E0E0E0" strokeWidth="0.5" />
            </motion.g>
        </svg>
    </div>
);

// ==========================================
// SCREEN 3: SETTLEMENT THEME - FULLSCREEN
// ==========================================
const SettlementIllustration = () => (
    <div className="illustration-fullscreen">
        <svg viewBox="0 0 100 100" className="onboarding-svg-fullscreen" preserveAspectRatio="xMidYMid slice">
            {/* Background decorative elements - SLOW PARALLAX */}
            <motion.g
                className="parallax-background"
                initial={{ y: 0 }}
                animate={{ y: [-1.5, 1.5, -1.5] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Soft circles */}
                <circle cx="10" cy="25" r="12" fill="white" opacity="0.08" />
                <circle cx="90" cy="20" r="15" fill="white" opacity="0.06" />
                <circle cx="85" cy="75" r="10" fill="white" opacity="0.1" />
                <circle cx="8" cy="80" r="8" fill="white" opacity="0.08" />
            </motion.g>

            {/* Table surface - ground plane */}
            <ellipse cx="50" cy="85" rx="45" ry="12" fill="rgba(0,0,0,0.15)" />
            <path d="M10 78 Q50 85 90 78 L90 82 Q50 88 10 82 Z" fill="#8B4513" opacity="0.4" />

            {/* Middle layer - MEDIUM PARALLAX */}
            <motion.g
                className="parallax-middle"
                initial={{ y: 0 }}
                animate={{ y: [-1, 1, -1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Shared food plate - left */}
                <motion.g
                    initial={{ scale: 0.97 }}
                    animate={{ scale: [0.97, 1.01, 0.97] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Plate */}
                    <ellipse cx="30" cy="62" rx="18" ry="9" fill="#FFFFFF" />
                    <ellipse cx="30" cy="62" rx="15" ry="7.5" fill="#F5F5F5" />
                    {/* Food items on plate */}
                    <ellipse cx="25" cy="60" rx="4" ry="2.5" fill="#E74C3C" />
                    <ellipse cx="33" cy="59" rx="3.5" ry="2" fill="#F39C12" />
                    <ellipse cx="28" cy="64" rx="3" ry="1.8" fill="#27AE60" />
                    <ellipse cx="35" cy="63" rx="2.8" ry="1.5" fill="#9B59B6" />
                </motion.g>

                {/* Shared bowl - right */}
                <motion.g
                    initial={{ scale: 0.98 }}
                    animate={{ scale: [0.98, 1.02, 0.98] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                >
                    {/* Bowl */}
                    <ellipse cx="70" cy="65" rx="14" ry="7" fill="#FFFFFF" />
                    <ellipse cx="70" cy="64" rx="12" ry="6" fill="#F5F5F5" />
                    {/* Salad items */}
                    <ellipse cx="67" cy="62" rx="3" ry="1.5" fill="#27AE60" />
                    <ellipse cx="72" cy="63" rx="2.5" ry="1.3" fill="#E74C3C" />
                    <ellipse cx="70" cy="61" rx="2" ry="1" fill="#F1C40F" />
                </motion.g>
            </motion.g>

            {/* Foreground - FAST PARALLAX - Main success checkmark */}
            <motion.g
                className="parallax-foreground"
                initial={{ scale: 0.95, y: 0 }}
                animate={{ scale: [0.95, 1.02, 0.95], y: [-2, 2, -2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Glow effect */}
                <motion.circle
                    cx="50" cy="40"
                    r="22"
                    fill="#2ECC71"
                    opacity="0.2"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Main badge */}
                <circle cx="50" cy="40" r="16" fill="#2ECC71" />
                <circle cx="50" cy="40" r="14" fill="#27AE60" />
                {/* Animated checkmark */}
                <motion.path
                    d="M42 40 L47 45 L58 34"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                />
            </motion.g>

            {/* Floating coins around settlement badge */}
            <motion.g
                initial={{ y: 0, rotate: 0 }}
                animate={{ y: [-6, 4, -6], rotate: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <circle cx="22" cy="35" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
                <text x="20.5" y="37" fontSize="3" fill="#DAA520" fontWeight="bold">₹</text>
            </motion.g>

            <motion.g
                initial={{ y: 0, rotate: 0 }}
                animate={{ y: [-4, 6, -4], rotate: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            >
                <circle cx="78" cy="32" r="4.5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
                <text x="76.5" y="34" fontSize="3.5" fill="#DAA520" fontWeight="bold">₹</text>
            </motion.g>

            <motion.g
                initial={{ y: 0, rotate: 5 }}
                animate={{ y: [-5, 5, -5], rotate: [5, -5, 5] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
                <circle cx="38" cy="18" r="3.5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
                <text x="36.8" y="20" fontSize="2.8" fill="#DAA520" fontWeight="bold">₹</text>
            </motion.g>

            <motion.g
                initial={{ y: 0, rotate: -3 }}
                animate={{ y: [-3, 5, -3], rotate: [-3, 8, -3] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                <circle cx="62" cy="15" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="0.4" />
                <text x="60.8" y="17" fontSize="2.5" fill="#DAA520" fontWeight="bold">₹</text>
            </motion.g>

            {/* Rising celebration particles */}
            {[...Array(8)].map((_, i) => (
                <motion.circle
                    key={i}
                    cx={25 + i * 7}
                    cy={95}
                    r={1.5}
                    fill={['#3498DB', '#2ECC71', '#E74C3C', '#F1C40F', '#9B59B6', '#1ABC9C', '#FF6B6B', '#4ECDC4'][i]}
                    initial={{ y: 0, opacity: 0.9 }}
                    animate={{
                        y: [-25 - i * 5, 0],
                        opacity: [0.9, 0]
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.25,
                        ease: "easeOut"
                    }}
                />
            ))}
        </svg>
    </div>
);

const illustrations = {
    food: FoodIllustration,
    travel: TravelIllustration,
    settlement: SettlementIllustration
};

function Onboarding({ onComplete }) {
    const [currentScreen, setCurrentScreen] = useState(0);
    // Track slide direction: 1 = forward (right to left), -1 = backward (left to right)
    const [slideDirection, setSlideDirection] = useState(1);

    useEffect(() => {
        // Auto-advance every 5 seconds
        const timer = setInterval(() => {
            if (currentScreen < screens.length - 1) {
                setSlideDirection(1);
                setCurrentScreen(prev => prev + 1);
            }
        }, 5000);

        return () => clearInterval(timer);
    }, [currentScreen]);

    const handleNext = () => {
        if (currentScreen < screens.length - 1) {
            setSlideDirection(1);
            setCurrentScreen(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentScreen > 0) {
            setSlideDirection(-1);
            setCurrentScreen(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        sessionStorage.setItem('smartsplit-onboarding-session', 'true');
        onComplete();
    };

    const handleSkip = () => {
        handleComplete();
    };

    // Horizontal slide animation variants
    // Slides enter from right (100%) and exit to left (-100%) when going forward
    // Reverse when going backward
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction > 0 ? '-100%' : '100%',
            opacity: 0
        })
    };

    // Smooth spring-based transition for natural mobile feel
    const slideTransition = {
        x: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.5
        },
        opacity: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
        }
    };

    // Smooth easing for gradient background
    const smoothEasing = [0.4, 0, 0.2, 1];

    const CurrentIllustration = illustrations[screens[currentScreen].illustration];

    return (
        <motion.div
            className="onboarding-container-fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Persistent gradient background with CSS transition */}
            <motion.div
                className="onboarding-gradient-bg"
                animate={{ background: screens[currentScreen].gradient }}
                transition={{ duration: 0.6, ease: smoothEasing }}
            />

            {/* Skip Button */}
            <motion.button
                className="onboarding-skip-premium"
                onClick={handleSkip}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Skip
            </motion.button>

            {/* Main Content Area - Full Screen */}
            <div className="onboarding-main-content">
                <AnimatePresence initial={false} mode="popLayout" custom={slideDirection}>
                    <motion.div
                        key={currentScreen}
                        custom={slideDirection}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={slideTransition}
                        className="onboarding-slide"
                    >
                        {/* Illustration */}
                        <div className="onboarding-illustration-fullscreen">
                            <CurrentIllustration />
                        </div>

                        {/* Text Content */}
                        <div className="onboarding-text-overlay">
                            <h1>{screens[currentScreen].title}</h1>
                            <p>{screens[currentScreen].subtitle}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <motion.div
                className="onboarding-nav-premium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
                {/* Pagination Dots */}
                <div className="onboarding-dots-premium">
                    {screens.map((_, index) => (
                        <motion.button
                            key={index}
                            className={`onboarding-dot-premium ${index === currentScreen ? 'active' : ''}`}
                            onClick={() => {
                                setSlideDirection(index > currentScreen ? 1 : -1);
                                setCurrentScreen(index);
                            }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="onboarding-buttons-premium">
                    {currentScreen > 0 && (
                        <motion.button
                            className="onboarding-btn-premium secondary"
                            onClick={handlePrev}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            transition={{ duration: 0.3 }}
                        >
                            Back
                        </motion.button>
                    )}
                    <motion.button
                        className="onboarding-btn-premium primary"
                        onClick={handleNext}
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentScreen === screens.length - 1 ? "Get Started" : "Next"}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default Onboarding;
