import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const apiKey = process.env.RAPID_API_KEY;
  const apiHost = process.env.RAPID_API_HOST || "social-media-video-downloader.p.rapidapi.com";

  if (!apiKey) {
    console.error("API Key is missing in .env.local");
    return NextResponse.json(
      { error: "Server configuration error: API Key missing." },
      { status: 500 }
    );
  }

  // Helper function to extract shortcode from Instagram URL
  const extractInstagramShortcode = (url: string): string | null => {
    // Instagram URL patterns:
    // https://www.instagram.com/p/SHORTCODE/
    // https://www.instagram.com/reel/SHORTCODE/
    // https://www.instagram.com/tv/SHORTCODE/
    const patterns = [
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  try {
    // Based on RapidAPI playground screenshots, the actual endpoint paths are:
    // TikTok: /tiktok/v3/post/details
    // Instagram: /instagram/v3/media/post/details
    // Facebook: /facebook/v3/post/details
    let endpoints: string[] = [];
    let queryParam: string = `url=${encodeURIComponent(url)}`; // Default parameter
    
    if (url.includes("tiktok.com")) {
      endpoints = [`/tiktok/v3/post/details`];
      queryParam = `url=${encodeURIComponent(url)}`;
    } else if (url.includes("instagram.com")) {
      // Instagram uses shortcode parameter, not URL
      const shortcode = extractInstagramShortcode(url);
      if (shortcode) {
        endpoints = [`/instagram/v3/media/post/details`];
        queryParam = `shortcode=${shortcode}`;
        console.log("Extracted Instagram shortcode:", shortcode);
      } else {
        return NextResponse.json(
          { error: "Invalid Instagram URL. Please provide a valid Instagram post/reel URL." },
          { status: 400 }
        );
      }
    } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
      endpoints = [`/facebook/v3/post/details`];
      queryParam = `url=${encodeURIComponent(url)}`;
    } else {
      // Try common patterns if platform not detected
      endpoints = [`/tiktok/v3/post/details`, `/instagram/v3/media/post/details`, `/facebook/v3/post/details`];
      queryParam = `url=${encodeURIComponent(url)}`;
    }

    let lastError: any = null;
    let response: Response | null = null;
    let data: any = null;

    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      const apiUrl = `https://${apiHost}${endpoint}`;
      console.log("Trying RapidAPI endpoint:", apiUrl);
      console.log("URL parameter:", url);

      // Try GET first, then POST if GET fails
      const methods = ["GET", "POST"];
      
      for (const method of methods) {
        try {
          const fetchOptions: RequestInit = {
            method: method,
            headers: {
              "x-rapidapi-key": apiKey,
              "x-rapidapi-host": apiHost,
              "Content-Type": "application/json",
            },
          };

          // For GET, use the appropriate query param; for POST, add to body
          if (method === "GET") {
            response = await fetch(`${apiUrl}?${queryParam}`, fetchOptions);
          } else {
            // For POST, determine body based on platform
            if (url.includes("instagram.com")) {
              const shortcode = extractInstagramShortcode(url);
              if (shortcode) {
                fetchOptions.body = JSON.stringify({ shortcode: shortcode });
              } else {
                fetchOptions.body = JSON.stringify({ url: url });
              }
            } else {
              fetchOptions.body = JSON.stringify({ url: url });
            }
            response = await fetch(apiUrl, fetchOptions);
          }

          const textResponse = await response.text();
          console.log(`Endpoint ${endpoint} (${method}) - Status:`, response.status);
          console.log(`Endpoint ${endpoint} (${method}) - Raw Response:`, textResponse.substring(0, 500));

          try {
            data = JSON.parse(textResponse);
            
            // If successful (2xx status), break both loops
            if (response.ok) {
              console.log(`Success with endpoint: ${endpoint} using ${method}`);
              break;
            }
            
            // Skip endpoints that don't exist
            const errorMsg = (data?.message || data?.error || "").toLowerCase();
            if (errorMsg.includes("does not exist") || errorMsg.includes("not found")) {
              console.log(`Endpoint ${endpoint} (${method}) does not exist, trying next...`);
              if (method === "POST") {
                break; // Try next endpoint if POST also fails
              }
              continue; // Try POST method for same endpoint
            }
            
            // If it's a clear error (not just wrong endpoint), save it
            if (response.status !== 404 && response.status !== 400) {
              lastError = data;
            }
            
            // If GET failed but not "does not exist", try POST
            if (method === "GET" && response.status === 404) {
              continue; // Try POST
            } else if (method === "POST") {
              break; // Move to next endpoint
            }
          } catch (parseError) {
            console.error(`Failed to parse JSON from ${endpoint} (${method}):`, parseError);
            if (method === "POST") {
              break; // Try next endpoint
            }
            continue; // Try POST
          }
        } catch (fetchError) {
          console.error(`Error fetching from ${endpoint} (${method}):`, fetchError);
          if (method === "POST") {
            break; // Try next endpoint
          }
          continue; // Try POST
        }
        
        // If we got a successful response, break out of method loop
        if (response && response.ok && data) {
          break;
        }
      }
      
      // If we got a successful response, break out of endpoint loop
      if (response && response.ok && data) {
        break;
      }
    }

    // If no successful response, return error
    if (!response || !response.ok || !data) {
      const errorMessage = lastError?.message || lastError?.error || lastError?.errorMessage || 
                          data?.message || data?.error || data?.errorMessage || 
                          `API returned status ${response?.status || 'unknown'}`;
      console.error("All endpoints failed. Last error:", errorMessage);
      console.error("Please check your RapidAPI dashboard to verify:");
      console.error("1. The API host is correct: " + apiHost);
      console.error("2. The available endpoints for this API");
      console.error("3. Your API key has access to this API");
      return NextResponse.json(
        { 
          error: errorMessage + ". Please check your RapidAPI dashboard to verify the correct endpoints and API access.",
          details: "All attempted endpoints returned 'does not exist'. Please verify the API documentation in your RapidAPI dashboard."
        },
        { status: response?.status || 500 }
      );
    }

    console.log("RapidAPI Parsed Response:", JSON.stringify(data, null, 2));

    // Check for API errors first
    if (data.error) {
      return NextResponse.json(
        { error: data.error },
        { status: 400 }
      );
    }

    // Transform response based on the actual API structure:
    // { error: null, contents: [{ videos: [{ label, repId, url }] }] }
    const transformedData: any = {
      ...data,
    };

    // Extract video URL from contents array (based on RapidAPI response structure)
    if (data.contents && Array.isArray(data.contents) && data.contents.length > 0) {
      const firstContent = data.contents[0];
      
      // Get the highest quality video (usually the last one or first one)
      if (firstContent.videos && Array.isArray(firstContent.videos) && firstContent.videos.length > 0) {
        // Try to get the highest quality video (last in array) or fallback to first
        const video = firstContent.videos[firstContent.videos.length - 1] || firstContent.videos[0];
        transformedData.videoUrl = video.url;
        transformedData.quality = video.label || video.repId;
      }
      
      // Extract thumbnail if available
      if (firstContent.thumbnail) {
        transformedData.thumbnail = firstContent.thumbnail;
      } else if (firstContent.image) {
        transformedData.thumbnail = firstContent.image;
      } else if (firstContent.cover) {
        transformedData.thumbnail = firstContent.cover;
      }
      
      // Extract title if available
      if (firstContent.title) {
        transformedData.title = firstContent.title;
      } else if (firstContent.description) {
        transformedData.title = firstContent.description;
      }
    }
    
    // Fallback: try other common response structures
    if (!transformedData.videoUrl) {
      if (data.links && Array.isArray(data.links) && data.links.length > 0) {
        transformedData.videoUrl = data.links[0].link || data.links[0].url || data.links[0].download;
      } else if (data.video) {
        transformedData.videoUrl = data.video.url || data.video.link || data.video.download;
      } else if (data.download) {
        transformedData.videoUrl = data.download.url || data.download.link;
      } else if (data.url) {
        transformedData.videoUrl = data.url;
      }
    }

    // Ensure thumbnail is set
    if (!transformedData.thumbnail && data.thumbnail) {
      transformedData.thumbnail = data.thumbnail;
    } else if (!transformedData.thumbnail && data.image) {
      transformedData.thumbnail = data.image;
    }

    // Ensure platform is set
    if (!transformedData.platform) {
      if (url.includes("tiktok.com")) transformedData.platform = "TikTok";
      else if (url.includes("instagram.com")) transformedData.platform = "Instagram";
      else if (url.includes("facebook.com") || url.includes("fb.watch")) transformedData.platform = "Facebook";
    }

    // Ensure type is set
    if (!transformedData.type) {
      transformedData.type = "video";
    }

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Download Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Failed to process URL: ${errorMessage}. Please try again or check the link.` },
      { status: 500 }
    );
  }
}
