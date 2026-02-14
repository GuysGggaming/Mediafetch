"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import UrlInput from "@/components/UrlInput";
import DownloadCard from "@/components/DownloadCard";

interface DownloadData {
  title?: string;
  thumbnail?: string;
  videoUrl?: string;
  platform?: string;
  type?: "video" | "image" | "carousel";
  error?: string;
}

export default function Home() {
  const [data, setData] = useState<DownloadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (url: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch media");
      }

      // Transform API response to our internal format if needed
      // This is a basic mapping based on the mock/RapidAPI structure
      setData({
        title: result.title,
        thumbnail: result.thumbnail,
        videoUrl: result.links?.[0]?.link || result.videoUrl, // Adjust based on actual API response
        platform: result.platform,
        type: "video", // Default to video for now
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      <section className="relative z-20 -mt-20 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <UrlInput onSubmit={handleDownload} isLoading={loading} />

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {data && <DownloadCard data={data} />}
          </div>
        </div>
      </section>
    </div>
  );
}
