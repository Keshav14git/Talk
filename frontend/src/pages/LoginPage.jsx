import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, Lock, KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  // Steps: 
  // 1: Enter Email (or check PIN mode)
  // 2: Enter PIN (Fast Login)
  // 3: Enter OTP (Fallback/New Device)
  // 4: Set Fast PIN (After successful OTP login)
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]); // 4 digit PIN array
  const [setupPin, setSetupPin] = useState(["", "", "", ""]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const { authUser, sendOtp, verifyOtp, registerDevicePin, loginWithPin, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  // Initialization: Check if this device is registered
  useEffect(() => {
    const savedEmail = localStorage.getItem("lastLoggedInEmail");
    let deviceId = localStorage.getItem("orchestr_deviceId");
    
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("orchestr_deviceId", deviceId);
    }

    if (savedEmail) {
      setEmail(savedEmail);
      setStep(2); // Jump to PIN Pad
    }
  }, []);

  // Redirect if already authenticated and has a workspace, but ONLY if they are not in the middle of PIN setup
  useEffect(() => {
    if (authUser && authUser.lastActiveOrgId && step !== 4 && step !== 3) {
      navigate("/");
    }
  }, [authUser, step, navigate]);

  // Timer logic for OTP
  useEffect(() => {
    let interval;
    if (step === 3 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (step === 3 && timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- Handlers ---

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setIsLoading(true);
    const success = await sendOtp(email);
    setIsLoading(false);

    if (success) {
      setStep(3);
      setTimer(30);
      setCanResend(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Please enter valid code");

    setIsLoading(true);
    const user = await verifyOtp({ email, otp });
    setIsLoading(false);

    if (user) {
      // Save email for next time
      localStorage.setItem("lastLoggedInEmail", email);
      
      const currentDeviceId = localStorage.getItem("orchestr_deviceId");
      const hasPin = user.devices?.some(d => d.deviceId === currentDeviceId);

      if (hasPin) {
        await checkAuth(); // Sync full state
        navigate("/");
      } else {
        setStep(4);
      }
    }
  };

  const handleSetFastPin = async (e) => {
    e.preventDefault();
    const finalPin = setupPin.join("");
    if (finalPin.length < 4) return toast.error("PIN must be 4 digits");

    setIsLoading(true);
    const deviceId = localStorage.getItem("orchestr_deviceId");
    const deviceName = navigator.userAgent.substring(0, 30); // Simple device name

    const success = await registerDevicePin({ deviceId, pin: finalPin, deviceName });
    setIsLoading(false);

    if (success) {
      await checkAuth(); // Sync full data
      navigate("/"); // Done, go to workspace
    }
  };

  const handlePinLogin = async (e) => {
    e.preventDefault();
    const finalPin = pin.join("");
    if (finalPin.length < 4) return toast.error("Enter your 4-digit PIN");

    setIsLoading(true);
    const deviceId = localStorage.getItem("orchestr_deviceId");
    
    const result = await loginWithPin({ email, deviceId, pin: finalPin });
    setIsLoading(false);

    if (result && result.success) {
      await checkAuth();
      navigate("/"); // Success!
    } else {
      setPin(["", "", "", ""]); // Reset pin inputs on fail
      if (result && result.message && result.message.includes("not registered")) {
        setStep(1); // Fallback to email step
      }
    }
  };

  const handlePinChange = (index, value, isSetup = false) => {
    if (value.length > 1) value = value[value.length - 1]; // Only 1 char
    if (!/^\d*$/.test(value)) return; // Only numbers

    const currentPinArr = isSetup ? [...setupPin] : [...pin];
    currentPinArr[index] = value;
    
    if (isSetup) setSetupPin(currentPinArr);
    else setPin(currentPinArr);

    // Auto focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${isSetup ? 'setup' : 'login'}-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const switchAccount = () => {
    localStorage.removeItem("lastLoggedInEmail");
    setEmail("");
    setPin(["", "", "", ""]);
    setStep(1);
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] flex flex-col lg:flex-row items-center justify-center p-4">


      <div className="w-full max-w-[420px] flex flex-col z-10">
        
        {/* Logo Header */}
        <div className="mb-10 text-center flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <img src="/Orchestr (3).png" alt="Orchestr" className="w-48 mb-2" />
        </div>

        {/* Card */}
        <div className="w-full bg-[#111] rounded-2xl border border-[#222] p-8 shadow-2xl relative">
          
          {/* STEP 1: Email Input */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-2">
                <h2 className="text-xl font-medium text-white tracking-tight">Sign In</h2>
                <p className="text-sm text-gray-500 mt-1">Access your Orchestr workspace</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 ml-1">Email address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full h-12 bg-[#1A1A1A] border border-[#333] rounded-lg px-4 pl-11 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-all font-mono text-sm"
                      autoFocus
                    />
                    <Mail className="absolute left-4 top-4 size-4 text-gray-500" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
                >
                  {isLoading ? <Loader2 className="animate-spin size-4" /> : (
                    <>
                      <span>Continue with Email</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: PIN Login (Fast Returning User) */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="size-16 bg-[#1A1A1A] rounded-full mx-auto mb-4 border border-[#333] flex items-center justify-center">
                   <KeyRound className="size-7 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-medium text-white tracking-tight">Welcome Back</h2>
                <p className="text-sm text-gray-400 mt-1 truncate px-4">{email}</p>
              </div>

              <form onSubmit={handlePinLogin} className="space-y-8">
                <div className="flex justify-center gap-3">
                  {pin.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`pin-login-${idx}`}
                      type="password"
                      value={digit}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      className="w-14 h-16 bg-[#1A1A1A] border border-[#333] rounded-xl text-center text-2xl font-bold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || pin.join("").length < 4}
                  className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 disabled:bg-[#222] disabled:text-gray-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  {isLoading ? <Loader2 className="animate-spin size-4" /> : "Unlock Workspace"}
                </button>
              </form>
              
              <div className="flex flex-col items-center gap-3 pt-4 border-t border-[#222]">
                <button onClick={() => setStep(3)} className="text-xs text-gray-400 hover:text-white transition-colors">
                  Forgot PIN? Log in with Email code instead
                </button>
                <button onClick={switchAccount} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  Not your account? Switch user
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OTP Verification */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <div className="size-12 bg-[#1A1A1A] rounded-full mx-auto mb-4 border border-[#333] flex items-center justify-center">
                   <Mail className="size-5 text-gray-300" />
                </div>
                <h2 className="text-xl font-medium text-white tracking-tight">Check your email</h2>
                <p className="text-sm text-gray-500">We sent a verification code to <br/><span className="text-gray-300 font-medium">{email}</span></p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full h-14 bg-[#1A1A1A] border border-[#333] rounded-xl px-4 text-center text-white text-xl tracking-[0.5em] placeholder-gray-700 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full h-12 bg-white hover:bg-gray-200 disabled:bg-[#222] disabled:text-gray-500 text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  {isLoading ? <Loader2 className="animate-spin size-4" /> : "Verify & Continue"}
                </button>

                <div className="flex flex-col items-center gap-3 pt-2">
                  {canResend ? (
                    <button type="button" onClick={handleSendOtp} className="text-indigo-400 hover:text-indigo-300 text-xs font-medium uppercase tracking-wider">
                      Resend Code
                    </button>
                  ) : (
                    <p className="text-gray-600 font-mono text-xs">
                      Resend code in 00:{timer.toString().padStart(2, '0')}
                    </p>
                  )}
                  <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-400 text-xs mt-2">
                    Use a different email
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: Set Fast PIN */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="text-center space-y-2">
                <div className="size-16 bg-green-500/10 rounded-full mx-auto mb-2 border border-green-500/20 flex items-center justify-center">
                   <CheckCircle2 className="size-8 text-green-500" />
                </div>
                <h2 className="text-xl font-medium text-white tracking-tight">Verified!</h2>
                <p className="text-sm text-gray-400 mt-2 px-2">Set a 4-digit PIN for lightning-fast login on this device next time.</p>
              </div>

              <form onSubmit={handleSetFastPin} className="space-y-8 pt-4">
                 <div className="flex justify-center gap-3">
                  {setupPin.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`pin-setup-${idx}`}
                      type="password"
                      value={digit}
                      onChange={(e) => handlePinChange(idx, e.target.value, true)}
                      className="w-14 h-16 bg-[#1A1A1A] border border-[#333] rounded-xl text-center text-2xl font-bold text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || setupPin.join("").length < 4}
                  className="w-full h-12 bg-green-600 hover:bg-green-500 disabled:bg-[#222] disabled:text-gray-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  {isLoading ? <Loader2 className="animate-spin size-4" /> : "Save PIN & Enter"}
                </button>
                
                <div className="text-center">
                  <button type="button" onClick={async () => { await checkAuth(); navigate("/"); }} className="text-xs text-gray-500 hover:text-gray-400">
                    Skip for now
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500">
            Don't have an account? <Link to="/signup" className="text-white hover:underline font-medium">Sign Up</Link>
          </p>
          <p className="text-xs text-center text-gray-700">
            Secure, zero-knowledge architectural access.
          </p>
        </div>

      </div>
    </div>
  );
};
export default LoginPage;