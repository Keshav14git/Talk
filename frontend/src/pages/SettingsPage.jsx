import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import { User, Building2, Bell, Shield, ArrowLeft, Camera, Trash2, Check, X, Mail, Edit2, LogOut, Copy, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { authUser, logout, updateProfile, isUpdatingProfile, requestEmailChange, verifyEmailChange } = useAuthStore();
  const { currentOrg, orgMembers } = useOrgStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const [showMobileContent, setShowMobileContent] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["profile", "workspace", "notifications", "security"].includes(tab)) {
      setActiveTab(tab);
      setShowMobileContent(true);
    }
  }, [location]);

  // Profile state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(authUser?.fullName || "");
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [newRole, setNewRole] = useState(authUser?.role || "");

  // Manager state
  const [isEditingManager, setIsEditingManager] = useState(false);
  const [newManagerId, setNewManagerId] = useState("");
  const { setManager } = useOrgStore();

  // Email change state
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Notification prefs (localStorage)
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("orchestr_notifs") || "{}"); } catch { return {}; }
  });

  const tabs = [
    { id: "profile", label: "My Profile", icon: User, desc: "Name, avatar, email" },
    { id: "workspace", label: "Workspace", icon: Building2, desc: "Organization details" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Alerts & preferences" },
    { id: "security", label: "Security & Devices", icon: Shield, desc: "DTPin & active sessions" },
  ];

  const handleTabClick = (id) => { setActiveTab(id); setShowMobileContent(true); };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await logout();
      navigate("/login");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => await updateProfile({ profilePic: reader.result });
  };

  const handleDeletePhoto = async () => {
    if (!confirm("Remove your profile picture?")) return;
    await updateProfile({ profilePic: "" });
  };

  const handleNameSave = async () => {
    if (!newName.trim()) return;
    await updateProfile({ fullName: newName });
    setIsEditingName(false);
  };

  const handleRoleSave = async () => {
    await updateProfile({ role: newRole });
    setIsEditingRole(false);
  };

  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    const ok = await requestEmailChange(newEmail);
    if (ok) setShowOtpInput(true);
  };

  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;
    const ok = await verifyEmailChange(otp);
    if (ok) { setIsChangingEmail(false); setShowOtpInput(false); setNewEmail(""); setOtp(""); }
  };

  const toggleNotif = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem("orchestr_notifs", JSON.stringify(updated));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleManagerSave = async () => {
    if (!newManagerId.trim()) return;
    const success = await setManager(currentOrg._id, newManagerId.trim().toUpperCase());
    if (success) setIsEditingManager(false);
  };

  const myMembership = orgMembers?.find(m => (m.userId?._id || m._id) === authUser?._id);
  const myAccessLevel = myMembership?.accessLevel || myMembership?.role || "member";

  // Check if user is top level executive
  const userDesignation = authUser?.role?.toLowerCase() || "";
  const isTopLevel = ["founder", "ceo", "cto", "cfo", "coo", "president", "director"].some(title => userDesignation.includes(title));

  // Find the manager object
  const managerMember = myMembership?.managerId ? orgMembers?.find(m => (m.userId?._id || m._id) === myMembership.managerId) : null;

  // ─── Render Helpers ───
  const renderProfile = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold text-white">My Profile</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your personal information</p>
      </div>

      {/* Avatar Card */}
      <div className="bg-[#2f2f2f] rounded-2xl border border-[#3f3f3f] overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 relative" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end justify-between">
            <div className="relative group">
              <div className="size-20 rounded-full bg-[#2f2f2f] p-1 ring-4 ring-[#111]">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold overflow-hidden relative">
                  {authUser.profilePic ? (
                    <img src={authUser.profilePic} alt="" className="w-full h-full object-cover" />
                  ) : (authUser.fullName?.charAt(0).toUpperCase() || "U")}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <button className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"><Camera className="size-4" /></button>
                    {authUser.profilePic && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeletePhoto(); }} className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400"><Trash2 className="size-4" /></button>
                    )}
                  </div>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              {isUpdatingProfile && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"><div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider mb-1">
              {authUser.role || "Employee"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3">Hover over avatar to change or remove photo</p>
        </div>
      </div>

      {/* Fields */}
      <div className="bg-[#2f2f2f] rounded-2xl border border-[#3f3f3f] divide-y divide-[#222]">
        {/* Full Name */}
        <div className="p-5">
          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1.5 mb-2"><User className="size-3" />Full Name</label>
          {isEditingName ? (
            <div className="flex gap-2">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1 px-3 py-2 bg-[#171717] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" autoFocus />
              <button onClick={handleNameSave} disabled={isUpdatingProfile} className="p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-400"><Check className="size-4" /></button>
              <button onClick={() => setIsEditingName(false)} className="p-2 bg-[#222] hover:bg-[#4a4a4a] rounded-lg text-gray-400"><X className="size-4" /></button>
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <span className="text-sm text-gray-200 font-medium">{authUser.fullName}</span>
              <button onClick={() => { setIsEditingName(true); setNewName(authUser.fullName); }} className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-[#222] opacity-0 group-hover:opacity-100 transition-all"><Edit2 className="size-3.5" /></button>
            </div>
          )}
        </div>

        {/* Designation */}
        <div className="p-5">
          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1.5 mb-2"><Shield className="size-3" />Designation</label>
          {isEditingRole ? (
            <div className="flex gap-2">
              <input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. Product Manager" className="flex-1 px-3 py-2 bg-[#171717] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" autoFocus />
              <button onClick={handleRoleSave} disabled={isUpdatingProfile} className="p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-400"><Check className="size-4" /></button>
              <button onClick={() => setIsEditingRole(false)} className="p-2 bg-[#222] hover:bg-[#4a4a4a] rounded-lg text-gray-400"><X className="size-4" /></button>
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <span className="text-sm text-gray-200 font-medium">{authUser.role || "Employee"}</span>
              <button onClick={() => { setIsEditingRole(true); setNewRole(authUser.role || ""); }} className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-[#222] opacity-0 group-hover:opacity-100 transition-all"><Edit2 className="size-3.5" /></button>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="p-5">
          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1.5 mb-2"><Mail className="size-3" />Email Address</label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-200 font-medium">{authUser.email}</span>
            <button onClick={() => setIsChangingEmail(true)} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline">Change</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#2f2f2f] rounded-2xl border border-[#3f3f3f] p-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Member since</span>
          <span className="text-gray-300 font-medium">{authUser.createdAt?.split("T")[0]}</span>
        </div>
        <div className="px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-500/20">Active</div>
      </div>
    </div>
  );

  const renderWorkspace = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold text-white">Workspace</h2>
        <p className="text-gray-500 text-sm mt-1">Your current organization details</p>
      </div>

      {currentOrg ? (
        <>
          <div className="bg-[#2f2f2f] rounded-2xl border border-[#3f3f3f] divide-y divide-[#222]">
            <FieldRow label="Organization" value={currentOrg.name} />
            {currentOrg.registrationNumber && <FieldRow label="Registration ID" value={currentOrg.registrationNumber} mono />}
            {currentOrg.joinCode && (
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Invite Code</p>
                  <p className="text-sm text-gray-200 font-mono tracking-widest">{currentOrg.joinCode}</p>
                </div>
                <button onClick={() => copyToClipboard(currentOrg.joinCode)} className="p-2 rounded-lg bg-[#222] hover:bg-[#4a4a4a] text-gray-400 hover:text-white transition-colors"><Copy className="size-4" /></button>
              </div>
            )}
            <FieldRow label="Members" value={`${orgMembers?.length || 0} people`} />
            <FieldRow label="Your Access Level" value={myAccessLevel} capitalize />
            {myMembership?.employeeId && (
              <FieldRow label="Your Employee ID" value={myMembership.employeeId} mono />
            )}
            
            {/* Reporting Manager Section */}
            {myAccessLevel !== "owner" && !isTopLevel && (
              <div className="p-5">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2 block">Reporting Manager</label>
                {isEditingManager ? (
                  <div className="flex gap-2">
                    <input type="text" value={newManagerId} onChange={(e) => setNewManagerId(e.target.value)} placeholder="e.g. EMP-1042" className="flex-1 px-3 py-2 bg-[#171717] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 uppercase" autoFocus />
                    <button onClick={handleManagerSave} className="p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-400"><Check className="size-4" /></button>
                    <button onClick={() => setIsEditingManager(false)} className="p-2 bg-[#222] hover:bg-[#4a4a4a] rounded-lg text-gray-400"><X className="size-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <div>
                      {managerMember ? (
                        <div>
                          <span className="text-sm text-gray-200 font-medium block">{managerMember.userId?.fullName || managerMember.fullName}</span>
                          <span className="text-xs text-gray-500">ID: {managerMember.employeeId}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Not Assigned</span>
                      )}
                    </div>
                    <button onClick={() => { setIsEditingManager(true); setNewManagerId(managerMember?.employeeId || ""); }} className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 font-medium text-xs transition-all">Change</button>
                  </div>
                )}
              </div>
            )}

            {currentOrg.ownerId === authUser?._id && (
              <div className="p-5"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">Owner</span></div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-[#2f2f2f] rounded-2xl border border-[#3f3f3f] p-10 text-center text-gray-500">No workspace selected</div>
      )}
    </div>
  );

  const renderNotifications = () => {
    const items = [
      { key: "messages", label: "Messages", desc: "Direct and group messages" },
      { key: "tasks", label: "Task Assignments", desc: "When tasks are assigned to you" },
      { key: "meetings", label: "Meeting Reminders", desc: "Upcoming meeting alerts" },
      { key: "mentions", label: "Channel Mentions", desc: "When someone mentions you" },
    ];
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          <p className="text-gray-500 text-sm mt-1">Choose what alerts you receive</p>
        </div>
        <div className="bg-[#2f2f2f] rounded-2xl border border-[#3f3f3f] divide-y divide-[#222]">
          {items.map(item => (
            <div key={item.key} className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-200 font-medium">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
              <button onClick={() => toggleNotif(item.key)} className={`w-10 h-6 rounded-full relative transition-colors ${notifPrefs[item.key] !== false ? "bg-indigo-500" : "bg-[#4a4a4a]"}`}>
                <div className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all ${notifPrefs[item.key] !== false ? "left-5" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 text-center">Preferences are saved locally on this device</p>
      </div>
    );
  };

  const renderSecurity = () => {
    const localDeviceId = localStorage.getItem("orchestr_deviceId");
    
    return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold text-white">Security & Devices</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your active sessions and device PINs</p>
      </div>

      <div className="bg-[#2f2f2f] rounded-2xl border border-[#3f3f3f] divide-y divide-[#222]">
        <div className="p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Login Method</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#353535] border border-[#3f3f3f] text-sm text-gray-300"><Mail className="size-3.5" />Email OTP</span>
            {authUser.googleId && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#353535] border border-[#3f3f3f] text-sm text-gray-300">
              <svg className="size-3.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google Connected
            </span>}
          </div>
        </div>
        <div className="p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-3">Authorized Devices (DTPin)</p>
          {authUser.devices?.length > 0 ? (
            <div className="space-y-3">
              {authUser.devices.map(device => (
                <div key={device.deviceId} className="flex items-center justify-between p-3 rounded-xl bg-[#252525] border border-[#3f3f3f]">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-200">{device.deviceName}</span>
                      {device.deviceId === localDeviceId && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">Current</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">Last login: {new Date(device.lastLoginAt).toLocaleDateString()}</span>
                  </div>
                  {device.deviceId !== localDeviceId && (
                    <button 
                      onClick={() => {
                        if (confirm(`Revoke access for ${device.deviceName}?`)) {
                          useAuthStore.getState().revokeDevice(device.deviceId);
                        }
                      }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20"
                      title="Revoke Device Access"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
               <p className="text-sm text-yellow-500 font-medium">No devices secured with Fast PIN yet.</p>
               <p className="text-xs text-yellow-500/70 mt-1">Sign out and log in again to set up a Device-Tethered PIN.</p>
            </div>
          )}
        </div>
        <div className="p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Account Created</p>
          <p className="text-sm text-gray-300">{new Date(authUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 font-semibold text-sm transition-colors">
          <LogOut className="size-4" />Sign Out
        </button>
        <button onClick={() => toast("Account deletion is not yet available. Contact support.", { icon: "⚠️" })} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#2f2f2f] hover:bg-[#353535] border border-[#3f3f3f] text-gray-500 font-medium text-sm transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  )};

  const contentMap = { profile: renderProfile, workspace: renderWorkspace, notifications: renderNotifications, security: renderSecurity };

  return (
    <div className="h-full w-full bg-[#212121] flex flex-col">
      {/* Universal Mobile Header */}
      <div className="p-4 border-b border-[#3f3f3f] bg-[#171717]/80 backdrop-blur-md sticky top-0 z-10 md:hidden flex items-center gap-3">
        <button onClick={() => navigate(currentOrg ? `/workspace/${currentOrg._id}/chat` : "/")} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full"><ArrowLeft className="size-5" /></button>
        <h1 className="text-lg font-bold text-white">Settings</h1>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row w-full">
        {/* Navigation Sidebar (Desktop) / Horizontal Swipe (Mobile) */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-[#3f3f3f] bg-[#171717] flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 hide-scrollbar">
          <div className="p-5 hidden md:flex items-center gap-3 cursor-pointer group" onClick={() => navigate(currentOrg ? `/workspace/${currentOrg._id}/chat` : "/")}>
            <div className="p-2 bg-[#353535] rounded-xl group-hover:bg-[#222] transition-colors"><ArrowLeft className="size-4 text-gray-400 group-hover:text-white" /></div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
          </div>
          <div className="flex md:flex-col gap-2 p-2 md:px-3 md:py-0 w-max md:w-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-3 rounded-full md:rounded-xl transition-all text-left shrink-0 ${activeTab === tab.id ? "bg-[#353535] border border-[#3f3f3f]" : "hover:bg-[#2f2f2f] border border-transparent"}`}>
                
                <div className={`p-2 rounded-lg transition-colors hidden md:block ${activeTab === tab.id ? "bg-white text-black" : "bg-[#353535] text-gray-500"}`}>
                  <tab.icon className="size-4" />
                </div>
                
                <div className="flex items-center gap-2 md:block min-w-0">
                  <tab.icon className={`size-4 md:hidden ${activeTab === tab.id ? "text-white" : "text-gray-400"}`} />
                  <h3 className={`text-[13px] md:text-sm whitespace-nowrap ${activeTab === tab.id ? "text-white font-semibold" : "text-gray-400"}`}>{tab.label}</h3>
                  <p className="text-[11px] text-gray-600 truncate hidden md:block">{tab.desc}</p>
                </div>
                
                <ChevronRight className={`size-3.5 hidden md:block ${activeTab === tab.id ? "text-white" : "text-gray-700"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#212121] overflow-y-auto p-4 md:p-8 lg:p-10">
          {contentMap[activeTab]?.()}
        </div>
      </div>

      {/* Email Change Modal */}
      {isChangingEmail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2f2f2f] rounded-2xl max-w-md w-full p-6 border border-[#3f3f3f] relative">
            <button onClick={() => { setIsChangingEmail(false); setShowOtpInput(false); }} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="size-5" /></button>
            <h2 className="text-xl font-bold text-white mb-1">Change Email</h2>
            <p className="text-sm text-gray-500 mb-6">You'll need to verify your new email address</p>

            {!showOtpInput ? (
              <form onSubmit={handleRequestEmailChange} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-medium">New Email Address</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-4 py-3 bg-[#171717] border border-[#333] rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm" placeholder="you@example.com" required />
                </div>
                <button type="submit" disabled={isUpdatingProfile} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                  {isUpdatingProfile ? "Sending..." : "Send Verification Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 mb-2">
                  <p className="text-sm text-indigo-200">Code sent to <span className="font-bold">{newEmail}</span></p>
                </div>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-3 bg-[#171717] border border-[#333] rounded-xl text-white focus:outline-none focus:border-indigo-500 text-center tracking-[0.3em] text-xl font-mono" placeholder="000000" required />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowOtpInput(false)} className="flex-1 bg-[#222] hover:bg-[#4a4a4a] text-white font-semibold py-3 rounded-xl text-sm">Back</button>
                  <button type="submit" disabled={isUpdatingProfile} className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm">
                    {isUpdatingProfile ? "Verifying..." : "Verify & Update"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FieldRow = ({ label, value, mono, capitalize }) => (
  <div className="p-5">
    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{label}</p>
    <p className={`text-sm text-gray-200 font-medium ${mono ? "font-mono tracking-widest" : ""} ${capitalize ? "capitalize" : ""}`}>{value}</p>
  </div>
);

export default SettingsPage;
