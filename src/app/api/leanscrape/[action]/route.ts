import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl, searchWeb, crawlUrl, getCrawlJobStatus, mapUrl } from "@/lib/firecrawl";

function isSafeUrl(urlString: string): boolean {
  try {
    let checkUrl = urlString.trim();
    if (!/^https?:\/\//i.test(checkUrl)) {
      checkUrl = "https://" + checkUrl;
    }
    const url = new URL(checkUrl);
    const host = url.hostname.toLowerCase();
    
    // SSRF validation block
    const privateIps = [
      /^localhost$/,
      /^127\.\d+\.\d+\.\d+$/,
      /^::1$/,
      /^10\.\d+\.\d+\.\d+$/,
      /^192\.168\.\d+\.\d+$/,
      /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
      /^169\.254\.\d+\.\d+$/
    ];

    if (privateIps.some(regex => regex.test(host)) || host.endsWith(".local") || host.endsWith(".internal")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function prepareUrl(urlString: string): string {
  let cleanUrl = urlString.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = "https://" + cleanUrl;
  }
  return cleanUrl;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const action = params.action;
    const body = await req.json();
    const customApiKey = req.headers.get("x-firecrawl-api-key") || undefined;

    let data;
    let creditsDeducted = 1;

    switch (action) {
      case "scrape": {
        const { url, formats, actions } = body;
        if (!url) {
          return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }
        const safeUrl = prepareUrl(url);
        if (!isSafeUrl(safeUrl)) {
          return NextResponse.json({ error: "SSRF Protection: Access to private/internal URLs is restricted." }, { status: 403 });
        }
        data = await scrapeUrl(safeUrl, formats, actions, customApiKey);
        creditsDeducted = 1 + (actions?.length || 0); // Scrape = 1 credit, +1 per action
        break;
      }
      
      case "search": {
        const { query, limit } = body;
        if (!query) {
          return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }
        data = await searchWeb(query, limit, customApiKey);
        creditsDeducted = 5; // Search = 5 credits
        break;
      }

      case "crawl": {
        const { url, limit } = body;
        if (!url) {
          return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }
        const safeUrl = prepareUrl(url);
        if (!isSafeUrl(safeUrl)) {
          return NextResponse.json({ error: "SSRF Protection: Access to private/internal URLs is restricted." }, { status: 403 });
        }
        data = await crawlUrl(safeUrl, { limit }, customApiKey);
        creditsDeducted = 10; // Crawl start = 10 credits
        break;
      }

      case "map": {
        const { url } = body;
        if (!url) {
          return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }
        const safeUrl = prepareUrl(url);
        if (!isSafeUrl(safeUrl)) {
          return NextResponse.json({ error: "SSRF Protection: Access to private/internal URLs is restricted." }, { status: 403 });
        }
        data = await mapUrl(safeUrl, {}, customApiKey);
        creditsDeducted = 2; // Map = 2 credits
        break;
      }

      case "interact": {
        const { url, actions } = body;
        if (!url || !actions || actions.length === 0) {
          return NextResponse.json({ error: "URL and actions are required" }, { status: 400 });
        }
        const safeUrl = prepareUrl(url);
        if (!isSafeUrl(safeUrl)) {
          return NextResponse.json({ error: "SSRF Protection: Access to private/internal URLs is restricted." }, { status: 403 });
        }
        data = await scrapeUrl(safeUrl, ["markdown", "screenshot"], actions, customApiKey);
        creditsDeducted = 2 + actions.length; // Interact = 2 credits base + 1 per action
        break;
      }

      default:
        return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      creditsDeducted,
      data,
    });
  } catch (error: any) {
    console.error(`API Route Error [${params.action}]:`, error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred on the proxy server" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const action = params.action;
    const urlObj = new URL(req.url);
    const customApiKey = req.headers.get("x-firecrawl-api-key") || undefined;

    if (action === "crawl-status") {
      const jobId = urlObj.searchParams.get("jobId");
      if (!jobId) {
        return NextResponse.json({ error: "jobId is required" }, { status: 400 });
      }
      const data = await getCrawlJobStatus(jobId, customApiKey);
      return NextResponse.json({
        success: true,
        data,
      });
    }

    return NextResponse.json({ error: `Method GET not allowed for action: ${action}` }, { status: 405 });
  } catch (error: any) {
    console.error(`API Route Error [${params.action}]:`, error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

