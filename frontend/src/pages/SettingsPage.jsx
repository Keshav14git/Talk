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
    <div className="h-full w-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Sidebar / Info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col items-center">
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 mb-4"
              />
              <h3 className="text-xl font-bold text-gray-900">{authUser?.fullName}</h3>
              <p className="text-sm text-gray-500">{authUser?.email}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Member Since</span>
                <span className="font-medium text-gray-900">{new Date(authUser?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button className="w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors" onClick={() => navigate('/profile')}>
                Edit Profile
              </button>
            </div>
          </div>

          <button className="hidden md:block w-full mt-4 text-red-600 text-sm hover:underline" onClick={useAuthStore.getState().logout}>
            Sign Out
          </button>
        </div>

        {/* Main Content / Preview */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Theme Preview</h3>
            <p className="text-sm text-gray-500 mb-8">This is how your chat interface looks.</p>

            <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-100">
              <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">JD</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-none">John Doe</h4>
                  <p className="text-xs text-green-600 mt-1">Active</p>
                </div>
              </div>

              <div className="p-4 space-y-4 min-h-[200px] bg-white">
                {PREVIEW_MESSAGES.map((message) => (
                  <div key={message.id} className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${message.isSent
                      ? "bg-[#1164A3] text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}>
                      <p>{message.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${message.isSent ? "text-blue-100" : "text-gray-400"}`}>
                        12:00 PM
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <input type="text" value="Start typing..." readOnly className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500" />
                  <button className="bg-[#007a5a] text-white p-2 rounded-lg"><Send size={16} /></button>
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