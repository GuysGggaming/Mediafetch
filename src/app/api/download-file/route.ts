import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy download: fetch the media URL on the server and stream it back
 * with Content-Disposition: attachment so mobile browsers (iOS/Android)
 * trigger download instead of opening/playing the file.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "mediafetch_video.mp4";

  if (!url || !url.startsWith("https://")) {
    return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch media" },
        { status: res.status }
      );
    }

    const contentType =
      res.headers.get("content-type") || "video/mp4";
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
