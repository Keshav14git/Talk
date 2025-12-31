import { useState, useEffect } from "react";
import { X, Calendar, Clock, Link as LinkIcon, Users, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHomeStore } from "../store/useHomeStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import format from "date-fns/format";

const CreateMeetingModal = ({ isOpen, onClose, selectedSlot, onSuccess }) => {
    const { authUser } = useAuthStore();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        link: "",
        attendees: []
    });
    const [isLoading, setIsLoading] = useState(false);

    // Reset or populate when slot changes
    useEffect(() => {
        if (selectedSlot) {
            setFormData(prev => ({ ...prev, title: "", description: "", link: "", attendees: [] }));
        }
    }, [selectedSlot]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Basic meeting creation
            // Note: In a real app, we'd have a user selector for attendees. 
            // For now we'll just add the current user (if backend requires it) or leave empty if backend handles it.
            // The backend requires 'attendees' array of userIds.

            await axiosInstance.post("/calendar/meetings", {
                ...formData,
                startTime: selectedSlot.start,
                endTime: selectedSlot.end,
                attendees: [authUser._id] // Auto-add self, simplified for this step
            });

            toast.success("Meeting scheduled successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to schedule meeting", error);
            toast.error(error.response?.data?.message || "Failed to schedule meeting");
        } finally {
            setIsLoading(false);
        }
    };

    const isMultiDay = selectedSlot?.start && selectedSlot?.end &&
        selectedSlot.start.toDateString() !== selectedSlot.end.toDateString();

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#121214] border border-[#27272a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="p-5 border-b border-[#27272a] flex justify-between items-center bg-[#18181b]">
                        <div>
                            <h2 className="text-xl font-bold text-white">Schedule Meeting</h2>
                            <p className="text-xs text-gray-500 mt-1">Add a new event to your timeline</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#27272a] text-gray-400 hover:text-white transition-colors">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">

                        {/* Time Slots Preview */}
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 flex items-center gap-3">
                            <Clock className="size-5 text-indigo-400 shrink-0" />
                            <div className="text-sm">
                                <div className="text-indigo-200 font-medium">Selected Time Window</div>
                                <div className="text-indigo-300/80 text-xs">
                                    {selectedSlot?.start && (
                                        <>
                                            {format(selectedSlot.start, "MMM d, h:mm a")}
                                            {" - "}
                                            {selectedSlot?.end && format(selectedSlot.end, isMultiDay ? "MMM d, h:mm a" : "h:mm a")}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                <Calendar className="size-3.5" />
                                Event Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Sprint Review, Team Sync"
                                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-gray-600"
                                required
                                autoFocus
                            />
                        </div>

                        {/* Link */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                <LinkIcon className="size-3.5" />
                                Meeting Link (Optional)
                            </label>
                            <input
                                type="url"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                placeholder="https://meet.google.com/..."
                                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-gray-600"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                <AlignLeft className="size-3.5" />
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Add agenda or notes..."
                                rows={3}
                                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-gray-600 resize-none"
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Scheduling...
                                    </>
                                ) : (
                                    "Save Event"
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateMeetingModal;
