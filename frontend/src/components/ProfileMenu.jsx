import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import { LogOut, User, Building2, ShieldCheck, FileText, Camera, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProfileMenu = ({ collapsed }) => {
    const { authUser, logout, updateProfile, isUpdatingProfile } = useAuthStore();
    const { currentOrg } = useOrgStore();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Portal Position State
    const [position, setPosition] = useState({ top: 0, left: 0 });

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
        await updateProfile({ profilePic: "" });
    };

    // Calculate position when opening
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position above the button, slightly to the right or aligned left
            const MENU_HEIGHT = 420; // Approx height
            const MENU_WIDTH = 384; // w-96 = 24rem = 384px

            let top = rect.top - MENU_HEIGHT - 10;
            let left = rect.left;

            // Adjust if going off screen top
            if (top < 10) top = 10;

            // Adjust if going off screen right is handled by not making it too wide relative to button, 
            // but if button is far right, left - width might work. 
            // Here being sidebar (left side usually), left aligned is fine.

            setPosition({ top, left });
        }
    }, [isOpen]);

    // Close on outside click (needs to cover both button and portal content)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If click is on the button, toggle handles it.
            if (buttonRef.current && buttonRef.current.contains(event.target)) {
                return;
            }

            // For portal content, we can check if the click target is inside the dropdown
            // We'll attach a ref to the dropdown content wrapper
            const dropdown = document.getElementById("profile-menu-dropdown");
            if (dropdown && dropdown.contains(event.target)) {
                return;
            }

            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("resize", () => setIsOpen(false)); // Close on resize to update pos
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("resize", () => setIsOpen(false));
        };
    }, [isOpen]);

    return (
        <>
            {/* Profile Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 p-2 rounded-full hover:bg-white/5 transition-all focus:outline-none ring-offset-2 ring-offset-black focus:ring-2 focus:ring-white/20 w-full ${isOpen ? 'bg-white/10' : ''}`}
            >
                {!collapsed && (
                    <div className="flex-1 flex flex-col items-end mr-2 min-w-0">
                        <span className="text-sm font-medium text-white truncate w-full text-right">{authUser.fullName}</span>
                        <span className="text-xs text-gray-500 max-w-[140px] truncate">{currentOrg?.name || "No Org"}</span>
                    </div>
                )}
                <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg text-lg ring-2 ring-[#222]">
                    {authUser.profilePic ? (
                        <img src={authUser.profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        authUser.fullName?.charAt(0).toUpperCase() || "U"
                    )}
                </div>
            </button>

            {/* Portal Dropdown */}
            {isOpen && createPortal(
                <div
                    id="profile-menu-dropdown"
                    className="fixed z-[9999] w-96 bg-[#0a0a0a] border border-[#222] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-2"
                    style={{
                        top: position.top,
                        left: position.left,
                        transformOrigin: 'bottom left'
                    }}
                >
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
                                <div className="size-20 rounded-full bg-[#111] p-1 ring-4 ring-[#0a0a0a] shadow-xl">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold overflow-hidden relative">
                                        {authUser.profilePic ? (
                                            <img src={authUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            authUser.fullName?.charAt(0).toUpperCase() || "U"
                                        )}

                                        {/* Hover Overlay for Upload */}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            <button
                                                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                                title="Upload New Photo"
                                            >
                                                <Camera className="size-4" />
                                            </button>
                                            {authUser.profilePic && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeletePhoto(); }}
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
                        <div className="bg-[#111] rounded-xl p-1 space-y-0.5 border border-[#1a1a1a]">
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
                            {currentOrg?.registrationNumber && (
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
                                onClick={() => { setIsOpen(false); navigate('/settings'); }}
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
                </div>,
                document.body
            )}
        </>
    );
};

export default ProfileMenu;
