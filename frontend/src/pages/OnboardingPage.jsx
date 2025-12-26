import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OnboardingPage = () => {
    const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
    const [fullName, setFullName] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fullName.trim()) return;

        await updateProfile({ fullName });
        navigate("/");
    };

    if (!authUser) return null;

    return (
        <div className="min-h-screen grid place-items-center bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
                <div className="p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 transition-colors">
                            <MessageSquare className="size-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-white text-center">Welcome to Talk!</h1>
                        <p className="text-gray-400 text-center mt-2">Let's get to know you. What should we call you?</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-control">
                            <label className="label mb-2 block">
                                <span className="label-text font-medium text-gray-300">Full Name</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="size-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="input input-bordered w-full pl-10 bg-gray-900 border-gray-700 text-white focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-3"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                            disabled={isUpdatingProfile}
                        >
                            {isUpdatingProfile ? "Saving..." : "Get Started"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
