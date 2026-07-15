import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = searchParams.get("limit") || "10";

    if (!query) {
      return NextResponse.json({ success: false, error: "Keyword pencarian wajib diisi" }, { status: 400 });
    }

    const url = `https://www.grupku.net/feeds/posts/default?alt=json&q=${encodeURIComponent(query)}&max-results=${limit}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      throw new Error(`Grupku.net API returned status: ${res.status}`);
    }

    const data = await res.json();
    const entries = data.feed?.entry || [];

    const groups = entries.map((post: any) => {
      const title = post.title?.$t || "Grup Tanpa Nama";
      
      const linkObj = post.link?.find((l: any) => l.rel === "alternate");
      const postUrl = linkObj ? linkObj.href : "";

      const publishedDate = post.published?.$t
        ? new Date(post.published.$t).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric'
          })
        : "-";

      const categories = post.category ? post.category.map((c: any) => c.term) : [];
      const htmlContent = post.content?.$t || "";

      let groupLink = "";
      const waLinkMatch = htmlContent.match(/https?:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9_-]+/i);
      const tgLinkMatch = htmlContent.match(/https?:\/\/t\.me\/[a-zA-Z0-9_-]+/i);

      let platform = "unknown";
      if (waLinkMatch) {
        groupLink = waLinkMatch[0];
        platform = "whatsapp";
      } else if (tgLinkMatch) {
        groupLink = tgLinkMatch[0];
        platform = "telegram";
      }

      let description = htmlContent
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]*>?/gm, '')
        .replace(/&#8221;/g, '"')
        .replace(/&#8220;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .trim();

      if (description.length > 200) {
        description = description.substring(0, 200) + "...";
      }

      return {
        title,
        publishedDate,
        categories,
        postUrl,
        groupLink,
        platform,
        description
      };
    });

    return NextResponse.json({ success: true, count: groups.length, data: groups });
  } catch (error: any) {
    console.error("Grupku Search Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
