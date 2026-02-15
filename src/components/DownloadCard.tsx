"use client";

import { useState } from "react";
import { Download, Image as ImageIcon, PlayCircle, Loader2 } from "lucide-react";
import Image from "next/image";

interface DownloadCardProps {
    data: {
        title?: string;
        thumbnail?: string;
        videoUrl?: string;
        platform?: string;
        type?: "video" | "image" | "carousel";
    };
}

export default function DownloadCard({ data }: DownloadCardProps) {
    const [downloading, setDownloading] = useState(false);

    const getDownloadProxyUrl = (): string => {
        if (!data.videoUrl) return "";
        const platform = data.platform?.toLowerCase() || "media";
        const timestamp = new Date().getTime();
        const ext = data.type === "image" ? "jpg" : "mp4";
        const filename = `${platform}_${timestamp}.${ext}`;
        return `/api/download-file?url=${encodeURIComponent(data.videoUrl)}&filename=${encodeURIComponent(filename)}`;
    };

    const handleDownload = () => {
        if (!data.videoUrl) return;

        const proxyUrl = getDownloadProxyUrl();
        if (!proxyUrl) return;

        setDownloading(true);

        // Use proxy URL so server sends Content-Disposition: attachment.
        // This makes iOS/Android trigger "Save" instead of opening/playing the video.
        const newTab = window.open(proxyUrl, "_blank");
        if (!newTab) {
            // Popup blocked (common on mobile): navigate in same tab so download still starts.
            window.location.href = proxyUrl;
            setTimeout(() => setDownloading(false), 2000);
        } else {
            setDownloading(false);
        }
    };

    return (
        <div className="mt-8 bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-4 sm:p-6 grid gap-6 sm:grid-cols-[200px_1fr]">
                {/* Thumbnail Preview */}
                <div className="relative aspect-[9/16] sm:aspect-square bg-black/40 rounded-xl overflow-hidden group">
                    {data.thumbnail ? (
                        <Image
                            src={data.thumbnail}
                            alt="Thumbnail"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-600">
                            <ImageIcon className="w-12 h-12" />
                        </div>
                    )}

                    {data.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                            <PlayCircle className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" />
                        </div>
                    )}
                </div>

                {/* Content Details */}
                <div className="flex flex-col justify-between py-2">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-xs font-medium border border-violet-500/20 uppercase">
                                {data.platform || "Social Media"}
                            </span>
                        </div>
                        <h3 className="text-lg font-medium text-white line-clamp-2 mb-4">
                            {data.title || "No Title Available"}
                        </h3>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="w-full sm:w-auto px-6 py-3 bg-white text-[#0f172a] hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Download {data.type === "video" ? "Video" : "Content"}
                                </>
                            )}
                        </button>
                        <p className="text-xs text-center sm:text-left text-gray-500">
                            *By downloading you agree to our terms of service.
                        </p>
                        <p className="text-xs text-center sm:text-left text-gray-400">
                            Di HP: jika belum terunduh, ketuk tombol Download lagi atau cek folder Unduhan.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
