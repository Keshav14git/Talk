import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import { LogOut, User, Building2, ShieldCheck, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileMenu = () => {
    const { authUser, logout } = useAuthStore();
    const { currentOrg } = useOrgStore();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
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

    return (
        <div className="relative z-50" ref={menuRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-full hover:bg-white/5 transition-colors focus:outline-none ring-offset-2 ring-offset-black focus:ring-2 focus:ring-white/20"
            >
                <div className="flex flex-col items-end hidden md:block mr-2">
                    <span className="text-sm font-medium text-white">{authUser.fullName}</span>
                    <span className="text-xs text-gray-500">{currentOrg?.name || "No Org"}</span>
                </div>
                <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg text-lg">
                    {authUser.profilePic ? (
                        <img src={authUser.profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        authUser.fullName?.charAt(0).toUpperCase() || "U"
                    )}
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#111] border border-[#222] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header Info */}
                    <div className="p-5 border-b border-[#222] bg-[#161616]">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-white/10 flex items-center justify-center text-xl text-white font-bold">
                                {authUser.profilePic ? (
                                    <img src={authUser.profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    authUser.fullName?.charAt(0).toUpperCase() || "U"
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate">{authUser.fullName}</h3>
                                <p className="text-xs text-gray-400 truncate">{authUser.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-2">
                        <div className="space-y-1">
                            {/* Role */}
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                <ShieldCheck className="size-4 text-purple-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Role</p>
                                    <p className="text-sm text-gray-200">{authUser.role || "Member"}</p>
                                </div>
                            </div>

                            {/* Organization */}
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                <Building2 className="size-4 text-blue-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Workspace</p>
                                    <p className="text-sm text-gray-200">{currentOrg?.name || "—"}</p>
                                </div>
                            </div>

                            {/* Org Reg Number (Conditional) */}
                            {isCxO && currentOrg?.registrationNumber && (
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                    <FileText className="size-4 text-green-400" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Org ID</p>
                                        <p className="text-sm text-gray-200 font-mono tracking-wider">{currentOrg.registrationNumber}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-[#222] my-2" />

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                        >
                            <LogOut className="size-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileMenu;
