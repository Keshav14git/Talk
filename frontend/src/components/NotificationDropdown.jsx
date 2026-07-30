import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "../store/useNotificationStore";
import { Bell, Check, Trash2, Calendar, FileText, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useOrgStore } from "../store/useOrgStore";
import { AnimatePresence, motion } from "framer-motion";

const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
    const { currentOrg } = useOrgStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'meeting': return <Calendar className="size-4 text-blue-400" />;
            case 'assignment': return <CheckCircle2 className="size-4 text-emerald-400" />;
            case 'task_status': return <FileText className="size-4 text-indigo-400" />;
            case 'approval': return <AlertCircle className="size-4 text-amber-400" />;
            case 'mention':
            case 'reply':
            case 'message': return <MessageSquare className="size-4 text-purple-400" />;
            default: return <Bell className="size-4 text-gray-400" />;
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) markAsRead(notification._id);
        setIsOpen(false);
        
        if (!currentOrg) return;

        // Routing logic based on type
        if (notification.referenceType === 'Meeting' || notification.type === 'meeting') {
            navigate(`/workspace/${currentOrg._id}/chat`); 
            // Or calendar page if you have one
        } else if (notification.referenceType === 'Task') {
            navigate(`/workspace/${currentOrg._id}/chat`); 
        } else if (notification.referenceType === 'ApprovalRequest') {
            navigate(`/workspace/${currentOrg._id}/approvals`);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-[#171717] hover:bg-[#2f2f2f] border border-[#2f2f2f] text-gray-400 hover:text-white transition-all flex items-center justify-center shrink-0"
            >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full border border-[#111] flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-red-500/20">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#171717] border border-[#2f2f2f] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-[100] overflow-hidden flex flex-col"
                    >
                        <div className="p-4 border-b border-[#2f2f2f] flex items-center justify-between bg-[#1a1a1a]">
                            <h3 className="font-bold text-gray-100 flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-xs">{unreadCount} new</span>}
                            </h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-xs text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-1 font-medium"
                                >
                                    <Check className="size-3" /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center gap-3">
                                    <div className="size-12 rounded-full bg-[#111] border border-[#2f2f2f] flex items-center justify-center">
                                        <Bell className="size-5 text-gray-600" />
                                    </div>
                                    <p className="text-sm text-gray-500">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#2f2f2f]">
                                    {notifications.map((n) => (
                                        <div 
                                            key={n._id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`p-4 hover:bg-[#212121] cursor-pointer transition-colors flex gap-3 ${!n.isRead ? 'bg-indigo-500/5' : ''}`}
                                        >
                                            <div className="relative shrink-0">
                                                <img 
                                                    src={n.sender?.profilePic || "/avatar.png"} 
                                                    alt="avatar" 
                                                    className="size-10 rounded-xl object-cover border border-[#2f2f2f]"
                                                />
                                                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#111] border-2 border-[#171717] flex items-center justify-center">
                                                    {getIcon(n.type)}
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-300 leading-snug">
                                                    <span className="font-bold text-gray-100 mr-1">{n.sender?.fullName || 'Someone'}</span>
                                                    {n.text}
                                                </p>
                                                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>

                                            {!n.isRead && (
                                                <div className="shrink-0 flex items-center justify-center w-2">
                                                    <div className="size-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
