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

export async function scrapeUrl(url: string, formats: any[] = ["markdown"], actions?: any[], customApiKey?: string) {
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
    body: JSON.stringify({ query, limit }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Firecrawl API error (status ${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function crawlUrl(url: string, options: any = {}, customApiKey?: string) {
  const res = await fetch(`${BASE_URL}/v1/crawl`, {
    method: "POST",
    headers: getHeaders(customApiKey),
    body: JSON.stringify({ url, ...options }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Firecrawl API error (status ${res.status}): ${errorText}`);
  }

  return res.json();
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
    body: JSON.stringify({ url, ...options }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Firecrawl API error (status ${res.status}): ${errorText}`);
  }

  return res.json();
}

