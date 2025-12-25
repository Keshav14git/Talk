import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { User, MessageSquare, Lock, HelpCircle, LogOut, Send, ArrowLeft, ChevronRight, Globe, Bell, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User, desc: "Manage your personal info" },
    { id: "chat", label: "Chat Settings", icon: MessageSquare, desc: "Theme & wallpapers" },
    { id: "privacy", label: "Privacy & Security", icon: Lock, desc: "Controls & blocked users" },
    { id: "help", label: "Help & Support", icon: HelpCircle, desc: "FAQs & contact" },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header (Mobile only mainly, or global breadcrumb) */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10 md:hidden flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold text-white">Settings</h1>
      </div>

      <div className="flex-1 overflow-hidden flex max-w-7xl mx-auto w-full">

        {/* Sidebar Navigation */}
        <div className="w-full md:w-80 border-r border-gray-800 bg-gray-900 flex flex-col overflow-y-auto">
          <div className="p-6 hidden md:block">
            <div className="flex items-center gap-3 mb-8 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="p-2 bg-gray-800 rounded-xl group-hover:bg-gray-700 transition-colors">
                <ArrowLeft className="size-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>
          </div>

          <div className="px-4 space-y-2 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group text-left
                  ${activeTab === tab.id
                    ? "bg-gray-800 border border-gray-700 shadow-sm"
                    : "hover:bg-gray-800/50 border border-transparent hover:border-gray-800"
                  }`}
              >
                <div className={`p-2.5 rounded-xl transition-colors ${activeTab === tab.id ? "bg-white text-black" : "bg-gray-800 text-gray-400 group-hover:text-white"}`}>
                  <tab.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${activeTab === tab.id ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                    {tab.label}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{tab.desc}</p>
                </div>
                <ChevronRight className={`size-4 transition-transform ${activeTab === tab.id ? "text-white translate-x-1" : "text-gray-600 group-hover:text-gray-400"}`} />
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-800 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors group border border-transparent hover:border-red-500/20"
            >
              <LogOut className="size-5" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-900 overflow-y-auto custom-scrollbar p-4 md:p-8 lg:p-12">

          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Profile Information</h2>
                <p className="text-gray-400">Manage your public profile details</p>
              </div>

              <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700 flex flex-col md:flex-row items-center gap-6">
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-28 rounded-full object-cover border-4 border-gray-700"
                />
                <div className="flex-1 text-center md:text-left space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{authUser?.fullName}</h3>
                    <p className="text-gray-400">{authUser?.email}</p>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">
                      <Globe className="size-3" />
                      Active Status
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-xs font-medium">
                      Member since {new Date(authUser?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* Chat Settings / Theme */}
          {activeTab === 'chat' && (
            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Chat Settings</h2>
                <p className="text-gray-400">Customize your chat experience and themes</p>
              </div>

              <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Moon className="size-5" />
                    Theme Preview
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">MONOCHROME_DARK</span>
                </div>

                {/* Preview Component */}
                <div className="rounded-2xl border border-gray-700 overflow-hidden bg-gray-900 shadow-inner">
                  <div className="bg-gray-800/80 backdrop-blur border-b border-gray-700 p-4 flex items-center gap-3">
                    <div className="size-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-gray-800">JD</div>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-none">John Doe</h4>
                      <p className="text-[10px] text-green-400 mt-1 font-medium">Active now</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 min-h-[220px] bg-gray-900 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]">
                    {PREVIEW_MESSAGES.map((message) => (
                      <div key={message.id} className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-4 py-2 text-sm shadow-sm ${message.isSent
                          ? "bg-gray-700 text-white rounded-2xl rounded-tr-sm border border-gray-600"
                          : "bg-[#111] text-gray-200 rounded-2xl rounded-tl-sm border border-gray-800"
                          }`}>
                          <p>{message.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${message.isSent ? "text-gray-400" : "text-gray-600"}`}>
                            12:00 PM
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-gray-800 border-t border-gray-700">
                    <div className="flex gap-2">
                      <input type="text" value="Start typing..." readOnly className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-500 outline-none" />
                      <button className="bg-white text-black p-2.5 rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"><Send size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Section (Mock) */}
          {activeTab === 'privacy' && (
            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Privacy & Security</h2>
                <p className="text-gray-400">Control who can see you and your info</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Last Seen", val: "Everyone" },
                  { title: "Profile Photo", val: "My Contacts" },
                  { title: "Read Receipts", val: "On", active: true },
                  { title: "Blocked Users", val: "2 blocked" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-750 transition-colors">
                    <span className="font-semibold text-white">{item.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">{item.val}</span>
                      <ChevronRight className="size-4 text-gray-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Section (Mock) */}
          {activeTab === 'help' && (
            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Help & Support</h2>
                <p className="text-gray-400">Get help with the application</p>
              </div>

              <div className="bg-gray-800 rounded-3xl p-1 border border-gray-700 overflow-hidden">
                {[
                  "Frequently Asked Questions",
                  "Contact Support",
                  "Terms of Service",
                  "Privacy Policy"
                ].map((item, i) => (
                  <button key={i} className="w-full text-left p-5 hover:bg-gray-700/50 transition-colors border-b border-gray-700 last:border-b-0 flex items-center justify-between group">
                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{item}</span>
                    <ChevronRight className="size-4 text-gray-600 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default SettingsPage;