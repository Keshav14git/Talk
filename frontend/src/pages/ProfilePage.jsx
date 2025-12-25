import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

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

  return (
    <div className="h-full w-full bg-gray-900 p-6 overflow-y-auto">
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
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <div className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 text-sm font-medium">
                  {authUser?.fullName}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <div className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 text-sm font-medium">
                  {authUser?.email}
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
    </div>
  );
};
export default ProfilePage;