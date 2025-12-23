import { Send } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 px-4 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar / Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 shadow-xl border border-white/60 ring-1 ring-white/50">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Settings</h2>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary">
                  <img
                    src={authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-white"
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">{authUser?.fullName}</h3>
                <p className="text-sm text-gray-500">{authUser?.email}</p>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                  Active
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mt-4">
              <div className="flex justify-between items-center text-sm py-2 border-b border-gray-200">
                <span className="text-gray-500">Member Since</span>
                <span className="font-medium text-gray-900">{new Date(authUser?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <button className="btn btn-primary w-full mt-6 rounded-xl font-semibold shadow-lg shadow-primary/20" onClick={() => navigate('/profile')}>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Main Content / Preview */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-8 shadow-xl border border-white/60 ring-1 ring-white/50">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Interface Preview</h3>

            <div className="rounded-3xl border border-gray-200 overflow-hidden bg-gray-50 shadow-inner">
              <div className="p-6 bg-gray-100/50">
                <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
                  {/* Mock Chat Header */}
                  <div className="px-5 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      J
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">John Doe</h4>
                      <p className="text-xs text-green-500 font-medium">Online</p>
                    </div>
                  </div>

                  {/* Mock Messages */}
                  <div className="p-5 space-y-4 min-h-[240px] bg-white">
                    {PREVIEW_MESSAGES.map((message) => (
                      <div key={message.id} className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-[1.2rem] px-4 py-3 shadow-sm ${message.isSent
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-none"
                          : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
                          }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-[10px] mt-1.5 ${message.isSent ? "text-indigo-100" : "text-gray-400"}`}>
                            12:00 PM
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mock Input */}
                  <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value="This is a preview"
                        className="flex-1 bg-gray-100 border-0 rounded-full px-4 text-sm text-gray-600 focus:outline-none"
                      />
                      <button className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="btn btn-ghost text-red-500 hover:bg-red-50 rounded-xl" onClick={useAuthStore.getState().logout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;