import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const NetworkGridPattern = () => {
    // Generate static grid points
    const rows = 8;
    const cols = 8;

    return (
        <div className="w-full h-full bg-[#050505] relative overflow-hidden flex items-center justify-center">
            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />

            <div className="relative w-full max-w-lg aspect-square">
                {/* Grid Dots */}
                <div className="grid grid-cols-8 gap-8 p-8">
                    {[...Array(rows * cols)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0.1, scale: 0.5 }}
                            animate={{
                                opacity: [0.1, 0.4, 0.1],
                                scale: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                                ease: "easeInOut"
                            }}
                            className="w-1 h-1 bg-white/20 rounded-full"
                        />
                    ))}
                </div>

                {/* Connecting Lines (Animates) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <motion.path
                        d="M50 50 Q 200 100 350 50 T 650 50"
                        fill="none"
                        stroke="url(#gradient1)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                    />
                    <motion.path
                        d="M50 250 Q 200 200 350 350 T 650 350"
                        fill="none"
                        stroke="url(#gradient2)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                    />
                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
                            <stop offset="50%" stopColor="#4f46e5" stopOpacity="1" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#9333ea" stopOpacity="0" />
                            <stop offset="50%" stopColor="#9333ea" stopOpacity="1" />
                            <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Floating "Concept" Elements */}
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 p-4 bg-[#111] border border-[#222] rounded-xl shadow-2xl z-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                        </div>
                        <div className="h-2 w-16 bg-[#222] rounded-full" />
                    </div>
                    <div className="h-2 w-24 bg-[#1a1a1a] rounded-full" />
                </motion.div>

                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 7, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/3 right-1/4 p-4 bg-[#111] border border-[#222] rounded-xl shadow-2xl z-10 glass-effect"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="h-2 w-12 bg-[#222] rounded-full" />
                    </div>
                    <div className="h-2 w-20 bg-[#1a1a1a] rounded-full" />
                </motion.div>
            </div>

            <div className="absolute bottom-12 left-0 w-full text-center">
                <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2">Synchronized Workflows</h2>
                <p className="text-sm text-gray-500">Real-time collaboration for modern teams.</p>
            </div>
        </div>
    );
};

export default NetworkGridPattern;
