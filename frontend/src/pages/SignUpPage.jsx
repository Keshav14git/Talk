import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import {
  Mail, Lock, User, Briefcase, Camera, ArrowRight, CheckCircle, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const navigate = useNavigate();
  const {
    signup, isSigningUp, authUser,
    sendOtp, verifyOtp, updateProfile
  } = useAuthStore();

  // Step State: 1 = Identity, 2 = Verify, 3 = Profile
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    fullName: "",
    role: "",
    profilePic: null,
    previewImg: null
  });

  // Handle initial auth check redirect
  useEffect(() => {
    if (authUser && !authUser.isNewUser && authUser.lastActiveOrgId) {
      navigate("/");
    } else if (authUser && !authUser.lastActiveOrgId) {
      // Already auth'd but no org? Go to setup
      // We need to pass the "Mode" potentially if they are C-Level
      const isCLevel = ["ceo", "founder", "managing director", "md", "owner", "president"].includes(authUser.role?.toLowerCase());
      navigate("/org-setup", { state: { defaultMode: isCLevel ? 'create' : 'selection' } });
    }
  }, [authUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setFormData(prev => ({ ...prev, profilePic: reader.result, previewImg: reader.result }));
    };
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) return toast.error("Email is required");
    const success = await sendOtp(formData.email);
    if (success) setStep(2);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp) return toast.error("OTP is required");
    const user = await verifyOtp({ email: formData.email, otp: formData.otp });

    if (user) {
      // If user already exists and has a name, maybe skip profile? 
      // For now, let's force profile update to ensure "Role" is captured if missing.
      setStep(3);
    }
  };

  // Step 3: Complete Profile
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.role) return toast.error("Name and Role are required");

    await updateProfile({
      fullName: formData.fullName,
      role: formData.role,
      profilePic: formData.profilePic
    });

    // Determine next step based on role
    const roleLower = formData.role.toLowerCase();
    const isCLevel = ["ceo", "founder", "managing director", "md", "owner", "president"].includes(roleLower);

    navigate("/org-setup", { state: { defaultMode: isCLevel ? 'create' : 'selection' } });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="size-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Briefcase className="size-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {step === 1 ? "Welcome Back" : step === 2 ? "Verify Identity" : "Setup Profile"}
          </h1>
          <p className="text-gray-400">
            {step === 1 ? "Enter your work email to get started" :
              step === 2 ? `We sent a code to ${formData.email}` :
                "Let's get your professional details"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 shadow-2xl">

          {/* STEP 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Work Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 size-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>
              <button disabled={isSigningUp} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                {isSigningUp ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight className="size-4" /></>}
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Verification Code</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 size-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all tracking-[0.5em] font-mono text-center text-lg"
                    placeholder="••••••"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <button disabled={isSigningUp} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                {isSigningUp ? <Loader2 className="animate-spin" /> : "Verify & Continue"}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-300">
                Wrong email? Go back
              </button>
            </form>
          )}

          {/* STEP 3: Profile */}
          {step === 3 && (
            <form onSubmit={handleCompleteProfile} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer">
                  <img
                    src={formData.previewImg || "/avatar.png"}
                    alt="Profile"
                    className="size-24 rounded-full object-cover border-2 border-gray-700 group-hover:border-indigo-500 transition-colors bg-gray-800"
                  />
                  <label htmlFor="pic-upload" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="size-6 text-white" />
                  </label>
                  <input id="pic-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
                <span className="text-xs text-gray-500 mt-2">Upload Photo</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Full Name</label>
                  <div className="mt-1 relative group">
                    <User className="absolute left-3 top-3 size-4 text-gray-500" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg py-2.5 pl-9 pr-4 text-white focus:border-indigo-500 focus:outline-none text-sm"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Role / Designation</label>
                  <div className="mt-1 relative group">
                    <Briefcase className="absolute left-3 top-3 size-4 text-gray-500" />
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg py-2.5 pl-9 pr-4 text-white focus:border-indigo-500 focus:outline-none text-sm"
                      placeholder="e.g. Product Manager, CEO, Engineer..."
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">
                    If you enter <b>CEO, Founder, or MD</b>, you'll be prompted to create a new organization.
                  </p>
                </div>
              </div>

              <button disabled={isSigningUp} type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4">
                {isSigningUp ? <Loader2 className="animate-spin" /> : "Complete Setup"}
              </button>
            </form>
          )}

        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-indigo-500' : 'w-2 bg-gray-800'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;