import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import { useNavigate } from "react-router-dom";
import {
  Mail, ArrowRight, Loader2, ShieldCheck,
  Building2, Users, LogIn, Lock
} from "lucide-react";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";

const SignUpPage = () => {
  const navigate = useNavigate();
  const {
    login, isSigningUp, isLoggingIn, authUser,
    sendOtp, verifyOtp, updateProfile, googleLogin
  } = useAuthStore();

  const { createOrg, joinOrg, isCreatingOrg, isJoiningOrg } = useOrgStore();

  // --- Animation State Machine ---
  // phases: 'BLANK' (0-2s) -> 'LOGO_FADE' (2-5s) -> 'SPLIT' (Final)
  const [introPhase, setIntroPhase] = useState("BLANK");

  // --- Auth Flow State ---
  // mode: 'SIGNUP' (New User) | 'LOGIN' (Returning)
  const [authMode, setAuthMode] = useState("SIGNUP");

  // Signup Wizard Steps: 'DETAILS' -> 'VERIFY' -> 'ROLE' -> 'ORG_ACTION'
  const [signupStep, setSignupStep] = useState("DETAILS");

  // --- Form Data ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    otp: "",
    orgName: "",
    joinCode: "",
    searchOrgName: ""
  });

  // --- Intro Animation Timing ---
  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase("LOGO_FADE"), 2000);
    const timer2 = setTimeout(() => setIntroPhase("SPLIT"), 5500);

    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  // --- Redirect Logic ---
  useEffect(() => {
    if (authUser?.lastActiveOrgId) {
      navigate("/");
    }
  }, [authUser, navigate]);


  // --- Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await googleLogin(tokenResponse.access_token);
    },
    onError: () => toast.error("Google Login Cancelled")
  });

  // -- Login Flow --
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return toast.error("Required fields missing");
    await login({ email: formData.email, password: formData.password });
  };

  // -- Signup Wizard Handlers --

  const handleStepDetails = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName) {
      return toast.error("Please fill all details");
    }
    const success = await sendOtp(formData.email);
    if (success) setSignupStep("VERIFY");
  };

  const handleStepVerify = async (e) => {
    e.preventDefault();
    if (!formData.otp) return toast.error("Enter OTP");

    const user = await verifyOtp({ email: formData.email, otp: formData.otp });

    if (user) {
      await updateProfile({
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      });
      setSignupStep("ROLE");
    }
  };

  const handleStepRole = async (e) => {
    e.preventDefault();
    if (!formData.role) return toast.error("Enter your role");

    await updateProfile({ role: formData.role });
    setSignupStep("ORG_ACTION");
  };

  const handleStepOrg = async (e) => {
    e.preventDefault();

    const isCreator = isCreatorRole();

    let success = false;
    if (isCreator) {
      if (!formData.orgName) return toast.error("Enter Organization Name");
      success = await createOrg(formData.orgName);
    } else {
      if (!formData.joinCode && !formData.searchOrgName) return toast.error("Enter Org Name or Join Code");
      success = await joinOrg({
        joinCode: formData.joinCode,
        orgName: formData.searchOrgName
      });
    }

    if (success) {
      window.location.reload();
    }
  };

  // Helpers
  const isCreatorRole = () => {
    const role = formData.role.toLowerCase();
    return ["ceo", "founder", "md", "managing director", "owner", "president"].includes(role);
  };


  // --- Renders ---

  // 1. BLANK PHASE
  if (introPhase === "BLANK") {
    return <div className="h-screen w-screen bg-black" />;
  }

  // 2. LOGO FADE PHASE
  if (introPhase === "LOGO_FADE") {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center animate-in fade-in duration-1000">
        {/* Center Logo */}
        <img src="/Orchestr (3).png" alt="Orchestr" className="w-32 opacity-90 grayscale hover:grayscale-0 transition-all duration-700" />
      </div>
    );
  }

  // 3. SPLIT PHASE (Main UI)
  return (
    <div className="min-h-screen bg-black flex relative overflow-hidden font-sans selection:bg-white/20">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle glow trails */}
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-white/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/[0.05] rounded-full blur-[120px]" />
      </div>

      {/* LEFT SIDE: FORM CONTAINER */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-8 lg:px-24 z-20 animate-in slide-in-from-left duration-1000 ease-out">

        <div className="max-w-md w-full mx-auto">
          {/* Minimal Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-medium text-white mb-2 tracking-tight">
              {authMode === 'SIGNUP' ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-[#8A8F98]">
              {authMode === 'SIGNUP' ? 'Start your workspace journey' : 'Enter your workspace'}
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={() => loginGoogle()}
            className="w-full h-12 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] hover:border-[#444] text-white font-medium rounded-lg flex items-center justify-center gap-3 transition-all mb-8 group"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="size-5 opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="text-sm">Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#222]"></div></div>
            <div className="relative bg-black px-3 text-[10px] text-[#444] uppercase tracking-widest font-medium">Or</div>
          </div>

          {/* LOGIN FORM */}
          {authMode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#8A8F98]">Email</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg py-3 px-4 text-white text-sm placeholder-[#444] focus:border-[#444] focus:ring-1 focus:ring-[#333] focus:outline-none transition-all"
                  placeholder="you@company.com" required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#8A8F98]">Password</label>
                <input
                  type="password" name="password" value={formData.password} onChange={handleInputChange}
                  className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg py-3 px-4 text-white text-sm placeholder-[#444] focus:border-[#444] focus:ring-1 focus:ring-[#333] focus:outline-none transition-all"
                  placeholder="••••••••" required
                />
              </div>
              <button disabled={isLoggingIn} className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3.5 rounded-lg transition-all mt-2 flex items-center justify-center text-sm">
                {isLoggingIn ? <Loader2 className="animate-spin size-4" /> : "Sign In"}
              </button>

              <p className="text-center text-[#666] text-xs mt-6">
                Don't have an account? <button type="button" onClick={() => setAuthMode('SIGNUP')} className="text-white hover:underline ml-1">Sign Up</button>
              </p>
            </form>
          )}

          {/* SIGNUP WIZARD */}
          {authMode === 'SIGNUP' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">

              {/* STEP 1: DETAILS */}
              {signupStep === 'DETAILS' && (
                <form onSubmit={handleStepDetails} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#8A8F98]">First Name</label>
                      <input
                        type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg py-3 px-4 text-white text-sm placeholder-[#444] focus:border-[#444] focus:ring-1 focus:ring-[#333] focus:outline-none transition-all"
                        placeholder="John" required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#8A8F98]">Last Name</label>
                      <input
                        type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg py-3 px-4 text-white text-sm placeholder-[#444] focus:border-[#444] focus:ring-1 focus:ring-[#333] focus:outline-none transition-all"
                        placeholder="Doe" required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#8A8F98]">Work Email</label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleInputChange}
                      className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg py-3 px-4 text-white text-sm placeholder-[#444] focus:border-[#444] focus:ring-1 focus:ring-[#333] focus:outline-none transition-all"
                      placeholder="you@company.com" required
                    />
                  </div>
                  <button disabled={isSigningUp || isLoggingIn} className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3.5 rounded-lg transition-all mt-4 flex items-center justify-center text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    {isSigningUp || isLoggingIn ? <Loader2 className="animate-spin size-4" /> : "Verify Email"}
                  </button>
                  <p className="text-center text-[#666] text-xs mt-6">
                    Already registered? <button type="button" onClick={() => setAuthMode('LOGIN')} className="text-white hover:underline ml-1">Log In</button>
                  </p>
                </form>
              )}

              {/* STEP 2: VERIFY OTP */}
              {signupStep === 'VERIFY' && (
                <form onSubmit={handleStepVerify} className="space-y-8">
                  <div className="text-center">
                    <span className="text-[#666] text-xs uppercase tracking-widest font-medium">Verification</span>
                    <h3 className="text-lg text-white font-medium mt-2">Check your inbox</h3>
                    <p className="text-sm text-[#666] mt-1">We sent a code to {formData.email}</p>
                  </div>
                  <input
                    type="text" name="otp" value={formData.otp} onChange={handleInputChange} autoFocus
                    className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg py-4 text-center text-3xl tracking-[0.5em] text-white font-mono placeholder-[#333] focus:border-[#444] focus:ring-1 focus:ring-[#333] focus:outline-none transition-all"
                    placeholder="••••••" maxLength={6} required
                  />
                  <div className="space-y-3">
                    <button disabled={isSigningUp || isLoggingIn} className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center text-sm">
                      {isSigningUp || isLoggingIn ? <Loader2 className="animate-spin size-4" /> : "Confirm Code"}
                    </button>
                    <button type="button" onClick={() => setSignupStep('DETAILS')} className="w-full text-xs text-[#666] hover:text-white transition-colors">Change Email</button>
                  </div>
                </form>
              )}

              {/* STEP 3: ROLE */}
              {signupStep === 'ROLE' && (
                <form onSubmit={handleStepRole} className="space-y-6">
                  <div className="mb-6">
                    <span className="text-[#666] text-xs uppercase tracking-widest font-medium">Your Role</span>
                    <h3 className="text-xl text-white font-medium mt-2">What do you do?</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#8A8F98]">Job Title / Designation</label>
                    <input
                      type="text" name="role" value={formData.role} onChange={handleInputChange} autoFocus
                      className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg py-3.5 px-4 text-white text-sm placeholder-[#444] focus:border-[#444] focus:ring-1 focus:ring-[#333] focus:outline-none transition-all"
                      placeholder="e.g. Founder, Developer, Visual Designer..." required
                    />
                  </div>
                  <button disabled={isLoggingIn} className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3.5 rounded-lg transition-all mt-2 flex items-center justify-center text-sm group">
                    {isLoggingIn ? <Loader2 className="animate-spin size-4" /> : <span className="flex items-center gap-2">Continue <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" /></span>}
                  </button>
                </form>
              )}

              {/* STEP 4: ORG SETUP */}
              {signupStep === 'ORG_ACTION' && (
                <form onSubmit={handleStepOrg} className="space-y-8">
                  <div className="mb-4">
                    <span className="text-[#666] text-xs uppercase tracking-widest font-medium">Workspace</span>
                    <h3 className="text-xl text-white font-semibold mt-2">
                      {isCreatorRole() ? "Setup your HQ" : "Join your team"}
                    </h3>
                  </div>

                  {isCreatorRole() ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-[#0A0A0A] border border-[#222] rounded-lg flex items-start gap-4">
                        <div className="p-2 bg-[#151515] rounded-md border border-[#222]"><ShieldCheck className="size-5 text-white" /></div>
                        <div>
                          <h4 className="text-sm font-medium text-white">Create New Organization</h4>
                          <p className="text-xs text-[#666] mt-1 leading-relaxed">As a {formData.role}, you'll be the Admin of this new workspace.</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#8A8F98]">Organization Name</label>
                        <input
                          type="text" name="orgName" value={formData.orgName} onChange={handleInputChange}
                          className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg py-3.5 px-4 text-white text-sm placeholder-[#444] focus:border-[#444] focus:ring-1 focus:ring-[#333] focus:outline-none transition-all"
                          placeholder="Acme Corp" required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#8A8F98]">Search Organization</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-3.5 size-4 text-[#444]" />
                          <input
                            type="text" name="searchOrgName" value={formData.searchOrgName} onChange={handleInputChange}
                            className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg py-3.5 pl-11 pr-4 text-white text-sm placeholder-[#444] focus:border-[#444] focus:ring-1 focus:ring-[#333] focus:outline-none transition-all"
                            placeholder="Search by name..."
                          />
                        </div>
                      </div>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#222]"></div></div>
                        <div className="relative bg-black px-3 text-[10px] text-[#444] uppercase tracking-widest font-medium">Or</div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#8A8F98]">Join Code</label>
                        <div className="relative">
                          <LogIn className="absolute left-4 top-3.5 size-4 text-[#444]" />
                          <input
                            type="text" name="joinCode" value={formData.joinCode} onChange={handleInputChange}
                            className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg py-3.5 pl-11 pr-4 text-white text-sm placeholder-[#444] focus:border-[#444] focus:ring-1 focus:ring-[#333] focus:outline-none transition-all"
                            placeholder="e.g. XYZ-123"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button disabled={isCreatingOrg || isJoiningOrg} className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3.5 rounded-lg transition-all mt-4 flex items-center justify-center text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    {isCreatingOrg || isJoiningOrg ? <Loader2 className="animate-spin size-4" /> : (isCreatorRole() ? "Launch Workspace" : "Join Workspace")}
                  </button>
                </form>
              )}

            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: LOGO / BRANDING */}
      {/* Animation: Slide in from Right */}
      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative animate-in slide-in-from-right duration-1000 ease-out border-l border-[#111]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#111] via-black to-black opacity-50" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Main Logo Display */}
          <div className="relative group cursor-default">
            <div className="absolute -inset-4 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <img src="/Orchestr (3).png" alt="Orchestr" className="w-56 h-auto drop-shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700" />
          </div>

          <div className="mt-12 text-center space-y-2 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-forwards">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Orchestr</h2>
            <p className="text-[#666] text-sm">Synchronize your team's workflow.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;