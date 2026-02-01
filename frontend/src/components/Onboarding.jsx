import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Onboarding - Premium full-screen motion onboarding
 * Shows 3 visually rich animated screens:
 * 1. Beach/Travel Theme
 * 2. Food/Dining Theme
 * 3. Sky/Airplane Theme
 */

const screens = [
    {
        id: 1,
        title: "Trips made simple",
        subtitle: "Split expenses on vacations and adventures with friends",
        gradient: "linear-gradient(180deg, #87CEEB 0%, #4A90D9 50%, #1E5AA8 100%)",
        illustration: "beach"
    },
    {
        id: 2,
        title: "Split food expenses effortlessly",
        subtitle: "Dinners, lunches, and late-night cravings — all covered",
        gradient: "linear-gradient(180deg, #FF9A56 0%, #FF6B6B 50%, #EE4266 100%)",
        illustration: "food"
    },
    {
        id: 3,
        title: "Settle up, stress-free",
        subtitle: "Track balances and close out trips with ease",
        gradient: "linear-gradient(180deg, #E0F4FF 0%, #87CEEB 40%, #4A90D9 100%)",
        illustration: "sky"
    }
];

// ==========================================
// SCREEN 1: BEACH / TRAVEL THEME
// ==========================================
const BeachIllustration = () => (
    <svg viewBox="0 0 400 320" className="onboarding-illustration">
        {/* Sun with glow */}
        <motion.circle
            cx="320" cy="50" r="35"
            fill="#FFD93D"
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
            cx="320" cy="50" r="50"
            fill="#FFD93D"
            opacity="0.3"
            initial={{ scale: 0.95 }}
            animate={{ scale: [0.95, 1.15, 0.95] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating clouds with parallax */}
        <motion.g
            initial={{ x: -30 }}
            animate={{ x: 30 }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        >
            <ellipse cx="80" cy="60" rx="35" ry="18" fill="white" opacity="0.95" />
            <ellipse cx="110" cy="55" rx="28" ry="15" fill="white" opacity="0.95" />
            <ellipse cx="55" cy="65" rx="22" ry="12" fill="white" opacity="0.95" />
        </motion.g>

        <motion.g
            initial={{ x: 20 }}
            animate={{ x: -20 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        >
            <ellipse cx="240" cy="40" rx="30" ry="15" fill="white" opacity="0.85" />
            <ellipse cx="265" cy="45" rx="22" ry="12" fill="white" opacity="0.85" />
        </motion.g>

        {/* Ocean waves - animated */}
        <motion.path
            d="M0 220 Q50 205 100 220 T200 220 T300 220 T400 220 L400 320 L0 320 Z"
            fill="#1E88E5"
            animate={{
                d: [
                    "M0 220 Q50 205 100 220 T200 220 T300 220 T400 220 L400 320 L0 320 Z",
                    "M0 220 Q50 235 100 220 T200 220 T300 220 T400 220 L400 320 L0 320 Z"
                ]
            }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.path
            d="M0 235 Q60 220 120 235 T240 235 T360 235 T400 235 L400 320 L0 320 Z"
            fill="#2196F3"
            animate={{
                d: [
                    "M0 235 Q60 220 120 235 T240 235 T360 235 T400 235 L400 320 L0 320 Z",
                    "M0 235 Q60 250 120 235 T240 235 T360 235 T400 235 L400 320 L0 320 Z"
                ]
            }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />

        {/* Beach / Sand */}
        <path d="M0 260 Q100 250 200 260 T400 255 L400 320 L0 320 Z" fill="#F4D03F" />
        <path d="M0 275 Q80 268 150 275 T320 272 T400 275 L400 320 L0 320 Z" fill="#E9C46A" />

        {/* Palm tree with gentle sway */}
        <rect x="70" y="175" width="10" height="85" rx="3" fill="#8B4513" />
        <motion.g
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "75px 180px" }}
        >
            <path d="M75 180 Q45 155 20 165" stroke="#228B22" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M75 180 Q50 145 25 140" stroke="#2E7D32" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M75 180 Q85 145 115 145" stroke="#2E7D32" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M75 180 Q100 155 130 165" stroke="#228B22" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M75 180 Q75 150 75 130" stroke="#43A047" strokeWidth="7" fill="none" strokeLinecap="round" />
        </motion.g>

        {/* Floating beach ball */}
        <motion.g
            initial={{ y: 0 }}
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
            <circle cx="300" cy="250" r="18" fill="#FF6B6B" />
            <path d="M283 250 Q300 235 318 250" fill="#FFD93D" />
            <path d="M283 250 Q300 265 318 250" fill="#4ECDC4" />
            <circle cx="300" cy="250" r="18" fill="none" stroke="white" strokeWidth="2" />
        </motion.g>

        {/* Floating suitcase */}
        <motion.g
            initial={{ y: 0, rotate: -5 }}
            animate={{ y: [-3, 3, -3], rotate: [-5, 0, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <rect x="340" y="230" width="40" height="30" rx="4" fill="#E74C3C" />
            <rect x="340" y="230" width="40" height="8" rx="2" fill="#C0392B" />
            <rect x="355" y="223" width="10" height="8" rx="2" fill="#7F8C8D" />
            <line x1="350" y1="245" x2="370" y2="245" stroke="#C0392B" strokeWidth="2" />
        </motion.g>
    </svg>
);

// ==========================================
// SCREEN 2: FOOD / DINING THEME
// ==========================================
const FoodIllustration = () => (
    <svg viewBox="0 0 400 320" className="onboarding-illustration">
        {/* Table */}
        <ellipse cx="200" cy="290" rx="180" ry="25" fill="#8B4513" opacity="0.6" />
        <path d="M30 260 Q200 280 370 260 L370 280 Q200 295 30 280 Z" fill="#A0522D" />

        {/* Main plate with pizza */}
        <motion.g
            initial={{ scale: 0.95, y: 0 }}
            animate={{ scale: [0.95, 1, 0.95], y: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Plate */}
            <ellipse cx="200" cy="180" rx="100" ry="50" fill="#FFFFFF" />
            <ellipse cx="200" cy="180" rx="90" ry="45" fill="#F5F5F5" />
            <ellipse cx="200" cy="180" rx="80" ry="40" fill="#FAFAFA" />

            {/* Pizza */}
            <ellipse cx="200" cy="175" rx="65" ry="32" fill="#F4D03F" />
            {/* Pepperoni */}
            <circle cx="175" cy="165" r="8" fill="#E74C3C" />
            <circle cx="205" cy="170" r="7" fill="#E74C3C" />
            <circle cx="225" cy="162" r="8" fill="#E74C3C" />
            <circle cx="190" cy="182" r="6" fill="#E74C3C" />
            <circle cx="218" cy="180" r="7" fill="#E74C3C" />
            {/* Basil leaves */}
            <ellipse cx="182" cy="175" rx="6" ry="3" fill="#27AE60" transform="rotate(-20 182 175)" />
            <ellipse cx="208" cy="178" rx="5" ry="3" fill="#2ECC71" transform="rotate(15 208 178)" />
        </motion.g>

        {/* Floating burger on left */}
        <motion.g
            initial={{ y: 0 }}
            animate={{ y: [-8, 4, -8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
            {/* Bun top */}
            <ellipse cx="80" cy="120" rx="35" ry="15" fill="#DEB887" />
            <ellipse cx="80" cy="125" rx="33" ry="12" fill="#D2691E" />
            {/* Fillings */}
            <rect x="48" y="127" width="64" height="8" rx="2" fill="#27AE60" />
            <rect x="50" y="135" width="60" height="10" rx="2" fill="#8B4513" />
            <rect x="48" y="145" width="64" height="6" rx="2" fill="#F1C40F" />
            {/* Bun bottom */}
            <ellipse cx="80" cy="155" rx="35" ry="12" fill="#DEB887" />
        </motion.g>

        {/* Coffee cup on right */}
        <motion.g
            initial={{ y: 0 }}
            animate={{ y: [-4, 6, -4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
            <rect x="300" y="130" width="45" height="55" rx="6" fill="#FFFFFF" />
            <rect x="305" y="135" width="35" height="15" rx="2" fill="#6F4E37" />
            {/* Handle */}
            <path d="M345 145 Q360 155 345 170" stroke="#FFFFFF" strokeWidth="6" fill="none" />
            {/* Steam */}
            <motion.path
                d="M315 120 Q318 110 315 100"
                stroke="#ECEFF1"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 0.9, 0.4], y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.path
                d="M330 118 Q333 108 330 98"
                stroke="#ECEFF1"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5], y: [0, -10, 0] }}
                transition={{ duration: 2.3, repeat: Infinity, delay: 0.2 }}
            />
        </motion.g>

        {/* Floating coins */}
        <motion.g
            initial={{ y: 0, rotate: 0 }}
            animate={{ y: [-12, 8, -12], rotate: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <circle cx="55" cy="220" r="16" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
            <text x="50" y="226" fontSize="14" fill="#DAA520" fontWeight="bold">₹</text>
        </motion.g>

        <motion.g
            initial={{ y: 0, rotate: 0 }}
            animate={{ y: [-8, 12, -8], rotate: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
            <circle cx="350" cy="230" r="14" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
            <text x="346" y="235" fontSize="12" fill="#DAA520" fontWeight="bold">₹</text>
        </motion.g>

        {/* Receipt floating */}
        <motion.g
            initial={{ rotate: 10, y: 0 }}
            animate={{ rotate: [10, 15, 10], y: [-5, 5, -5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "370px 90px" }}
        >
            <rect x="340" y="60" width="50" height="70" rx="3" fill="white" />
            <line x1="350" y1="75" x2="380" y2="75" stroke="#E0E0E0" strokeWidth="2" />
            <line x1="350" y1="88" x2="375" y2="88" stroke="#E0E0E0" strokeWidth="2" />
            <line x1="350" y1="101" x2="370" y2="101" stroke="#E0E0E0" strokeWidth="2" />
            <line x1="350" y1="118" x2="380" y2="118" stroke="#2ECC71" strokeWidth="3" />
        </motion.g>
    </svg>
);

// ==========================================
// SCREEN 3: SKY / AIRPLANE THEME
// ==========================================
const SkyIllustration = () => (
    <svg viewBox="0 0 400 320" className="onboarding-illustration">
        {/* Fluffy clouds - background layer */}
        <motion.g
            initial={{ x: 0 }}
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
            <ellipse cx="60" cy="220" rx="50" ry="25" fill="white" opacity="0.8" />
            <ellipse cx="100" cy="215" rx="40" ry="22" fill="white" opacity="0.8" />
            <ellipse cx="35" cy="225" rx="30" ry="18" fill="white" opacity="0.8" />
        </motion.g>

        <motion.g
            initial={{ x: 0 }}
            animate={{ x: [15, -15, 15] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
            <ellipse cx="320" cy="250" rx="55" ry="28" fill="white" opacity="0.75" />
            <ellipse cx="365" cy="245" rx="40" ry="22" fill="white" opacity="0.75" />
            <ellipse cx="290" cy="255" rx="35" ry="20" fill="white" opacity="0.75" />
        </motion.g>

        {/* Middle clouds */}
        <motion.g
            initial={{ x: -10 }}
            animate={{ x: 25 }}
            transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        >
            <ellipse cx="180" cy="280" rx="60" ry="30" fill="white" opacity="0.9" />
            <ellipse cx="230" cy="275" rx="45" ry="25" fill="white" opacity="0.9" />
            <ellipse cx="140" cy="285" rx="40" ry="22" fill="white" opacity="0.9" />
        </motion.g>

        {/* Small decorative clouds */}
        <motion.g
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
            <ellipse cx="50" cy="80" rx="25" ry="12" fill="white" opacity="0.7" />
            <ellipse cx="70" cy="78" rx="18" ry="10" fill="white" opacity="0.7" />
        </motion.g>

        <motion.g
            animate={{ x: [0, -8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
            <ellipse cx="350" cy="100" rx="30" ry="14" fill="white" opacity="0.7" />
            <ellipse cx="375" cy="96" rx="20" ry="11" fill="white" opacity="0.7" />
        </motion.g>

        {/* Main airplane - smooth left to right motion */}
        <motion.g
            initial={{ x: -120, y: 20 }}
            animate={{ x: 450, y: -30 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
            {/* Contrail */}
            <motion.line
                x1="-80" y1="140" x2="-10" y2="140"
                stroke="white"
                strokeWidth="4"
                opacity="0.6"
                strokeLinecap="round"
            />
            <motion.line
                x1="-60" y1="150" x2="-5" y2="150"
                stroke="white"
                strokeWidth="3"
                opacity="0.4"
                strokeLinecap="round"
            />

            {/* Airplane body */}
            <ellipse cx="50" cy="140" rx="45" ry="12" fill="#FFFFFF" />
            {/* Cockpit */}
            <ellipse cx="90" cy="140" rx="12" ry="10" fill="#87CEEB" />
            {/* Tail */}
            <path d="M5 140 L-15 120 L5 125 Z" fill="#FFFFFF" />
            <path d="M5 140 L-10 155 L10 145 Z" fill="#E0E0E0" />
            {/* Wings */}
            <path d="M40 140 L25 165 L65 165 L55 140 Z" fill="#E0E0E0" />
            <path d="M40 140 L30 120 L60 120 L55 140 Z" fill="#FFFFFF" />
            {/* Engine */}
            <ellipse cx="45" cy="160" rx="8" ry="5" fill="#BDC3C7" />
            {/* Windows */}
            <circle cx="70" cy="138" r="3" fill="#3498DB" />
            <circle cx="60" cy="138" r="3" fill="#3498DB" />
            <circle cx="50" cy="138" r="3" fill="#3498DB" />
            <circle cx="40" cy="138" r="3" fill="#3498DB" />
            {/* Accent stripe */}
            <line x1="10" y1="140" x2="85" y2="140" stroke="#E74C3C" strokeWidth="2" />
        </motion.g>

        {/* Floating settlement checkmark badge */}
        <motion.g
            initial={{ scale: 0.9, y: 0 }}
            animate={{ scale: [0.9, 1.05, 0.9], y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <circle cx="200" cy="200" r="40" fill="#2ECC71" />
            <circle cx="200" cy="200" r="35" fill="#27AE60" />
            <motion.path
                d="M180 200 L193 213 L222 184"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            />
        </motion.g>

        {/* Small floating elements */}
        {[...Array(5)].map((_, i) => (
            <motion.circle
                key={i}
                cx={80 + i * 60}
                cy={300}
                r={5}
                fill={['#3498DB', '#2ECC71', '#E74C3C', '#F1C40F', '#9B59B6'][i]}
                initial={{ y: 0, opacity: 0.8 }}
                animate={{
                    y: [-30 - i * 8, 0],
                    opacity: [0.8, 0]
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
);

const illustrations = {
    beach: BeachIllustration,
    food: FoodIllustration,
    sky: SkyIllustration
};

function Onboarding({ onComplete }) {
    const [currentScreen, setCurrentScreen] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        // Auto-advance every 5 seconds
        const timer = setInterval(() => {
            if (currentScreen < screens.length - 1) {
                setDirection(1);
                setCurrentScreen(prev => prev + 1);
            }
        }, 5000);

        return () => clearInterval(timer);
    }, [currentScreen]);

    const handleNext = () => {
        if (currentScreen < screens.length - 1) {
            setDirection(1);
            setCurrentScreen(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentScreen > 0) {
            setDirection(-1);
            setCurrentScreen(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('smartsplit-onboarding-complete', 'true');
        onComplete();
    };

    const handleSkip = () => {
        handleComplete();
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction > 0 ? -300 : 300,
            opacity: 0
        })
    };

    const CurrentIllustration = illustrations[screens[currentScreen].illustration];

    return (
        <div className="onboarding-container" style={{ background: screens[currentScreen].gradient }}>
            {/* Skip Button */}
            <button className="onboarding-skip" onClick={handleSkip}>
                Skip
            </button>

            {/* Content */}
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentScreen}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="onboarding-content"
                >
                    {/* Illustration with parallax background */}
                    <motion.div
                        className="onboarding-illustration-wrapper"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <CurrentIllustration />
                    </motion.div>

                    {/* Text Content */}
                    <motion.div
                        className="onboarding-text"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <h1>{screens[currentScreen].title}</h1>
                        <p>{screens[currentScreen].subtitle}</p>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="onboarding-navigation">
                {/* Dots */}
                <div className="onboarding-dots">
                    {screens.map((_, index) => (
                        <button
                            key={index}
                            className={`onboarding-dot ${index === currentScreen ? 'active' : ''}`}
                            onClick={() => {
                                setDirection(index > currentScreen ? 1 : -1);
                                setCurrentScreen(index);
                            }}
                        />
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="onboarding-buttons">
                    {currentScreen > 0 && (
                        <button className="onboarding-btn secondary" onClick={handlePrev}>
                            Back
                        </button>
                    )}
                    <button className="onboarding-btn primary" onClick={handleNext}>
                        {currentScreen === screens.length - 1 ? "Get Started" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Onboarding;
