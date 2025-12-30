
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import { useNavigate } from "react-router-dom";
import {
  Mail, ArrowRight, Loader2, ShieldCheck,
  Building2, Users, LogIn, CheckCircle2, Lock, ChevronRight, Briefcase
} from "lucide-react";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";

const SignUpPage = () => {
  const navigate = useNavigate();
  const {
    login, signup, isSigningUp, isLoggingIn, authUser,
    sendOtp, verifyOtp, updateProfile, googleLogin, checkAuth
  } = useAuthStore();

  const { createOrg, joinOrg, isCreatingOrg, isJoiningOrg } = useOrgStore();

  // --- Animation Phases ---
  const [introPhase, setIntroPhase] = useState("BLANK"); // BLANK -> LOGO -> SPLIT

  // --- Progressive Form State ---
  // Steps: 
  // 1. INPUT_EMAIL (Start)
  // 2. VERIFY_OTP (Shown after email submit)
  // 3. SELECT_ROLE (Shown after OTP success)
  // 4. ORG_ACTION (Shown after Role selected)
  // 5. COMPLETED (All done)

  const [currentStep, setCurrentStep] = useState("INPUT_EMAIL");

  // Track verified states to "lock" UI sections
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isRoleSelected, setIsRoleSelected] = useState(false);

  // Data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    otp: "",
    role: "",
    orgName: "",
    regNumber: "", // For joining by Reg Number
    searchOrgName: ""
  });

  const [generatedRegNum, setGeneratedRegNum] = useState(null); // To show after creation

  // --- Intro Timing ---
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase("LOGO"), 1500);
    const t2 = setTimeout(() => setIntroPhase("SPLIT"), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // --- Auto-Redirect if Done ---


  // --- Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 1. Google Auth (Top)
  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const user = await googleLogin(tokenResponse.access_token);
      // If user is new/needs org setup, the logic below or useEffect will handle it.
      // If Google login returns a user with an org, auto-redirect happens via useEffect.
      if (user && !user.lastActiveOrgId) {
        // If they signed up via Google but have no org, jump to Role/Org step
        // Prefill name/email from what we got (usually handled in backend, but we can sync local state if needed)
        setIsEmailVerified(true);
        if (!user.role) {
          setCurrentStep("SELECT_ROLE");
        } else {
          setFormData(prev => ({ ...prev, role: user.role }));
          setIsRoleSelected(true);
          setCurrentStep("ORG_ACTION");
        }
      }
    },
    onError: () => toast.error("Google Login Cancelled")
  });

  // 2. Email Verification Flow
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName) return toast.error("Please fill all details");

    const success = await sendOtp(formData.email);
    if (success) setCurrentStep("VERIFY_OTP");
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp) return toast.error("Enter OTP");

    const user = await verifyOtp({ email: formData.email, otp: formData.otp });
    if (user) {
      setIsEmailVerified(true);
      // Update Name
      const fullName = (formData.firstName + " " + formData.lastName).trim();
      await updateProfile({ fullName });
      setCurrentStep("SELECT_ROLE");
      toast.success("Email Verified");
    }
  };

  // 3. Role Selection
  const handleSelectRole = async (role) => {
    setFormData(prev => ({ ...prev, role }));
    await updateProfile({ role });
    setIsRoleSelected(true);
    setCurrentStep("ORG_ACTION");
  };

  // 4. Org Action
  const handleOrgAction = async (e) => {
    e.preventDefault();

    // Determine action type based on role
    const isCxO = ["ceo", "founder", "md", "president", "owner"].includes(formData.role.toLowerCase());

    if (isCxO) {
      // Create Logic
      if (!formData.orgName) return toast.error("Org Name is required");
      const newOrg = await createOrg(formData.orgName);
      if (newOrg && newOrg.registrationNumber) {
        setGeneratedRegNum(newOrg.registrationNumber);
        toast.success("Organization Created Successfully!");

        await checkAuth();
        setTimeout(() => navigate("/"), 2000);
      }
    } else {
      // Join Logic
      if (!formData.regNumber && !formData.searchOrgName) return toast.error("Enter Registration Number or Name");

      let success = false;
      // Prioritize Reg Number
      if (formData.regNumber) {
        success = await joinOrg({ registrationNumber: formData.regNumber });
      } else {
        success = await joinOrg({ orgName: formData.searchOrgName });
      }

      if (success) {
        toast.success("Joined Organization!");
        await checkAuth();
        setTimeout(() => navigate("/"), 1000);
      }
    }
  };

  // --- Render Helpers ---
  const isCxO = ["ceo", "founder", "md", "president", "owner"].includes(formData.role.toLowerCase());


  // --- BLANK / INTRO PHASES ---
  if (introPhase === "BLANK") return <div className="h-screen w-screen bg-black" />;

  if (introPhase === "LOGO") {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center animate-in fade-in duration-1000">
        <img src="/Orchestr (3).png" alt="Logo" className="w-32 opacity-90 grayscale" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex relative overflow-hidden font-sans text-white selection:bg-white/20">

      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-white/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/[0.05] rounded-full blur-[120px]" />
      </div>

      {/* Main Layout: Split 50/50 */}
      <div className={`w-full lg:w-1/2 h-full flex flex-col px-8 lg:px-24 pt-20 z-10 transition-all duration-1000 ${introPhase === 'SPLIT' ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'} `}>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <img src="/Orchestr (3).png" alt="Logo" className="w-10 opacity-90" />
          </div>
          <h1 className="text-3xl font-medium tracking-tight mb-2">Initialize Workspace</h1>
          <p className="text-[#666]">One identity for all your professional workflows.</p>
        </div>

        {/* --- SECTION 1: GOOGLE AUTH (ALWAYS VISIBLE) --- */}
        <div className={`transition-all duration-500 ${isEmailVerified ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'} `}>
          <button
            onClick={() => loginGoogle()}
            className="w-full h-12 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] hover:border-[#444] rounded-lg flex items-center justify-center gap-3 transition-all group"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="size-5 filter grayscale group-hover:grayscale-0 transition-all" />
            <span className="text-sm font-medium text-[#ccc] group-hover:text-white">Continue with Google</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#222]"></div></div>
          <div className="relative bg-black px-3 text-[10px] text-[#444] uppercase tracking-widest font-medium">Or</div>
        </div>

        {/* --- SECTION 2: MANUAL INPUT & OTP --- */}
        <div className="space-y-6">
          {/* Name & Email Fields */}
          <div className={`space-y-4 transition-all duration-500 ${isEmailVerified ? 'opacity-60 pointer-events-none' : 'opacity-100'} `}>
            {!isEmailVerified && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#666] font-medium ml-1">First Name</label>
                  <input
                    name="firstName" value={formData.firstName} onChange={handleInputChange}
                    className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg p-3 text-sm focus:border-white/20 focus:outline-none transition-colors"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#666] font-medium ml-1">Last Name</label>
                  <input
                    name="lastName" value={formData.lastName} onChange={handleInputChange}
                    className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg p-3 text-sm focus:border-white/20 focus:outline-none transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <input
                type="email" name="email" value={formData.email} onChange={handleInputChange}
                readOnly={isEmailVerified}
                className={`w-full bg-[#0A0A0A] border ${isEmailVerified ? 'border-green-900/30 text-green-500' : 'border-[#222] text-white'} rounded-lg p-3 pl-10 text-sm focus:border-white/20 focus:outline-none transition-colors`}
                placeholder="work@company.com"
              />
              <Mail className={`absolute left-3 top-3.5 size-4 ${isEmailVerified ? 'text-green-500' : 'text-[#444]'} `} />

              {/* Inline Verify Button or Checkmark */}
              <div className="absolute right-2 top-2">
                {isEmailVerified ? (
                  <CheckCircle2 className="size-5 text-green-500 mt-1" />
                ) : (
                  formData.email.length > 5 && currentStep === 'INPUT_EMAIL' && (
                    <button
                      onClick={handleRequestOtp}
                      disabled={isSigningUp}
                      className="bg-white text-black px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      {isSigningUp ? <Loader2 className="animate-spin size-3" /> : "Verify"}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* OTP Field (Conditionally Revealed) */}
          {currentStep === 'VERIFY_OTP' && !isEmailVerified && (
            <div className="animate-in slide-in-from-left-4 fade-in duration-500">
              <div className="relative">
                <input
                  name="otp" value={formData.otp} onChange={handleInputChange} autoFocus
                  maxLength={6}
                  className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg p-3 pl-10 text-sm tracking-[0.3em] font-mono focus:border-white/20 focus:outline-none transition-colors text-white"
                  placeholder=" • • • • • • "
                />
                <Lock className="absolute left-3 top-3.5 size-4 text-[#444]" />
                <div className="absolute right-2 top-2">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isSigningUp}
                    className="bg-white text-black px-4 py-1.5 rounded text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    {isSigningUp ? <Loader2 className="animate-spin size-3" /> : "Confirm"}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-[#666] mt-2 ml-1">Code sent to your email. Check spam folder if needed.</p>
            </div>
          )}

          {/* --- SECTION 3: ROLE SELECTION (Conditionally Revealed) --- */}
          {isEmailVerified && (
            <div className={`space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100 ${isRoleSelected ? 'opacity-60 pointer-events-none' : 'opacity-100'} `}>
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-[#666]" />
                <span className="text-xs font-medium text-[#666] uppercase tracking-wider">Your Role</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {["Founder", "CEO", "CTO", "Product Manager", "Engineer", "Designer", "Marketer", "Other"].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleSelectRole(r)}
                    className={`p-3 rounded-lg border text-left text-sm transition-all duration-300 ${formData.role === r ? 'bg-white text-black border-white ring-2 ring-white/20' : 'bg-[#0A0A0A] border-[#222] text-[#888] hover:border-[#444] hover:text-[#ccc]'} `}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- SECTION 4: ORG SETUP (Conditionally Revealed) --- */}
          {isRoleSelected && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 pt-4 border-t border-[#222]/50">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-[#666]" />
                <span className="text-xs font-medium text-[#666] uppercase tracking-wider">
                  {isCxO ? "Create Organization" : "Join Workspace"}
                </span>
              </div>

              {/* CXO Flow: Create */}
              {isCxO ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#666] font-medium ml-1">Organization Name</label>
                    <input
                      name="orgName" value={formData.orgName} onChange={handleInputChange} autoFocus
                      className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg p-3 text-sm focus:border-white/20 focus:outline-none transition-colors"
                      placeholder="Acme Corp"
                    />
                  </div>

                  {/* Success State with Reg Number */}
                  {generatedRegNum && (
                    <div className="p-4 bg-green-900/10 border border-green-900/30 rounded-lg flex flex-col items-center text-center animate-in zoom-in duration-300">
                      <CheckCircle2 className="size-8 text-green-500 mb-2" />
                      <h3 className="text-white font-medium">Organization Created</h3>
                      <div className="mt-3 bg-black/50 border border-green-500/20 px-4 py-2 rounded font-mono text-green-400 text-lg tracking-wider">
                        {generatedRegNum}
                      </div>
                      <p className="text-xs text-green-600/70 mt-2">Save this ID for your team</p>
                    </div>
                  )}

                  {!generatedRegNum && (
                    <button
                      onClick={handleOrgAction}
                      disabled={isCreatingOrg}
                      className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      {isCreatingOrg ? <Loader2 className="animate-spin size-4" /> : "Launch Workspace"}
                      <ArrowRight className="size-4" />
                    </button>
                  )}
                </div>
              ) : (
                // Member Flow: Join
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#666] font-medium ml-1">Registration Number (Recommended)</label>
                    <input
                      name="regNumber" value={formData.regNumber} onChange={handleInputChange}
                      className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg p-3 text-sm font-mono focus:border-white/20 focus:outline-none transition-colors"
                      placeholder="ORG-XXXX-XXXX"
                    />
                  </div>
                  <div className="relative flex items-center justify-center">
                    <span className="bg-black px-2 text-[10px] text-[#444] uppercase">OR</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#666] font-medium ml-1">Search by Name</label>
                    <input
                      name="searchOrgName" value={formData.searchOrgName} onChange={handleInputChange}
                      className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg p-3 text-sm focus:border-white/20 focus:outline-none transition-colors"
                      placeholder="Acme Corp"
                    />
                  </div>

                  <button
                    onClick={handleOrgAction}
                    disabled={isJoiningOrg}
                    className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isJoiningOrg ? <Loader2 className="animate-spin size-4" /> : "Join Workspace"}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* RIGHT SIDE (Decorative) */}
      <div className={`hidden lg:block w-1/2 h-full bg-[#050505] border-l border-[#222] relative overflow-hidden transition-all duration-1000 delay-300 ${introPhase === 'SPLIT' ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'} `}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80%] h-[60%] bg-gradient-to-tr from-[#111] to-[#000] rounded-xl border border-[#222] shadow-2xl relative overflow-hidden group">
            {/* Fake UI Preview inside */}
            <div className="absolute top-0 left-0 w-full h-8 bg-[#1a1a1a] border-b border-[#222] flex items-center px-4 gap-2">
              <div className="size-2 rounded-full bg-red-500/20" />
              <div className="size-2 rounded-full bg-yellow-500/20" />
              <div className="size-2 rounded-full bg-green-500/20" />
            </div>
            <div className="p-8">
              <div className="w-1/2 h-4 bg-[#222] rounded mb-4" />
              <div className="w-full h-2 bg-[#1a1a1a] rounded mb-2" />
              <div className="w-[90%] h-2 bg-[#1a1a1a] rounded mb-2" />
              <div className="w-[60%] h-2 bg-[#1a1a1a] rounded" />

              <div className="mt-8 flex gap-4">
                <div className="w-24 h-24 bg-[#1a1a1a] rounded-lg border border-[#222]" />
                <div className="w-24 h-24 bg-[#1a1a1a] rounded-lg border border-[#222]" />
              </div>
            </div>

            {/* Gradient Text Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
              <h2 className="text-xl font-medium text-white">Focus on what matters.</h2>
              <p className="text-sm text-[#666] mt-2">The new standard for modern software development teams.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
export default SignUpPage;