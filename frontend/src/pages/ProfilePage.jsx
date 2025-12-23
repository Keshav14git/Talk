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
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl border border-white/60 ring-1 ring-white/50 relative overflow-hidden">

          <div className="text-center mb-10 relative z-10">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Profile</h1>
            <p className="mt-2 text-gray-500">Manage your personal information</p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-6 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary via-purple-500 to-secondary animate-gradient-xy">
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-inner"
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-1 right-1 
                  bg-gray-900 hover:bg-black text-white
                  p-2.5 rounded-full cursor-pointer 
                  transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none bg-gray-600" : ""}
                `}
              >
                <Camera className="w-4 h-4" />
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
            <p className="text-sm text-gray-400 font-medium">
              {isUpdatingProfile ? "Uploading..." : "Tap to change photo"}
            </p>
          </div>

          {/* Details Section */}
          <div className="space-y-6 mt-10 relative z-10">
            <div className="space-y-2">
              <div className="text-sm text-gray-500 font-medium flex items-center gap-2 px-1">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-5 py-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-gray-900 font-semibold shadow-sm focus-within:ring-2 ring-primary/20 transition-all">
                {authUser?.fullName}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-500 font-medium flex items-center gap-2 px-1">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-5 py-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-gray-900 font-semibold shadow-sm">
                {authUser?.email}
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
              <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Member Since</span>
              <span className="font-bold text-gray-800">{authUser.createdAt?.split("T")[0]}</span>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
              <span className="block text-xs text-green-600 uppercase tracking-wider mb-1">Status</span>
              <span className="font-bold text-green-700">Active</span>
            </div>
          </div>

          {/* Background Decorative Blobs */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

        </div>
      </div>
    </div>
  );
};
export default ProfilePage;