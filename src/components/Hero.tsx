"use client";

import { motion } from "framer-motion";

export default function Hero() {
    return (
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
                        <span className="text-white">Download Videos from </span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 animate-gradient-x">
                            Your Favorite Socials
                        </span>
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        The ultimate tool for downloading videos from TikTok, Instagram, and Facebook without watermark. High quality, fast, and free.
                    </p>
                </motion.div>
            </div>

            {/* Background gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
                <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl" />
                <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
            </div>
        </div>
    );
}
