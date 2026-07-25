import { useState } from "react";
import { useOrgStore } from "../store/useOrgStore";
import { useParams } from "react-router-dom";
import { UserPlus, Briefcase, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const ManagerMappingModal = ({ onClose }) => {
    const { orgId } = useParams();
    const { setManager } = useOrgStore();
    const [managerId, setManagerId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!managerId.trim()) {
            toast.error("Please enter your manager's Employee ID");
            return;
        }

        setIsLoading(true);
        const success = await setManager(orgId, managerId.trim().toUpperCase());
        setIsLoading(false);

        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-[#2f2f2f] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-8 text-center border-b border-[#2f2f2f]">
                    <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl mx-auto flex items-center justify-center mb-4 border border-[#2f2f2f] shadow-lg">
                        <UserPlus className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Who is your manager?</h2>
                    <p className="text-[13px] text-gray-400 max-w-sm mx-auto">
                        To automatically route your requests (Leave, IT, etc.), please enter your reporting manager's Employee ID.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-400 mb-2">Manager Employee ID</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                required
                                value={managerId}
                                onChange={(e) => setManagerId(e.target.value)}
                                placeholder="e.g. EMP-4029"
                                className="block w-full pl-10 bg-[#0a0a0a] border border-[#2f2f2f] rounded-xl py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all uppercase"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? "Verifying..." : "Map Manager"}
                        {!isLoading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <div className="text-center">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            I don't have a manager (Skip)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManagerMappingModal;
