import { useState, useRef, useEffect } from "react";

/**
 * OTP Input Component
 * 6-digit OTP input with auto-focus and paste support
 */
function OTPInput({ length = 6, onComplete, disabled = false }) {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputRefs = useRef([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        if (disabled) return;

        // Only allow digits
        const digit = value.replace(/\D/g, "").slice(-1);

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Move to next input if digit entered
        if (digit && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }

        // Check if complete
        const otpString = newOtp.join("");
        if (otpString.length === length && !newOtp.includes("")) {
            onComplete(otpString);
        }
    };

    const handleKeyDown = (index, e) => {
        if (disabled) return;

        // Handle backspace
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1].focus();
            }
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
        }

        // Handle arrow keys
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1].focus();
        }
        if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        if (disabled) return;

        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);

        if (pastedData) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);

            // Focus last filled or next empty
            const focusIndex = Math.min(pastedData.length, length - 1);
            inputRefs.current[focusIndex].focus();

            // Check if complete
            if (pastedData.length === length) {
                onComplete(pastedData);
            }
        }
    };

    return (
        <div className="otp-container">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="otp-input"
                    autoComplete="one-time-code"
                />
            ))}
        </div>
    );
}

export default OTPInput;
