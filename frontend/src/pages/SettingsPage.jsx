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
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-base-content/70">Manage your account and preferences</p>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={authUser?.profilePic || "/avatar.png"} alt="Profile" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold">{authUser?.fullName}</h4>
                <p className="text-base-content/60">{authUser?.email}</p>
                <p className="text-xs text-base-content/40 mt-1">Member since {new Date(authUser?.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex flex-col gap-2">
                <button className="btn btn-neutral btn-sm" onClick={() => navigate('/profile')}>
                  Edit Profile
                </button>
                <button className="btn btn-error btn-sm text-white" onClick={useAuthStore.getState().logout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section - Kept for visual reference of the theme */}
        <h3 className="text-lg font-semibold mb-3">Interface Preview</h3>
        <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
          <div className="p-4 bg-base-200">
            <div className="max-w-lg mx-auto">
              {/* Mock Chat UI */}
              <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-base-300 bg-base-100/50 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                      J
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">John Doe</h3>
                      <p className="text-xs text-base-content/70">Online</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                  {PREVIEW_MESSAGES.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`
                          max-w-[80%] rounded-2xl p-2.5 shadow-none
                          ${message.isSent ? "bg-primary text-primary-content rounded-tr-sm" : "bg-base-200 text-base-content rounded-tl-sm"}
                        `}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p
                          className={`
                            text-[9px] mt-1
                            ${message.isSent ? "text-primary-content/70" : "text-base-content/60"}
                          `}
                        >
                          12:00 PM
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-base-content/10 bg-base-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input input-sm h-9 flex-1 text-sm rounded-full bg-base-200 border-none"
                      placeholder="Type a message..."
                      value="This is a preview"
                      readOnly
                    />
                    <button className="btn btn-primary h-9 min-h-0 w-9 btn-circle shadow-sm">
                      <Send size={16} />
                    </button>
                  </div>
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