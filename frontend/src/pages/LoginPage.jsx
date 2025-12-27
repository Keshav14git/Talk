import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, ArrowRight, Mail, Check } from "lucide-react";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

import { useGoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30); // 30 second timer
  const [canResend, setCanResend] = useState(false);

  const { sendOtp, verifyOtp, login, signup, googleLogin } = useAuthStore();
  const navigate = useNavigate();

  // Timer logic
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setIsLoading(true);
    // Use the real sendOtp action
    const success = await sendOtp(email);
    setIsLoading(false);

    if (success) {
      setStep(2);
      setTimer(30); // Reset timer on new send
      setCanResend(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Please enter valid code");

    setIsLoading(true);
    // Use the real verifyOtp action
    const success = await verifyOtp({ email, otp });
    setIsLoading(false);

    if (success) {
      // Login successful, authUser is updated in store
      // navigate("/"); // Optional, usually handled by App.jsx auth listener
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await googleLogin(tokenResponse.access_token);
    },
    onError: () => {
      toast.error("Google Login Cancelled");
    }
  });

  const handleGoogleLogin = () => {
    loginGoogle();
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] flex flex-col items-center">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="size-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
            <div className="text-white font-bold text-xl tracking-tighter">T</div>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Sign in to Talk</h1>
        </div>

        {/* Card */}
        <div className="w-full bg-[#111] rounded-2xl border border-[#222] p-8 shadow-2xl">

          {step === 1 ? (
            <div className="space-y-6">
              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full h-11 bg-white hover:bg-gray-200 text-black font-medium rounded-lg flex items-center justify-center gap-3 transition-colors"
                disabled={isLoading}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="size-5" />
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#222]"></div>
                </div>
                <div className="relative bg-[#111] px-3 text-xs text-gray-500 uppercase tracking-widest">Or</div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 ml-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@work-email.com"
                    className="w-full h-11 bg-[#1A1A1A] border border-[#333] rounded-lg px-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono text-sm"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#222] hover:bg-[#333] text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all border border-[#333] hover:border-[#444]"
                >
                  {isLoading ? <span className="text-xs">Sending code...</span> : (
                    <>
                      <span>Continue with Email</span>
                      <ArrowRight className="size-4 opacity-50" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Step 2: OTP */
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <h3 className="text-white font-medium">Check your email</h3>
                <p className="text-sm text-gray-500">We sent a verification code to <span className="text-gray-300">{email}</span></p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full h-12 bg-[#1A1A1A] border border-[#333] rounded-lg px-4 text-center text-white text-lg tracking-[0.5em] placeholder-gray-700 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                {isLoading ? (
                  <div className="py-4">
                    <Loader text="verifying code..." />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full h-11 bg-white hover:bg-gray-200 text-black font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Verify & Sign in
                  </button>
                )}

                <div className="flex flex-col items-center gap-2 mt-4">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-white hover:text-gray-300 transition-colors uppercase tracking-wider font-medium text-xs"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <p className="text-gray-600 font-mono text-xs">
                      Resend code in 00:{timer.toString().padStart(2, '0')}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-500 hover:text-gray-400 transition-colors text-xs"
                  >
                    Use a different email
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-600">
          By continuing, you agree to our <span className="text-gray-500 hover:text-gray-400 cursor-pointer">Terms</span> and <span className="text-gray-500 hover:text-gray-400 cursor-pointer">Privacy Policy</span>.
        </p>

      </div>
    </div>
  );
};
export default LoginPage;