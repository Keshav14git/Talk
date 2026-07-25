import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, ArrowRight, Loader2,
  Building2, CheckCircle2, Lock, Briefcase, Search
} from "lucide-react";
import toast from "react-hot-toast";

const CORPORATE_ROLES = [
  "Founder", "Co-Founder", "CEO", "CTO", "CFO", "COO", "CMO", "CPO", "CIO",
  "President", "Managing Director", "Owner", "Director",
  "VP of Engineering", "VP of Product", "VP of Marketing", "VP of Sales",
  "Product Manager", "Project Manager", "Engineering Manager",
  "Software Engineer", "Frontend Engineer", "Backend Engineer", "Full Stack Engineer",
  "DevOps Engineer", "Data Scientist", "QA Engineer",
  "Product Designer", "UI/UX Designer", "Creative Director",
  "Marketing Manager", "Content Strategist", "SEO Specialist",
  "Sales Representative", "Account Executive", "Business Analyst",
  "HR Manager", "Recruiter", "Finance Manager", "Accountant",
  "Legal Counsel", "Consultant", "Intern", "Other"
];

const SignUpPage = () => {
  const navigate = useNavigate();
  const {
    authUser, isSigningUp, sendOtp, verifyOtp, updateProfile, checkAuth
  } = useAuthStore();

  const { createOrg, joinOrg, isCreatingOrg, isJoiningOrg } = useOrgStore();

  // Steps: 
  // 1. INPUT_EMAIL
  // 2. VERIFY_OTP
  // 3. SELECT_ROLE
  // 4. ORG_ACTION

  const [currentStep, setCurrentStep] = useState("INPUT_EMAIL");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isRoleSelected, setIsRoleSelected] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    otp: "",
    role: "",
    orgName: "",
    regNumber: "",
    searchOrgName: ""
  });

  const [generatedRegNum, setGeneratedRegNum] = useState(null);

  // Redirect if already authenticated and has a workspace, but ONLY if they are not in the middle of setup
  useEffect(() => {
    if (authUser && authUser.lastActiveOrgId && currentStep !== "ORG_ACTION" && currentStep !== "SELECT_ROLE" && currentStep !== "VERIFY_OTP") {
      navigate("/");
    }
  }, [authUser, currentStep, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      const fullName = (formData.firstName + " " + formData.lastName).trim();
      await updateProfile({ fullName });
      setCurrentStep("SELECT_ROLE");
      toast.success("Email Verified");
    }
  };

  const handleSelectRole = async (role) => {
    setFormData(prev => ({ ...prev, role }));
    setRoleSearch(role);
    setShowRoleSuggestions(false);
    await updateProfile({ role });
    setIsRoleSelected(true);
    setCurrentStep("ORG_ACTION");
  };

  const filteredRoles = CORPORATE_ROLES.filter(r =>
    r.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const handleOrgAction = async (e) => {
    e.preventDefault();
    const isCxO = ["ceo", "founder", "co-founder", "md", "managing director", "president", "owner", "cfo", "cto", "coo", "cmo", "cpo", "cio"].includes(formData.role.toLowerCase());

    if (isCxO) {
      if (!formData.orgName) return toast.error("Org Name is required");
      const newOrg = await createOrg(formData.orgName);
      if (newOrg && newOrg.registrationNumber) {
        setGeneratedRegNum(newOrg.registrationNumber);
        toast.success("Organization Created Successfully!");
        await checkAuth();
        setTimeout(() => navigate("/"), 2000);
      }
    } else {
      if (!formData.regNumber && !formData.searchOrgName) return toast.error("Enter Registration Number or Name");
      let success = false;
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

  const isCxO = formData.role ? ["ceo", "founder", "co-founder", "md", "managing director", "president", "owner", "cfo", "cto", "coo", "cmo", "cpo", "cio"].includes(formData.role.toLowerCase()) : false;

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-[420px] flex flex-col z-10">
        
        {/* Logo Header */}
        <div className="mb-10 text-center flex flex-col items-center gap-4">
           <img src="/Orchestr (3).png" alt="Orchestr" className="w-48 mb-2" />
        </div>

        {/* Card */}
        <div className="w-full bg-[#111] rounded-2xl border border-[#222] p-8 shadow-2xl relative">
          
          <div className="mb-8 text-center">
            <h2 className="text-xl font-medium text-white tracking-tight">Initialize Workspace</h2>
            <p className="text-sm text-gray-500 mt-1">One identity for all workflows</p>
          </div>

          <div className="space-y-6">
            
            {/* Step 1: Name & Email */}
            <div className={`space-y-4 transition-opacity duration-300 ${isEmailVerified ? 'opacity-50 pointer-events-none' : 'opacity-100'} `}>
              {!isEmailVerified && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 ml-1">First Name</label>
                    <input
                      name="firstName" value={formData.firstName} onChange={handleInputChange}
                      className="w-full h-11 bg-[#1A1A1A] border border-[#333] rounded-lg px-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 ml-1">Last Name</label>
                    <input
                      name="lastName" value={formData.lastName} onChange={handleInputChange}
                      className="w-full h-11 bg-[#1A1A1A] border border-[#333] rounded-lg px-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 relative">
                 <label className="text-xs font-medium text-gray-400 ml-1">Work Email</label>
                <div className="relative">
                  <input
                    type="email" name="email" value={formData.email} onChange={handleInputChange}
                    readOnly={isEmailVerified}
                    className={`w-full h-12 bg-[#1A1A1A] border ${isEmailVerified ? 'border-green-900/50 text-green-500' : 'border-[#333] text-white'} rounded-lg pl-10 pr-24 text-sm focus:outline-none focus:border-white/30`}
                    placeholder="name@company.com"
                  />
                  <Mail className={`absolute left-3 top-4 size-4 ${isEmailVerified ? 'text-green-500' : 'text-gray-500'} `} />

                  <div className="absolute right-2 top-2">
                    {isEmailVerified ? (
                      <CheckCircle2 className="size-5 text-green-500 mt-1 mr-1" />
                    ) : (
                      formData.email.length > 5 && currentStep === 'INPUT_EMAIL' && (
                        <button
                          onClick={handleRequestOtp}
                          disabled={isSigningUp}
                          className="bg-white text-black px-3 h-8 rounded text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center min-w-[70px]"
                        >
                          {isSigningUp ? <Loader2 className="animate-spin size-3" /> : "Verify"}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: OTP */}
            {currentStep === 'VERIFY_OTP' && !isEmailVerified && (
              <div className="pt-2 animate-in fade-in duration-300">
                <div className="relative">
                  <input
                    name="otp" value={formData.otp} onChange={handleInputChange} autoFocus
                    maxLength={6}
                    className="w-full h-12 bg-[#1A1A1A] border border-[#333] rounded-lg pl-10 pr-24 text-white tracking-[0.3em] font-mono focus:outline-none focus:border-white/30 text-center"
                    placeholder="••••••"
                  />
                  <Lock className="absolute left-4 top-4 size-4 text-gray-500" />
                  <div className="absolute right-2 top-2">
                    <button
                      onClick={handleVerifyOtp}
                      disabled={isSigningUp}
                      className="bg-white text-black px-4 h-8 rounded text-xs font-semibold hover:bg-gray-200 transition-colors min-w-[80px] flex items-center justify-center"
                    >
                      {isSigningUp ? <Loader2 className="animate-spin size-3" /> : "Confirm"}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 text-center">Code sent to your email.</p>
              </div>
            )}

            {/* Step 3: Role Selection */}
            {isEmailVerified && (
              <div className={`space-y-4 pt-4 border-t border-[#222] transition-opacity duration-300 ${isRoleSelected ? 'opacity-50 pointer-events-none' : 'opacity-100'} `}>
                <div className="flex items-center gap-2">
                  <Briefcase className="size-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Your Role</span>
                </div>

                <div className="relative">
                  <input
                    value={roleSearch}
                    onChange={(e) => {
                      setRoleSearch(e.target.value);
                      setShowRoleSuggestions(true);
                      setIsRoleSelected(false);
                    }}
                    onFocus={() => setShowRoleSuggestions(true)}
                    className="w-full h-11 bg-[#1A1A1A] border border-[#333] rounded-lg pl-10 px-4 text-white text-sm focus:outline-none focus:border-white/30"
                    placeholder="Search position (e.g. Founder, Engineer...)"
                  />
                  <Search className="absolute left-3 top-3.5 size-4 text-gray-500" />

                  {showRoleSuggestions && roleSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-[#333] rounded-lg max-h-48 overflow-y-auto shadow-xl scrollbar-hide">
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map(r => (
                          <button
                            key={r}
                            onClick={() => handleSelectRole(r)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#222] hover:text-white transition-colors border-b border-[#333]/50 last:border-0"
                          >
                            {r}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">No matching roles found</div>
                      )}
                    </div>
                  )}

                  {!roleSearch && showRoleSuggestions && (
                    <div className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-[#333] rounded-lg p-2 grid grid-cols-2 gap-1 shadow-xl">
                      {["Founder", "CEO", "Product Manager", "Engineer", "Designer", "Marketer"].map(r => (
                        <button
                          key={r}
                          onClick={() => handleSelectRole(r)}
                          className="text-left px-3 py-2 text-xs text-gray-400 hover:bg-[#222] hover:text-white rounded transition-colors"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Org Setup */}
            {isRoleSelected && (
              <div className="space-y-6 pt-4 border-t border-[#222] animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {isCxO ? "Create Organization" : "Join Workspace"}
                  </span>
                </div>

                {isCxO ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 ml-1">Organization Name</label>
                      <input
                        name="orgName" value={formData.orgName} onChange={handleInputChange} autoFocus
                        className="w-full h-11 bg-[#1A1A1A] border border-[#333] rounded-lg px-4 text-white text-sm focus:outline-none focus:border-white/30"
                        placeholder="Acme Corp"
                      />
                    </div>

                    {generatedRegNum ? (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex flex-col items-center text-center">
                        <CheckCircle2 className="size-6 text-green-500 mb-2" />
                        <h3 className="text-white text-sm font-medium">Organization Created</h3>
                        <div className="mt-2 bg-black border border-green-500/30 px-3 py-1.5 rounded font-mono text-green-400 text-sm tracking-widest">
                          {generatedRegNum}
                        </div>
                        <p className="text-[10px] text-green-600/70 mt-2">Save this ID for your team</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleOrgAction}
                        disabled={isCreatingOrg}
                        className="w-full h-11 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        {isCreatingOrg ? <Loader2 className="animate-spin size-4" /> : "Launch Workspace"}
                        <ArrowRight className="size-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 ml-1">Registration Number</label>
                      <input
                        name="regNumber" value={formData.regNumber} onChange={handleInputChange}
                        className="w-full h-11 bg-[#1A1A1A] border border-[#333] rounded-lg px-4 text-white text-sm font-mono focus:outline-none focus:border-white/30"
                        placeholder="ORG-XXXX-XXXX"
                      />
                    </div>
                    
                    <div className="relative flex items-center justify-center my-3">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#333]"></div></div>
                      <div className="relative bg-[#111] px-2 text-[10px] text-gray-500 uppercase tracking-widest">OR</div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 ml-1">Search by Name</label>
                      <input
                        name="searchOrgName" value={formData.searchOrgName} onChange={handleInputChange}
                        className="w-full h-11 bg-[#1A1A1A] border border-[#333] rounded-lg px-4 text-white text-sm focus:outline-none focus:border-white/30"
                        placeholder="Acme Corp"
                      />
                    </div>

                    <button
                      onClick={handleOrgAction}
                      disabled={isJoiningOrg}
                      className="w-full h-11 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors mt-2"
                    >
                      {isJoiningOrg ? <Loader2 className="animate-spin size-4" /> : "Join Workspace"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-white hover:underline font-medium">Log In</Link>
          </p>
          <p className="text-xs text-center text-gray-700">
            Secure, zero-knowledge architectural access.
          </p>
        </div>

      </div>
    </div>
  );
};
export default SignUpPage;