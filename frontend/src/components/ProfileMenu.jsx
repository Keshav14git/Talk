import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import { LogOut, User, Building2, ShieldCheck, FileText, Camera, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProfileMenu = ({ collapsed }) => {
    const { authUser, logout, updateProfile, isUpdatingProfile } = useAuthStore();
    const { currentOrg } = useOrgStore();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!authUser) return null;

    const isCxO = ["ceo", "founder", "md", "president", "owner"].includes(authUser.role?.toLowerCase());

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size too large. Max 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Image = reader.result;
            await updateProfile({ profilePic: base64Image });
        };
    };

    const handleDeletePhoto = async () => {
        if (!confirm("Are you sure you want to remove your profile picture?")) return;
        await updateProfile({ profilePic: "" }); // Send empty string to remove
    };

    return (
        <div className="relative z-50" ref={menuRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 p-2 rounded-full hover:bg-white/5 transition-all focus:outline-none ring-offset-2 ring-offset-black focus:ring-2 focus:ring-white/20 ${isOpen ? 'bg-white/10' : ''}`}
            >
                {!collapsed && (
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-sm font-medium text-white">{authUser.fullName}</span>
                        <span className="text-xs text-gray-500 max-w-[100px] truncate">{currentOrg?.name || "No Org"}</span>
                    </div>
                )}
                <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg text-lg ring-2 ring-[#222]">
                    {authUser.profilePic ? (
                        <img src={authUser.profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        authUser.fullName?.charAt(0).toUpperCase() || "U"
                    )}
                </div>
            </button>

            {/* Dropdown Menu - Opens Upwards */}
            {isOpen && (
                <div className="absolute bottom-full left-0 mb-4 w-96 bg-[#0a0a0a] border border-[#222] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-2">
                    {/* Header Image Background */}
                    <div className="h-24 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 relative">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* Profile Header Content */}
                    <div className="px-6 relative -mt-10 pb-4">
                        <div className="flex items-end justify-between mb-4">
                            <div className="relative group">
                                <div className="size-20 rounded-full bg-[#111] p-1 ring-4 ring-[#0a0a0a]">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold overflow-hidden relative">
                                        {authUser.profilePic ? (
                                            <img src={authUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            authUser.fullName?.charAt(0).toUpperCase() || "U"
                                        )}

                                        {/* Hover Overlay for Upload */}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                                title="Upload New Photo"
                                            >
                                                <Camera className="size-4" />
                                            </button>
                                            {authUser.profilePic && (
                                                <button
                                                    onClick={handleDeletePhoto}
                                                    className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                                    title="Remove Photo"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {isUpdatingProfile && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
                                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-1 text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                                    {authUser.role || "Member"}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white">{authUser.fullName}</h3>
                            <p className="text-sm text-gray-500">{authUser.email}</p>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="px-3 pb-3">
                        <div className="bg-[#111] rounded-xl p-1 space-y-0.5">
                            {/* Organization */}
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                    <Building2 className="size-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Workspace</p>
                                    <p className="text-sm text-gray-200 font-medium">{currentOrg?.name || "—"}</p>
                                </div>
                            </div>

                            {/* Org Reg Number (Conditional) */}
                            {isCxO && currentOrg?.registrationNumber && (
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                                        <FileText className="size-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Registration ID</p>
                                        <p className="text-sm text-gray-200 font-mono tracking-wider">{currentOrg.registrationNumber}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => navigate('/settings')}
                                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-[#222] text-gray-300 transition-colors text-xs font-bold"
                            >
                                <User className="size-4" />
                                Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-colors text-xs font-bold"
                            >
                                <LogOut className="size-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileMenu;
