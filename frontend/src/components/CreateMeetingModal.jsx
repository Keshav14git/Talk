import { useState, useEffect, useRef } from "react";
import { X, Calendar, Clock, Link as LinkIcon, Users, AlignLeft, MapPin, Video, MonitorPlay, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useOrgStore } from "../store/useOrgStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import format from "date-fns/format";

const CreateMeetingModal = ({ isOpen, onClose, selectedSlot, onSuccess }) => {
    const { authUser } = useAuthStore();
    const { currentOrg } = useOrgStore();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        attendees: [],
        type: "online", // 'online' | 'offline'
        platform: "internal", // 'internal' | 'external'
        link: "",
        joinId: "",
        location: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    
    // Attendee Selection State
    const { orgMembers } = useOrgStore();
    const [attendeeSearch, setAttendeeSearch] = useState("");
    const [showAttendeeDropdown, setShowAttendeeDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowAttendeeDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredMembers = (orgMembers || []).filter(
        (member) =>
            member._id !== authUser._id &&
            member.fullName.toLowerCase().includes(attendeeSearch.toLowerCase())
    );

    const toggleAttendee = (userId) => {
        setFormData((prev) => {
            const isSelected = prev.attendees.includes(userId);
            return {
                ...prev,
                attendees: isSelected
                    ? prev.attendees.filter((id) => id !== userId)
                    : [...prev.attendees, userId],
            };
        });
    };

    // Auto-generate a random Join ID if Internal is selected initially
    const generateJoinId = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    // Reset or populate when slot changes
    useEffect(() => {
        if (selectedSlot) {
            setFormData({
                title: "",
                description: "",
                attendees: [],
                type: "online",
                platform: "internal",
                link: "",
                joinId: generateJoinId(),
                location: ""
            });
        }
    }, [selectedSlot]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentOrg) {
            toast.error("Please select an organization first");
            return;
        }

        setIsLoading(true);

        try {
            // Basic meeting creation
            await axiosInstance.post(`/calendar/${currentOrg._id}/meetings`, {
                ...formData,
                startTime: selectedSlot.start,
                endTime: selectedSlot.end,
                attendees: [...new Set([...formData.attendees, authUser._id])] // Auto-add self and selected
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
                    className="bg-[#121214] border border-[#27272a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="p-5 border-b border-[#27272a] flex justify-between items-center bg-[#18181b] sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl font-bold text-white">Schedule Meeting</h2>
                            <p className="text-xs text-gray-500 mt-1">Add a new event to your timeline</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#27272a] text-gray-400 hover:text-white transition-colors">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-5 space-y-5">

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

                        {/* Event Title */}
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

                        {/* Meeting Type Selection */}
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`cursor-pointer border rounded-lg p-3 flex flex-col gap-2 transition-all ${formData.type === 'online' ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-[#09090b] border-[#27272a] opacity-60 hover:opacity-100'}`}>
                                <div className="flex items-center gap-2">
                                    <input type="radio" className="hidden" name="type" value="online" checked={formData.type === 'online'} onChange={() => setFormData({ ...formData, type: 'online' })} />
                                    <Video className={`size-4 ${formData.type === 'online' ? 'text-indigo-400' : 'text-gray-400'}`} />
                                    <span className={`text-sm font-medium ${formData.type === 'online' ? 'text-indigo-200' : 'text-gray-400'}`}>Online</span>
                                </div>
                                <span className="text-[10px] text-gray-500 leading-tight">Virtual meeting via link or app</span>
                            </label>

                            <label className={`cursor-pointer border rounded-lg p-3 flex flex-col gap-2 transition-all ${formData.type === 'offline' ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-[#09090b] border-[#27272a] opacity-60 hover:opacity-100'}`}>
                                <div className="flex items-center gap-2">
                                    <input type="radio" className="hidden" name="type" value="offline" checked={formData.type === 'offline'} onChange={() => setFormData({ ...formData, type: 'offline' })} />
                                    <MapPin className={`size-4 ${formData.type === 'offline' ? 'text-indigo-400' : 'text-gray-400'}`} />
                                    <span className={`text-sm font-medium ${formData.type === 'offline' ? 'text-indigo-200' : 'text-gray-400'}`}>In-Person</span>
                                </div>
                                <span className="text-[10px] text-gray-500 leading-tight">Physical location or office</span>
                            </label>
                        </div>

                        {/* Conditional Fields based on Type */}
                        <AnimatePresence mode="wait">
                            {formData.type === 'online' ? (
                                <motion.div
                                    key="online-fields"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    {/* Platform Selection */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-400">Meeting Platform</label>
                                        <div className="flex bg-[#09090b] p-1 rounded-lg border border-[#27272a]">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, platform: 'internal' })}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${formData.platform === 'internal' ? 'bg-[#27272a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                AssessIQ App
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, platform: 'external' })}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${formData.platform === 'external' ? 'bg-[#27272a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                External Link
                                            </button>
                                        </div>
                                    </div>

                                    {/* Link or ID Input */}
                                    {formData.platform === 'external' ? (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                                <LinkIcon className="size-3.5" />
                                                Video Call URL
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.link}
                                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                                placeholder="https://meet.google.com/..."
                                                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                                <MonitorPlay className="size-3.5" />
                                                Meeting ID
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={formData.joinId}
                                                    onChange={(e) => setFormData({ ...formData, joinId: e.target.value })}
                                                    placeholder="Meeting ID"
                                                    className="flex-1 bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors font-mono tracking-wider"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, joinId: generateJoinId() })}
                                                    className="px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-xs hover:bg-[#27272a] transition-colors"
                                                >
                                                    Generate
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-gray-500">Share this ID with others to join directly in the app.</p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="offline-fields"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1.5 overflow-hidden"
                                >
                                    <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                        <MapPin className="size-3.5" />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g. Conference Room A, 5th Floor"
                                        className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

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

                        {/* Attendees Selection */}
                        <div className="space-y-2 relative" ref={dropdownRef}>
                            <label className="text-xs font-medium text-gray-400 flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Users className="size-3.5" /> Invite Attendees</span>
                                {formData.attendees.length > 0 && (
                                    <span className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-[10px]">{formData.attendees.length} Selected</span>
                                )}
                            </label>
                            
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="size-4 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search team members..."
                                    value={attendeeSearch}
                                    onChange={(e) => {
                                        setAttendeeSearch(e.target.value);
                                        setShowAttendeeDropdown(true);
                                    }}
                                    onFocus={() => setShowAttendeeDropdown(true)}
                                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-gray-600"
                                />
                                
                                <AnimatePresence>
                                    {showAttendeeDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="absolute top-full mt-2 w-full max-h-48 overflow-y-auto bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl z-50 p-1 custom-scrollbar"
                                        >
                                            {filteredMembers.length === 0 ? (
                                                <div className="p-3 text-center text-xs text-gray-500">No members found</div>
                                            ) : (
                                                filteredMembers.map((member) => {
                                                    const isSelected = formData.attendees.includes(member._id);
                                                    return (
                                                        <button
                                                            key={member._id}
                                                            type="button"
                                                            onClick={() => toggleAttendee(member._id)}
                                                            className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${isSelected ? 'bg-indigo-500/10' : 'hover:bg-[#27272a]'}`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <img src={member.profilePic || "/avatar.png"} alt="" className="size-6 rounded-full object-cover" />
                                                                <div className="text-left">
                                                                    <div className={`text-sm font-medium ${isSelected ? 'text-indigo-200' : 'text-gray-300'}`}>{member.fullName}</div>
                                                                    <div className="text-[10px] text-gray-500 capitalize">{member.role}</div>
                                                                </div>
                                                            </div>
                                                            {isSelected && <Check className="size-4 text-indigo-400" />}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Selected Attendees Chips */}
                            {formData.attendees.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {formData.attendees.map(id => {
                                        const member = orgMembers.find(m => m._id === id);
                                        if (!member) return null;
                                        return (
                                            <div key={id} className="flex items-center gap-1.5 bg-[#27272a] border border-[#3f3f46] px-2 py-1 rounded-md">
                                                <img src={member.profilePic || "/avatar.png"} alt="" className="size-4 rounded-full object-cover" />
                                                <span className="text-[11px] text-gray-300 font-medium">{member.fullName.split(' ')[0]}</span>
                                                <button type="button" onClick={() => toggleAttendee(id)} className="text-gray-500 hover:text-white shrink-0 ml-0.5">
                                                    <X className="size-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
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
