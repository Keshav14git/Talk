import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldAlert, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DTPinReminder = () => {
    const { authUser } = useAuthStore();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    const deviceId = localStorage.getItem("orchestr_deviceId");
    const hasCurrentDevicePin = authUser?.devices?.some(d => d.deviceId === deviceId);

    useEffect(() => {
        // If they have a PIN, or aren't logged in, do nothing
        if (hasCurrentDevicePin || !authUser) {
            setIsVisible(false);
            return;
        }

        // Show the first reminder after 30 seconds
        const initialTimer = setTimeout(() => {
            setIsVisible(true);
        }, 30000);

        // Then remind every 10 minutes (600000ms)
        const intervalTimer = setInterval(() => {
            setIsVisible(true);
        }, 600000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(intervalTimer);
        };
    }, [hasCurrentDevicePin, authUser]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed bottom-6 right-6 z-[9999] w-80 bg-[#111] border border-red-500/30 rounded-2xl shadow-[0_10px_40px_rgba(239,68,68,0.15)] overflow-hidden"
            >
                {/* Red accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                
                <div className="p-4 relative">
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        <X className="size-4" />
                    </button>

                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-red-500/10 rounded-full text-red-500">
                            <ShieldAlert className="size-5" />
                        </div>
                        <div className="pr-4">
                            <h3 className="text-sm font-bold text-white mb-1">Device Not Secured</h3>
                            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                                You haven't set up a Fast PIN for this device. Anyone with your email can access your workspace.
                            </p>
                            <button
                                onClick={() => {
                                    setIsVisible(false);
                                    navigate('/settings?tab=security');
                                }}
                                className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                            >
                                Set up DTPin now <ArrowRight className="size-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DTPinReminder;
