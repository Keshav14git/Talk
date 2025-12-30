import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import { useNavigate } from "react-router-dom";
import {
  Mail, User, Briefcase, ArrowRight, Loader2, ShieldCheck,
  Building2, Users, LogIn, Lock
} from "lucide-react";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";

const SignUpPage = () => {
  const navigate = useNavigate();
  const {
    signup, login, isSigningUp, isLoggingIn, authUser,
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
    password: "", // Only for login if basic auth used
    role: "",
    otp: "",
    orgName: "", // For creating org
    joinCode: "", // For joining org
    searchOrgName: "" // For searching org to join
  });

  // --- Intro Animation Timing ---
  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase("LOGO_FADE"), 2000); // 2s Blank
    const timer2 = setTimeout(() => setIntroPhase("SPLIT"), 6000);     // 4s Logo (Total 6s)

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
    // Trigger OTP
    const success = await sendOtp(formData.email);
    if (success) setSignupStep("VERIFY");
  };

  const handleStepVerify = async (e) => {
    e.preventDefault();
    if (!formData.otp) return toast.error("Enter OTP");

    // Verify OTP - this creates/logs in the user in backend
    const user = await verifyOtp({ email: formData.email, otp: formData.otp });

    if (user) {
      // Update basic profile immediately
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

    const roleLower = formData.role.toLowerCase();
    const isCreator = ["ceo", "founder", "md", "managing director", "owner", "president"].includes(roleLower);

    let success = false;
    if (isCreator) {
      if (!formData.orgName) return toast.error("Enter Organization Name");
      success = await createOrg(formData.orgName);
    } else {
      // Simple join logic for now - either by code or name
      // Prioritizing Join Code if available, else Name
      if (!formData.joinCode && !formData.searchOrgName) return toast.error("Enter Org Name or Join Code");

      success = await joinOrg({
        joinCode: formData.joinCode,
        orgName: formData.searchOrgName
      });
    }

    if (success) {
      // Force refresh or nav handled by auth store listener/useEffect
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
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-2xl">
          <Briefcase className="size-16 text-indigo-500 animate-pulse" />
        </div>
      </div>
    );
  }

  // 3. SPLIT PHASE (Main UI)
  return (
    <div className="min-h-screen bg-[#050505] flex relative overflow-hidden font-sans">

      {/* LEFT SIDE: FORM CONTAINER */}
      {/* Animation: Slide in from Left */}
      <div className="w-full lg:w-1/2 h-full absolute lg:relative z-20 flex flex-col justify-center px-8 lg:px-20 animate-in slide-in-from-left duration-1000 bg-[#050505]/95 backdrop-blur-md lg:bg-transparent">

        <div className="max-w-md w-full mx-auto">
          {/* Header / Toggle Auth Mode */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              {authMode === 'SIGNUP' ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-400">
              {authMode === 'SIGNUP' ? 'Start your workspace journey' : 'Enter your workspace'}
            </p>
          </div>

          {/* Google Sign In (Always Visible) */}
          <button
            onClick={() => loginGoogle()}
            className="w-full h-14 bg-white hover:bg-gray-100 text-black font-medium rounded-xl flex items-center justify-center gap-3 transition-colors mb-8"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="size-5" />
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
            <div className="relative bg-[#050505] px-3 text-xs text-gray-500 uppercase tracking-widest">Or</div>
          </div>

          {/* LOGIN FORM */}
          {authMode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 size-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleInputChange}
                    className="w-full bg-[#111] border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-all"
                    placeholder="you@company.com" required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 size-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password" name="password" value={formData.password} onChange={handleInputChange}
                    className="w-full bg-[#111] border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-all"
                    placeholder="••••••••" required
                  />
                </div>
              </div>
              <button disabled={isLoggingIn} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mt-2 flex items-center justify-center">
                {isLoggingIn ? <Loader2 className="animate-spin" /> : "Sign In"}
              </button>

              <p className="text-center text-gray-500 text-sm mt-4">
                Don't have an account? <span onClick={() => setAuthMode('SIGNUP')} className="text-indigo-400 cursor-pointer hover:underline">Sign Up</span>
              </p>
            </form>
          )}

          {/* SIGNUP WIZARD */}
          {authMode === 'SIGNUP' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">

              {/* STEP 1: DETAILS */}
              {signupStep === 'DETAILS' && (
                <form onSubmit={handleStepDetails} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 ml-1">First Name</label>
                      <input
                        type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                        className="w-full bg-[#111] border border-gray-800 rounded-xl py-3.5 px-4 text-white focus:border-indigo-500 focus:outline-none transition-all"
                        placeholder="John" required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 ml-1">Last Name</label>
                      <input
                        type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                        className="w-full bg-[#111] border border-gray-800 rounded-xl py-3.5 px-4 text-white focus:border-indigo-500 focus:outline-none transition-all"
                        placeholder="Doe" required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 ml-1">Work Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 size-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="email" name="email" value={formData.email} onChange={handleInputChange}
                        className="w-full bg-[#111] border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-all"
                        placeholder="you@company.com" required
                      />
                    </div>
                  </div>
                  <button disabled={isSigningUp || isLoggingIn} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mt-4 flex items-center justify-center">
                    {isSigningUp || isLoggingIn ? <Loader2 className="animate-spin" /> : "Verify Email"}
                  </button>
                  <p className="text-center text-gray-500 text-sm mt-4">
                    Already registered? <span onClick={() => setAuthMode('LOGIN')} className="text-indigo-400 cursor-pointer hover:underline">Log In</span>
                  </p>
                </form>
              )}

              {/* STEP 2: VERIFY OTP */}
              {signupStep === 'VERIFY' && (
                <form onSubmit={handleStepVerify} className="space-y-6">
                  <div className="text-center mb-4">
                    <span className="text-indigo-400 text-sm font-medium">Step 2/4: Verification</span>
                    <h3 className="text-xl text-white font-semibold mt-2">Check your inbox</h3>
                    <p className="text-sm text-gray-500">Code sent to {formData.email}</p>
                  </div>
                  <input
                    type="text" name="otp" value={formData.otp} onChange={handleInputChange} autoFocus
                    className="w-full bg-[#111] border border-gray-800 rounded-xl py-4 text-center text-2xl tracking-[0.5em] text-white font-mono focus:border-green-500 focus:outline-none transition-all"
                    placeholder="••••••" maxLength={6} required
                  />
                  <button disabled={isSigningUp || isLoggingIn} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center">
                    {isSigningUp || isLoggingIn ? <Loader2 className="animate-spin" /> : "Confirm Code"}
                  </button>
                  <button type="button" onClick={() => setSignupStep('DETAILS')} className="w-full text-xs text-gray-500 hover:text-white">Change Email</button>
                </form>
              )}

              {/* STEP 3: ROLE */}
              {signupStep === 'ROLE' && (
                <form onSubmit={handleStepRole} className="space-y-6">
                  <div className="text-center mb-4">
                    <span className="text-indigo-400 text-sm font-medium">Step 3/4: Your Role</span>
                    <h3 className="text-xl text-white font-semibold mt-2">What do you do?</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 ml-1">Job Title</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-3.5 size-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="text" name="role" value={formData.role} onChange={handleInputChange} autoFocus
                        className="w-full bg-[#111] border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-all"
                        placeholder="e.g. Founder, Developer, Designer..." required
                      />
                    </div>
                  </div>
                  <button disabled={isLoggingIn} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                    {isLoggingIn ? <Loader2 className="animate-spin" /> : "Continue"}
                  </button>
                </form>
              )}

              {/* STEP 4: ORG SETUP */}
              {signupStep === 'ORG_ACTION' && (
                <form onSubmit={handleStepOrg} className="space-y-6">
                  <div className="text-center mb-4">
                    <span className="text-indigo-400 text-sm font-medium">Step 4/4: Workspace</span>
                    <h3 className="text-xl text-white font-semibold mt-2">
                      {isCreatorRole() ? "Setup your HQ" : "Join your team"}
                    </h3>
                  </div>

                  {isCreatorRole() ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                        <ShieldCheck className="size-6 text-indigo-400" />
                        <p className="text-sm text-indigo-200">As a {formData.role}, you'll be creating a new organization.</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400 ml-1">Organization Name</label>
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-3.5 size-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                          <input
                            type="text" name="orgName" value={formData.orgName} onChange={handleInputChange}
                            className="w-full bg-[#111] border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-all"
                            placeholder="Acme Corp" required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl flex items-center gap-3">
                        <Users className="size-6 text-gray-400" />
                        <p className="text-sm text-gray-300">Join an existing organization.</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400 ml-1">Search Org</label>
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-3.5 size-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                          <input
                            type="text" name="searchOrgName" value={formData.searchOrgName} onChange={handleInputChange}
                            className="w-full bg-[#111] border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-all"
                            placeholder="Search by name..."
                          />
                        </div>
                      </div>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                        <div className="relative bg-[#050505] px-3 text-xs text-gray-500 uppercase tracking-widest">Or</div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400 ml-1">Invite Code</label>
                        <div className="relative group">
                          <LogIn className="absolute left-4 top-3.5 size-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                          <input
                            type="text" name="joinCode" value={formData.joinCode} onChange={handleInputChange}
                            className="w-full bg-[#111] border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-all"
                            placeholder="e.g. XYZ-123"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button disabled={isCreatingOrg || isJoiningOrg} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                    {isCreatingOrg || isJoiningOrg ? <Loader2 className="animate-spin" /> : (isCreatorRole() ? "Launch Workspace" : "Join Workspace")}
                  </button>
                </form>
              )}

            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: LOGO / BRANDING */}
      {/* Animation: Move from Center to Right. 
          Actually, we can simulate this by having the logo container exist in full width then shrink/move.
          OR, cleaner: Have a separate 'SPLIT' view where the Logo is just on the right, and the CSS animation handles the transition from the previous 'LOGO_FADE' phase.
          
          To make it smooth:
          In LOGO_FADE, logo is center.
          In SPLIT, Logo container is on right.
      */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-900 to-black items-center justify-center relative border-l border-white/5 animate-in slide-in-from-right duration-1000">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="size-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-2xl backdrop-blur-sm">
            <Briefcase className="size-12 text-indigo-400" />
          </div>
          <h2 className="text-4xl font-bold text-white text-center">Digital HQ</h2>
          <p className="text-gray-400 mt-4 text-center max-w-sm">Manage your entire organization in one place.</p>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;