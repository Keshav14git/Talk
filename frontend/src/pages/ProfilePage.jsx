import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Edit2, Check, X, Lock } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, requestEmailChange, verifyEmailChange } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  // Name Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(authUser?.fullName || "");

  // Email Change State
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleNameSave = async () => {
    if (!newName.trim()) return;
    await updateProfile({ fullName: newName });
    setIsEditingName(false);
  };

  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    const success = await requestEmailChange(newEmail);
    if (success) {
      setShowOtpInput(true);
    }
  };

  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;
    const success = await verifyEmailChange(otp);
    if (success) {
      setIsChangingEmail(false);
      setShowOtpInput(false);
      setNewEmail("");
      setOtp("");
    }
  };

  return (
    <div className="h-full w-full bg-gray-900 p-4 md:p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
          <div className="p-8 border-b border-gray-700 text-center relative">
            <div className="absolute left-8 top-8">
              <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white font-medium text-sm flex items-center gap-1">
                ← Back
              </button>
            </div>
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your account information</p>
          </div>

          <div className="p-8">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative">
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-sm bg-gray-200"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`
                            absolute bottom-0 right-0 
                            bg-gray-700 text-white border border-gray-600
                            p-2 rounded-full cursor-pointer 
                            transition-all hover:bg-gray-600 shadow-sm
                            ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                            `}
                >
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {isUpdatingProfile ? "Uploading..." : "Click camera icon to update"}
              </p>
            </div>

            {/* Fields */}
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                      <button onClick={handleNameSave} className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setIsEditingName(false)} className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 text-sm font-medium flex justify-between items-center group">
                      {authUser?.fullName}
                      <button onClick={() => { setIsEditingName(true); setNewName(authUser.fullName); }} className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <div className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 text-sm font-medium flex justify-between items-center">
                  {authUser?.email}
                  <button onClick={() => setIsChangingEmail(true)} className="text-blue-400 hover:text-blue-300 text-xs hover:underline">
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-800/50 border-t border-gray-700 rounded-b-lg flex justify-between items-center text-sm">
            <div>
              <span className="text-gray-400 mr-2">Member Since</span>
              <span className="font-medium text-gray-200">{authUser.createdAt?.split("T")[0]}</span>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
              Active Account
            </div>
          </div>
        </div>
      </div>

      {/* Email Change Modal */}
      {isChangingEmail && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700 relative">
            <button
              onClick={() => { setIsChangingEmail(false); setShowOtpInput(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Change Email Address</h2>

            {!showOtpInput ? (
              <form onSubmit={handleRequestEmailChange} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">New Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter new email"
                    required
                  />
                </div>
                <button type="submit" disabled={isUpdatingProfile} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                  {isUpdatingProfile ? "Sending Code..." : "Send Verification Code"}
                </button>
                <p className="text-xs text-yellow-500/80 mt-2">
                  You will be required to verify this email before using it on your account.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30 mb-4">
                  <p className="text-sm text-blue-200">
                    We sent a code to <span className="font-bold">{newEmail}</span>. Enter it below.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-center tracking-widest text-xl"
                    placeholder="123456"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpInput(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                  >
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
export default ProfilePage;