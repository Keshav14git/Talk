import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import {
  Mail, User, Briefcase, Camera, ArrowRight, Loader2, CheckCircle, X, ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";

const SignUpPage = () => {
  const navigate = useNavigate();
  const {
    signup, isSigningUp, authUser,
    sendOtp, verifyOtp, updateProfile, googleLogin
  } = useAuthStore();

  // Mode: "FORM" -> "OTP"
  const [view, setView] = useState("FORM");

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    otp: "",
    profilePic: null,
    previewImg: null
  });

  // Handle initial auth check redirect
  useEffect(() => {
    if (authUser && !authUser.isNewUser && authUser.lastActiveOrgId) {
      navigate("/");
    } else if (authUser && !authUser.lastActiveOrgId) {
      // Determine logic based on role (if available) or existing user
      const role = authUser.role || formData.role;
      const roleLower = role?.toLowerCase() || "";
      const isCLevel = ["ceo", "founder", "managing director", "md", "owner", "president"].includes(roleLower);
      navigate("/org-setup", { state: { defaultMode: isCLevel ? 'create' : 'selection' } });
    }
  }, [authUser, navigate, formData.role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Google Login ---
  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const success = await googleLogin(tokenResponse.access_token);
      if (success) toast.success("Welcome!");
    },
    onError: () => toast.error("Google Login Cancelled")
  });

  // --- Form Submission (Step 1) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.role) {
      return toast.error("All fields are required");
    }

    // Send OTP
    const success = await sendOtp(formData.email);
    if (success) {
      setView("OTP");
    }
  };

  // --- Verify OTP & Complete (Step 2) ---
  const handleVerifyAndComplete = async (e) => {
    e.preventDefault();
    if (!formData.otp) return toast.error("Please enter the code sent to your email");

    // 1. Verify OTP - Gets us the User (creates if new)
    const user = await verifyOtp({ email: formData.email, otp: formData.otp });

    if (user) {
      // 2. Update Profile with the details collected in Step 1
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await updateProfile({
        fullName: fullName,
        role: formData.role,
        profilePic: formData.profilePic // (Logic to upload optional pic if implemented)
      });

      // Navigation handled by useEffect
      toast.success("Account created successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Generic Left Side / Branding (Optional or keep hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div>
            <div className="size-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <Briefcase className="size-8 text-indigo-400" />
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">
              Build your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Digital HQ</span>
            </h1>
            <p className="mt-6 text-xl text-gray-400 max-w-md leading-relaxed">
              The enterprise workspace for modern teams. Connect, collaborate, and ship faster.
            </p>
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 lg:p-10 shadow-2xl relative">
          {/* "Single Page" Form View */}
          {view === "FORM" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
                <p className="text-gray-500">Create your professional account</p>
              </div>

              {/* Google Button */}
              <button
                onClick={() => loginGoogle()}
                className="w-full h-12 bg-white hover:bg-gray-100 text-black font-medium rounded-xl flex items-center justify-center gap-3 transition-colors mb-6"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="size-5" />
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                <div className="relative bg-[#111] px-3 text-xs text-gray-500 uppercase tracking-widest">Or Register</div>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 ml-1">First Name</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 size-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-2.5 pl-9 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-700"
                        placeholder="John" required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 ml-1">Last Name</label>
                    <div className="relative group">
                      <input
                        type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-2.5 px-4 text-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-700"
                        placeholder="Doe" required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 ml-1">Work Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 size-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email" name="email" value={formData.email} onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-2.5 pl-9 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-700"
                      placeholder="you@company.com" required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 ml-1">Role / Designation</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-3 top-3 size-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text" name="role" value={formData.role} onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-2.5 pl-9 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-700"
                      placeholder="e.g. CEO, Product Manager..." required
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-1">
                    {["ceo", "founder", "md", "owner"].includes(formData.role.toLowerCase()) ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-md animate-in fade-in slide-in-from-left-2">
                        <ShieldCheck className="size-3" />
                        <span>You'll be creating a new Organization</span>
                      </div>
                    ) : formData.role && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md animate-in fade-in slide-in-from-left-2">
                        <Briefcase className="size-3" />
                        <span>You'll be joining an Organization</span>
                      </div>
                    )}
                  </div>
                </div>

                <button disabled={isSigningUp} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mt-4 h-14 flex items-center justify-center">
                  {isSigningUp ? <Loader2 className="animate-spin" /> : "Sign Up"}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-gray-500">Already have an account? </span>
                  <span className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium" onClick={() => navigate("/login")}>Sign In</span>
                </div>
              </form>
            </div>
          )}

          {/* OTP View (Overlay) */}
          {view === "OTP" && (
            <div className="absolute inset-0 bg-[#111] z-20 p-8 lg:p-10 rounded-3xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                  <div className="size-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <Mail className="size-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Check your email</h2>
                  <p className="text-gray-400 text-sm mt-1">We sent a code to <span className="text-white font-medium">{formData.email}</span></p>
                </div>

                <form onSubmit={handleVerifyAndComplete} className="space-y-4">
                  <input
                    type="text" name="otp" value={formData.otp} onChange={handleInputChange} autoFocus
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-4 text-center text-2xl tracking-[0.5em] text-white font-mono focus:border-green-500 focus:outline-none transition-all"
                    placeholder="••••••" maxLength={6} required
                  />
                  <button disabled={isSigningUp} type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-all h-12 flex items-center justify-center">
                    {isSigningUp ? <Loader2 className="animate-spin" /> : "Verify Identity"}
                  </button>
                </form>
                <button onClick={() => setView("FORM")} className="w-full text-xs text-gray-500 hover:text-gray-300">Wrong email? Go back</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SignUpPage;