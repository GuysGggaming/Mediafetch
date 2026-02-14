"use client";

import { useState } from "react";
import { Link2, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UrlInputProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
}

export default function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
    const [url, setUrl] = useState("");
    const [platform, setPlatform] = useState<"tiktok" | "instagram" | "facebook" | null>(null);

    const detectPlatform = (value: string) => {
        if (value.includes("tiktok.com")) return "tiktok";
        if (value.includes("instagram.com")) return "instagram";
        if (value.includes("facebook.com") || value.includes("fb.watch")) return "facebook";
        return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUrl(value);
        setPlatform(detectPlatform(value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url && !isLoading) {
            onSubmit(url);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center bg-[#0f172a] border border-white/10 rounded-xl p-2 focus-within:border-violet-500/50 transition-colors">
                    <div className="pl-3 pr-2 text-gray-400">
                        <Link2 className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={url}
                        onChange={handleChange}
                        placeholder="Paste TikTok, Instagram, or Facebook link..."
                        className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none py-3 text-base sm:text-lg"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!url || isLoading}
                        className={cn(
                            "px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center gap-2",
                            url
                                ? "bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-violet-500/25"
                                : "bg-white/5 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="hidden sm:inline">Processing</span>
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:inline">Download</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>

                {/* Platform Indicator */}
                {platform && (
                    <div className="absolute -top-8 right-2 text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-violet-300 border border-white/5 animate-fade-in uppercase tracking-wider">
                        Detected: {platform}
                    </div>
                )}
            </form>
        </div>
    );
}
