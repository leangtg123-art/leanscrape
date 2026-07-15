const BASE_URL = "https://api.firecrawl.dev";

function getHeaders(customApiKey?: string) {
  const apiKey = customApiKey || process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("Firecrawl API Key is required. Please retrieve your API key from firecrawl.dev and paste it in the Playground Settings.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

export async function scrapeUrl(url: string, formats: any[] = ["markdown"], options: any = {}, actions?: any[], customApiKey?: string) {
  // Ensure we don't send both screenshot and screenshot@fullPage to avoid 400 Bad Request
  let cleanFormats = [...formats];
  if (cleanFormats.includes("screenshot@fullPage")) {
    cleanFormats = cleanFormats.filter((f) => f !== "screenshot");
  }

  const res = await fetch(`${BASE_URL}/v1/scrape`, {
    method: "POST",
    headers: getHeaders(customApiKey),
    body: JSON.stringify({
      url,
      formats: cleanFormats,
      onlyMainContent: options.onlyMainContent ?? true,
      ...(options.waitFor ? { waitFor: options.waitFor } : {}),
      ...(options.mobile ? { mobile: options.mobile } : {}),
      ...(options.includeTags ? { includeTags: options.includeTags } : {}),
      ...(options.excludeTags ? { excludeTags: options.excludeTags } : {}),
      ...(actions && actions.length > 0 ? { actions } : {}),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Firecrawl API error (status ${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function searchWeb(query: string, limit: number = 5, customApiKey?: string) {
  const res = await fetch(`${BASE_URL}/v1/search`, {
    method: "POST",
    headers: getHeaders(customApiKey),
    body: JSON.stringify({ 
      query, 
      limit,
      scrapeOptions: {
        formats: ["markdown"]
      }
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Firecrawl API error (status ${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function startCrawlJob(url: string, options: any = {}, customApiKey?: string) {
  const res = await fetch(`${BASE_URL}/v1/crawl`, {
    method: "POST",
    headers: getHeaders(customApiKey),
    body: JSON.stringify({
      url,
      limit: options.limit || 10,
      scrapeOptions: {
        formats: ["markdown", "html", "links"],
        onlyMainContent: options.onlyMainContent ?? false,
      },
      ...(options.allowExternalLinks ? { allowExternalLinks: true } : {}),
      ...(options.ignoreSitemap ? { ignoreSitemap: true } : {}),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Firecrawl API error (status ${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function pollCrawlJob(jobId: string, customApiKey?: string, maxWaitMs = 120000): Promise<any> {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const res = await fetch(`${BASE_URL}/v1/crawl/${jobId}`, {
      method: "GET",
      headers: getHeaders(customApiKey),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Firecrawl API error (status ${res.status}): ${errorText}`);
    }

    const data = await res.json();
    if (data.status === "completed" || data.status === "failed") {
      return data;
    }

    // Wait 3 seconds before polling again
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error("Crawl job timed out after 2 minutes.");
}

export async function crawlUrl(url: string, options: any = {}, customApiKey?: string) {
  const startRes = await startCrawlJob(url, options, customApiKey);
  if (!startRes.success || !startRes.id) {
    throw new Error("Failed to start crawl job: " + JSON.stringify(startRes));
  }
  return pollCrawlJob(startRes.id, customApiKey);
}

export async function getCrawlJobStatus(jobId: string, customApiKey?: string) {
  const res = await fetch(`${BASE_URL}/v1/crawl/${jobId}`, {
    method: "GET",
    headers: getHeaders(customApiKey),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Firecrawl API error (status ${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function mapUrl(url: string, options: any = {}, customApiKey?: string) {
  const res = await fetch(`${BASE_URL}/v1/map`, {
    method: "POST",
    headers: getHeaders(customApiKey),
    body: JSON.stringify({ 
      url,
      includeSubdomains: options.includeSubdomains ?? false,
      search: options.search || undefined,
      ignoreSitemap: options.ignoreSitemap ?? false,
      limit: options.limit || 5000,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Firecrawl API error (status ${res.status}): ${errorText}`);
  }

  return res.json();
}
