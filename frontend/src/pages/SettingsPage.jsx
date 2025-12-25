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
    <div className="h-full w-full bg-gray-900 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Sidebar / Info */}
        <div className="md:col-span-1">
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex flex-col items-center relative">
              <div className="absolute left-4 top-4">
                <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
                  ←
                </button>
              </div>
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 mb-4"
              />
              <h3 className="text-xl font-bold text-white">{authUser?.fullName}</h3>
              <p className="text-sm text-gray-400">{authUser?.email}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Member Since</span>
                <span className="font-medium text-white">{new Date(authUser?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Status</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 border-t border-gray-700">
              <button className="w-full py-2 px-4 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 hover:bg-gray-600 font-medium transition-colors" onClick={() => navigate('/profile')}>
                Edit Profile
              </button>
            </div>
          </div>

          <button className="hidden md:block w-full mt-4 text-red-500 text-sm hover:underline" onClick={useAuthStore.getState().logout}>
            Sign Out
          </button>
        </div>

        {/* Main Content / Preview */}
        <div className="md:col-span-2">
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-4 text-white">Theme Preview</h3>
            <p className="text-sm text-gray-400 mb-8">This is how your chat interface looks.</p>

            <div className="rounded-xl border border-gray-700 overflow-hidden bg-gray-900">
              <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs">JD</div>
                <div>
                  <h4 className="font-bold text-white text-sm leading-none">John Doe</h4>
                  <p className="text-xs text-green-600 mt-1">Active</p>
                </div>
              </div>

              <div className="p-4 space-y-4 min-h-[200px] bg-gray-900">
                {PREVIEW_MESSAGES.map((message) => (
                  <div key={message.id} className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${message.isSent
                      ? "bg-white text-black rounded-br-sm"
                      : "bg-gray-800 text-gray-200 rounded-bl-sm"
                      }`}>
                      <p>{message.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${message.isSent ? "text-gray-500" : "text-gray-500"}`}>
                        12:00 PM
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex gap-2">
                  <input type="text" value="Start typing..." readOnly className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-500" />
                  <button className="bg-white text-black p-2 rounded-lg"><Send size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;