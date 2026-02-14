"use client";

import { useState } from "react";
import { Download, ExternalLink, Image as ImageIcon, PlayCircle, Loader2 } from "lucide-react";
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

    const handleDownload = async () => {
        if (!data.videoUrl) return;

        setDownloading(true);
        try {
            // Fetch the file from the URL
            const response = await fetch(data.videoUrl);
            
            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            // Get the file as a blob
            const blob = await response.blob();
            
            // Determine file extension based on content type or default to mp4
            const contentType = response.headers.get("content-type");
            let extension = "mp4";
            if (contentType?.includes("video/mp4")) {
                extension = "mp4";
            } else if (contentType?.includes("video/webm")) {
                extension = "webm";
            } else if (contentType?.includes("image/jpeg")) {
                extension = "jpg";
            } else if (contentType?.includes("image/png")) {
                extension = "png";
            } else if (contentType?.includes("image/gif")) {
                extension = "gif";
            }

            // Create a temporary URL for the blob
            const blobUrl = window.URL.createObjectURL(blob);
            
            // Create a temporary anchor element and trigger download
            const link = document.createElement("a");
            link.href = blobUrl;
            
            // Generate filename
            const platform = data.platform?.toLowerCase() || "media";
            const timestamp = new Date().getTime();
            const filename = `${platform}_${timestamp}.${extension}`;
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download error:", error);
            // Fallback: open in new tab if download fails
            window.open(data.videoUrl, "_blank");
        } finally {
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
                    </div>
                </div>
            </div>
        </div>
    );
}
