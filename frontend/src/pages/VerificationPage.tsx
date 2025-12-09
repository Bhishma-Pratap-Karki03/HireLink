import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/VerificationPage.css";

// Define TypeScript interfaces for API responses
interface VerificationResponse {
  message: string;
  success?: boolean;
  codeExpired?: boolean;
  resetToken?: string;
  verified?: boolean;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
}

interface StatusResponse {
  isVerified: boolean;
  hasPendingVerification?: boolean;
  expiresAt?: string;
  timeLeft?: number;
  isExpired?: boolean;
}

const VerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"success" | "error">("error");
  const [timer, setTimer] = useState<number>(0);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email and message from location state
  const userEmail = location.state?.email || "";
  const initialMessage = location.state?.message || "";
  const fromLogin = location.state?.fromLogin || false;
  const isPasswordReset = location.state?.isPasswordReset || false;

  // Check if this is for email verification or password reset
  const isVerificationType = !isPasswordReset;

  const checkVerificationStatus = async () => {
    if (!userEmail || isPasswordReset) return;

    setIsCheckingStatus(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/verify/check-status?email=${encodeURIComponent(
          userEmail
        )}`
      );
      const data: StatusResponse = await response.json();

      if (response.ok) {
        if (data.isVerified) {
          // User already verified, redirect to login
          navigate("/login", {
            state: { message: "Email already verified. Please login." },
          });
          return;
        }

        // Set timer from server data
        if (data.timeLeft && data.timeLeft > 0) {
          setTimer(data.timeLeft);
          setCanResend(false);
        } else {
          // Code expired or no code
          setTimer(0);
          setCanResend(data.hasPendingVerification || data.isExpired || false);
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Initialize timer and check verification status
  useEffect(() => {
    if (userEmail && !isPasswordReset) {
      checkVerificationStatus();
    } else {
      // For password reset or no email, set default timer
      setTimer(300);
      setCanResend(false);
      setIsCheckingStatus(false);
    }

    if (initialMessage) {
      setStatusMessage(initialMessage);
      setStatusType(fromLogin ? "error" : "success");
    }

    // Focus first input
    if (inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [userEmail, initialMessage, fromLogin, isPasswordReset]);

  // Timer countdown - sync with server every second for verification
  useEffect(() => {
    let interval: ReturnType<typeof setTimeout> | undefined;
    let syncInterval: ReturnType<typeof setTimeout> | undefined;

    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 500);
    }

    // Sync with server every 30 seconds to ensure accuracy (only for verification, not password reset)
    if (userEmail && !isPasswordReset && !isCheckingStatus) {
      syncInterval = setInterval(() => {
        checkVerificationStatus();
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [timer, canResend, userEmail, isPasswordReset, isCheckingStatus]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newCode = [...verificationCode];

      digits.forEach((digit, index) => {
        if (index < 6) newCode[index] = digit;
      });

      setVerificationCode(newCode);
      const lastIndex = Math.min(5, digits.length - 1);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join("");

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setStatusMessage("Please enter a valid 6-digit verification code");
      setStatusType("error");
      return;
    }

    if (!userEmail) {
      setStatusMessage("Email not found. Please try again.");
      setStatusType("error");
      return;
    }

    setIsLoading(true);
    setStatusMessage("");

    try {
      let response: Response;
      let data: VerificationResponse;

      if (isVerificationType) {
        // Email verification flow
        response = await fetch(
          "http://localhost:5000/api/verify/verify-email",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              code: code,
            }),
          }
        );

        data = await response.json();

        if (!response.ok) {
          if (data.codeExpired) {
            setStatusMessage("Code expired. Please request a new one.");
            setCanResend(true);
            setTimer(0);
            // Refresh status to get updated expiration
            if (!isPasswordReset) {
              checkVerificationStatus();
            }
          } else {
            setStatusMessage(data.message || "Invalid verification code");
          }
          setStatusType("error");
          setIsLoading(false);
          return;
        }

        // Verification successful
        setStatusMessage(
          "Email verified successfully! Welcome to HireLink. Check your email for welcome message."
        );
        setStatusType("success");
        setTimer(0);
        setCanResend(false);

        // Redirect to login after 3 seconds with success message
        setTimeout(() => {
          navigate("/login", {
            state: {
              message: `Welcome to HireLink! Your email has been verified successfully. You can now login.`,
              verifiedSuccess: true,
              userEmail: userEmail,
            },
          });
        }, 500);
      } else {
        // Password reset verification flow
        response = await fetch(
          "http://localhost:5000/api/password/verify-code",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              code: code,
            }),
          }
        );

        data = await response.json();

        if (!response.ok) {
          if (data.codeExpired) {
            setStatusMessage("Reset code expired. Please request a new one.");
            setCanResend(true);
            setTimer(0);
          } else {
            setStatusMessage(data.message || "Invalid reset code");
          }
          setStatusType("error");
          setIsLoading(false);
          return;
        }

        // Reset code verified successfully
        setStatusMessage(
          "Reset code verified! Redirecting to set new password..."
        );
        setStatusType("success");

        // Redirect to new password page with token
        setTimeout(() => {
          navigate("/reset-password", {
            state: {
              email: userEmail,
              token: data.resetToken,
              message: "Please enter your new password",
            },
          });
        }, 500);
      }
    } catch (error) {
      setStatusMessage("An error occurred. Please try again.");
      setStatusType("error");
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !userEmail || isResending) return;

    setIsResending(true);
    setStatusMessage("");

    try {
      let response: Response;
      let data: VerificationResponse;

      if (isVerificationType) {
        // Resend verification code
        response = await fetch(
          "http://localhost:5000/api/verify/resend-verification",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail }),
          }
        );
      } else {
        // Resend password reset code
        response = await fetch(
          "http://localhost:5000/api/password/resend-code",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail }),
          }
        );
      }

      data = await response.json();

      if (!response.ok) {
        setStatusMessage(data.message || "Failed to resend code");
        setStatusType("error");
        setIsResending(false);
        return;
      }

      // Resend successful
      setStatusMessage(
        isVerificationType
          ? "New verification code sent to your email!"
          : "New reset code sent to your email!"
      );
      setStatusType("success");

      // For verification, refresh status; for password reset, set timer
      if (isVerificationType) {
        await checkVerificationStatus();
      } else {
        // Reset timer (5 minutes = 300 seconds)
        setTimer(300);
        setCanResend(false);
      }

      // Clear inputs
      setVerificationCode(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      setStatusMessage("Failed to resend code. Please try again.");
      setStatusType("error");
      console.error("Resend error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isCodeComplete = verificationCode.every((digit) => digit !== "");

  return (
    <>
      <Navbar />

      <section id="section-verification">
        <div className="verification-card">
          <div className="verification-content">
            <header className="verification-header">
              <h1 className="title">
                {isVerificationType
                  ? "Enter Verification Code"
                  : "Enter Reset Code"}
              </h1>
              <div className="separator">
                <div className="line-gray"></div>
                <div className="line-blue"></div>
              </div>
            </header>

            <p className="instruction-text">
              {userEmail ? (
                <>
                  Please enter 6-digit code sent to{" "}
                  <strong style={{ color: "#0068ce" }}>{userEmail}</strong>
                </>
              ) : (
                "Please enter 6-digit code sent to your email address."
              )}
            </p>

            <div className="code-inputs">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className="input-box"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                />
              ))}
            </div>

            {statusMessage && (
              <div className={`status-message ${statusType}`}>
                {statusMessage}
              </div>
            )}

            <button
              className={`verify-button ${
                !isCodeComplete || isLoading ? "disabled" : ""
              }`}
              onClick={handleVerify}
              disabled={!isCodeComplete || isLoading}
            >
              {isLoading
                ? "Verifying..."
                : isVerificationType
                ? "Verify Account"
                : "Verify Code"}
            </button>

            {/* Timer display below verify button */}
            {timer > 0 && (
              <div
                style={{
                  color: "#666",
                  fontSize: "14px",
                  marginTop: "12px",
                  textAlign: "center",
                }}
              >
                Code expires in:{" "}
                <strong style={{ color: "#0068ce" }}>
                  {formatTime(timer)}
                </strong>
              </div>
            )}

            <div className="footer-links">
              {canResend && (
                <button
                  className={`link-action ${isResending ? "disabled" : ""}`}
                  onClick={handleResendCode}
                  disabled={isResending}
                >
                  {isResending
                    ? "Sending..."
                    : isVerificationType
                    ? "Resend Verification Code"
                    : "Resend Reset Code"}
                </button>
              )}

              {isVerificationType ? (
                <>
                  <Link to="/register" className="link-action">
                    Back to Register Page
                  </Link>
                  <Link to="/login" className="link-action">
                    Back to Login Page
                  </Link>
                </>
              ) : (
                <Link to="/forgot-password" className="link-action">
                  Back to Forgot Password
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default VerificationPage;
