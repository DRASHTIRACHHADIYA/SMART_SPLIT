import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Onboarding - Full-screen motion onboarding for new users
 * Shows 3 illustration-driven screens with parallax motion
 */

const screens = [
    {
        id: 1,
        title: "Track Shared Expenses",
        subtitle: "Split bills on trips, dinners, and everyday costs with friends",
        gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)",
        illustration: "travel"
    },
    {
        id: 2,
        title: "Smart Expense Categories",
        subtitle: "Auto-detect food, transport, entertainment and more",
        gradient: "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)",
        illustration: "food"
    },
    {
        id: 3,
        title: "Settle Up Instantly",
        subtitle: "See who owes what and settle balances with one tap",
        gradient: "linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)",
        illustration: "settle"
    }
];

// SVG Illustrations
const TravelIllustration = () => (
    <svg viewBox="0 0 400 300" className="onboarding-illustration">
        {/* Sky gradient background */}
        <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#87CEEB" />
                <stop offset="100%" stopColor="#E0F7FF" />
            </linearGradient>
        </defs>

        {/* Sun */}
        <motion.circle
            cx="320" cy="60" r="40"
            fill="#FFD700"
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: [0.8, 1, 0.8], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
            cx="320" cy="60" r="50"
            fill="#FFD700"
            opacity="0.3"
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Clouds - parallax effect */}
        <motion.g
            initial={{ x: -50 }}
            animate={{ x: 50 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        >
            <ellipse cx="80" cy="80" rx="40" ry="20" fill="white" opacity="0.9" />
            <ellipse cx="110" cy="80" rx="30" ry="18" fill="white" opacity="0.9" />
            <ellipse cx="60" cy="85" rx="25" ry="15" fill="white" opacity="0.9" />
        </motion.g>

        <motion.g
            initial={{ x: 30 }}
            animate={{ x: -30 }}
            transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        >
            <ellipse cx="250" cy="50" rx="35" ry="18" fill="white" opacity="0.8" />
            <ellipse cx="280" cy="55" rx="28" ry="14" fill="white" opacity="0.8" />
        </motion.g>

        {/* Airplane */}
        <motion.g
            initial={{ x: -100, y: 20 }}
            animate={{ x: 450, y: -30 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
            <path
                d="M0 15 L35 15 L40 8 L45 15 L55 15 L50 20 L55 25 L45 25 L40 32 L35 25 L0 25 L5 20 Z"
                fill="#2563eb"
            />
            {/* Contrail */}
            <motion.line
                x1="-60" y1="20" x2="0" y2="20"
                stroke="white"
                strokeWidth="2"
                opacity="0.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
            />
        </motion.g>

        {/* Beach/Mountains */}
        <path d="M0 200 Q100 160 200 190 T400 180 L400 300 L0 300 Z" fill="#f4d03f" />
        <path d="M0 220 Q80 200 150 220 T300 210 T400 220 L400 300 L0 300 Z" fill="#e9c46a" />

        {/* Palm tree */}
        <rect x="60" y="180" width="8" height="70" fill="#8B4513" />
        <motion.g
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "64px 180px" }}
        >
            <path d="M64 180 Q40 160 20 170" stroke="#228B22" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M64 180 Q50 150 30 150" stroke="#228B22" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M64 180 Q80 150 100 155" stroke="#228B22" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M64 180 Q90 160 110 170" stroke="#228B22" strokeWidth="8" fill="none" strokeLinecap="round" />
        </motion.g>

        {/* Ocean waves */}
        <motion.path
            d="M0 250 Q50 240 100 250 T200 250 T300 250 T400 250 L400 300 L0 300 Z"
            fill="#0ea5e9"
            animate={{
                d: [
                    "M0 250 Q50 240 100 250 T200 250 T300 250 T400 250 L400 300 L0 300 Z",
                    "M0 250 Q50 260 100 250 T200 250 T300 250 T400 250 L400 300 L0 300 Z"
                ]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
    </svg>
);

const FoodIllustration = () => (
    <svg viewBox="0 0 400 300" className="onboarding-illustration">
        {/* Table */}
        <ellipse cx="200" cy="260" rx="180" ry="30" fill="#8B4513" opacity="0.8" />
        <rect x="20" y="230" width="360" height="30" fill="#A0522D" rx="5" />

        {/* Plate */}
        <ellipse cx="200" cy="180" rx="90" ry="45" fill="#ffffff" />
        <ellipse cx="200" cy="180" rx="80" ry="38" fill="#f8f8f8" />
        <ellipse cx="200" cy="180" rx="70" ry="32" fill="#fff" />

        {/* Food items floating */}
        <motion.g
            initial={{ y: 0 }}
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Pizza slice */}
            <motion.g
                initial={{ rotate: -10 }}
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "80px 100px" }}
            >
                <path d="M50 120 L80 60 L110 120 Z" fill="#FFD93D" />
                <circle cx="70" cy="100" r="6" fill="#DC2626" />
                <circle cx="90" cy="95" r="5" fill="#DC2626" />
                <circle cx="80" cy="110" r="5" fill="#228B22" />
            </motion.g>
        </motion.g>

        {/* Burger */}
        <motion.g
            initial={{ y: 0 }}
            animate={{ y: [-8, 2, -8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
            <ellipse cx="320" cy="120" rx="35" ry="15" fill="#D2691E" />
            <rect x="285" y="105" width="70" height="15" fill="#228B22" />
            <rect x="288" y="95" width="64" height="12" fill="#8B4513" />
            <rect x="285" y="85" width="70" height="12" fill="#FFD700" />
            <ellipse cx="320" cy="85" rx="35" ry="12" fill="#DEB887" />
        </motion.g>

        {/* Coffee cup */}
        <motion.g
            initial={{ y: 0 }}
            animate={{ y: [-3, 6, -3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
            <rect x="130" y="85" width="45" height="60" rx="5" fill="#ffffff" />
            <rect x="135" y="90" width="35" height="10" fill="#6B4423" />
            {/* Steam */}
            <motion.path
                d="M145 75 Q148 65 145 55"
                stroke="#ddd"
                strokeWidth="2"
                fill="none"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.path
                d="M160 78 Q163 68 160 58"
                stroke="#ddd"
                strokeWidth="2"
                fill="none"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5], y: [0, -8, 0] }}
                transition={{ duration: 2.3, repeat: Infinity }}
            />
        </motion.g>

        {/* Receipt/Bill floating */}
        <motion.g
            initial={{ rotate: 15, y: 0 }}
            animate={{ rotate: [15, 20, 15], y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "340px 200px" }}
        >
            <rect x="310" y="170" width="60" height="80" fill="white" rx="3" />
            <line x1="320" y1="185" x2="360" y2="185" stroke="#ddd" strokeWidth="2" />
            <line x1="320" y1="200" x2="355" y2="200" stroke="#ddd" strokeWidth="2" />
            <line x1="320" y1="215" x2="350" y2="215" stroke="#ddd" strokeWidth="2" />
            <line x1="320" y1="235" x2="360" y2="235" stroke="#10b981" strokeWidth="3" />
        </motion.g>

        {/* Floating coins */}
        <motion.circle
            cx="50" cy="150"
            r="15"
            fill="#FFD700"
            stroke="#DAA520"
            strokeWidth="2"
            initial={{ y: 0, rotate: 0 }}
            animate={{ y: [-10, 10, -10], rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.text x="45" y="155" fontSize="12" fill="#DAA520" fontWeight="bold">₹</motion.text>
    </svg>
);

const SettleIllustration = () => (
    <svg viewBox="0 0 400 300" className="onboarding-illustration">
        {/* Background circle */}
        <circle cx="200" cy="150" r="120" fill="#10b981" opacity="0.1" />

        {/* People */}
        {/* Person 1 */}
        <motion.g
            initial={{ x: 0 }}
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
            <circle cx="100" cy="100" r="25" fill="#6366f1" />
            <circle cx="100" cy="100" r="20" fill="#818cf8" />
            {/* Face */}
            <circle cx="93" cy="95" r="3" fill="white" />
            <circle cx="107" cy="95" r="3" fill="white" />
            <path d="M92 108 Q100 115 108 108" stroke="white" strokeWidth="2" fill="none" />
            {/* Body */}
            <path d="M75 130 Q100 150 125 130" stroke="#6366f1" strokeWidth="15" fill="none" />
        </motion.g>

        {/* Person 2 */}
        <motion.g
            initial={{ x: 0 }}
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
            <circle cx="300" cy="100" r="25" fill="#f97316" />
            <circle cx="300" cy="100" r="20" fill="#fb923c" />
            {/* Face */}
            <circle cx="293" cy="95" r="3" fill="white" />
            <circle cx="307" cy="95" r="3" fill="white" />
            <path d="M292 108 Q300 115 308 108" stroke="white" strokeWidth="2" fill="none" />
            {/* Body */}
            <path d="M275 130 Q300 150 325 130" stroke="#f97316" strokeWidth="15" fill="none" />
        </motion.g>

        {/* Handshake / Connection */}
        <motion.g
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Connection line */}
            <motion.line
                x1="130" y1="120"
                x2="270" y2="120"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Checkmark in center */}
            <circle cx="200" cy="120" r="25" fill="#10b981" />
            <motion.path
                d="M188 120 L196 128 L215 109"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            />
        </motion.g>

        {/* Money flow arrows */}
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
            <path d="M140 140 L180 155" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead)" />
            <path d="M260 140 L220 155" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead)" />
        </motion.g>

        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
            </marker>
        </defs>

        {/* Balance card */}
        <motion.g
            initial={{ y: 0 }}
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <rect x="130" y="190" width="140" height="70" rx="10" fill="white" />
            <rect x="130" y="190" width="140" height="70" rx="10" stroke="#10b981" strokeWidth="2" fill="none" />
            <text x="200" y="215" textAnchor="middle" fontSize="12" fill="#64748b">Balance</text>
            <text x="200" y="245" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#10b981">₹0.00</text>
        </motion.g>

        {/* Celebration particles */}
        {[...Array(6)].map((_, i) => (
            <motion.circle
                key={i}
                cx={150 + i * 20}
                cy={280}
                r={4}
                fill={['#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4'][i]}
                initial={{ y: 0, opacity: 1 }}
                animate={{
                    y: [-50 - i * 10, 0],
                    opacity: [1, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut"
                }}
            />
        ))}
    </svg>
);

const illustrations = {
    travel: TravelIllustration,
    food: FoodIllustration,
    settle: SettleIllustration
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
