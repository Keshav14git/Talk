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
    <div className="h-full w-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8 border-b border-gray-100 text-center relative">
            <div className="absolute left-8 top-8">
              <button onClick={() => window.history.back()} className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center gap-1">
                ← Back
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
          </div>

          <div className="p-8">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative">
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm bg-gray-200"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`
                            absolute bottom-0 right-0 
                            bg-white text-gray-700 border border-gray-300
                            p-2 rounded-full cursor-pointer 
                            transition-all hover:bg-gray-50 shadow-sm
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
              <p className="text-xs text-gray-500 mt-3">
                {isUpdatingProfile ? "Uploading..." : "Click camera icon to update"}
              </p>
            </div>

            {/* Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-medium">
                  {authUser?.fullName}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-medium">
                  {authUser?.email}
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-between items-center text-sm">
            <div>
              <span className="text-gray-500 mr-2">Member Since</span>
              <span className="font-medium text-gray-900">{authUser.createdAt?.split("T")[0]}</span>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Active Account
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;