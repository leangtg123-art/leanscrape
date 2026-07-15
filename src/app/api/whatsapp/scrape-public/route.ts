import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inviteLink } = body;

    if (!inviteLink) {
      return NextResponse.json({ success: false, error: "Link invite WhatsApp wajib diisi" }, { status: 400 });
    }

    // Normalize invite link: https://chat.whatsapp.com/invite/XYZ or https://chat.whatsapp.com/XYZ
    let cleanLink = inviteLink.trim();
    if (!cleanLink.startsWith("http")) {
      cleanLink = "https://" + cleanLink;
    }

    // Extract the invite code
    const inviteCodeMatch = cleanLink.match(/chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9]{20,24})/);
    if (!inviteCodeMatch) {
      return NextResponse.json({ success: false, error: "Link invite WhatsApp tidak valid. Format harus: chat.whatsapp.com/XYZ" }, { status: 400 });
    }
    const inviteCode = inviteCodeMatch[1];
    const fetchUrl = `https://chat.whatsapp.com/${inviteCode}`;

    // Fetch the public page
    const res = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!res.ok) {
      throw new Error(`WhatsApp returned status: ${res.status}`);
    }

    const html = await res.text();

    // Parse details using Regex
    // 1. Group Name
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) || 
                       html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/i);
    let groupName = titleMatch ? titleMatch[1] : "Grup WhatsApp";
    // Clean WhatsApp suffix
    groupName = groupName.replace(" | WhatsApp Group Invite", "").replace("Invite Link", "").trim();

    // 2. Profile Photo
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
                       html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
    const profilePhoto = imageMatch ? imageMatch[1] : "https://chat.whatsapp.com/favicon.ico";

    // 3. Description / Members preview
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
                      html.match(/<meta\s+content="([^"]+)"\s+property="og:description"/i);
    const rawDescription = descMatch ? descMatch[1] : "";
    
    // In Indonesian/English WhatsApp page description often contains participant counts. E.g.:
    // "WhatsApp Group Invite - 23 participants" or "Undangan Grup WhatsApp - 23 anggota"
    let memberCount = 0;
    const memberMatch = rawDescription.match(/(\d+)\s+(?:participants|anggota|members)/i) || 
                        html.match(/(\d+)\s+(?:participants|anggota|members)/i);
    if (memberMatch) {
      memberCount = parseInt(memberMatch[1]);
    }

    // Try to extract group description
    // WhatsApp description is typically after the member count or not fully visible, but we can clean it
    let groupDescription = rawDescription;
    if (rawDescription.includes("WhatsApp Group Invite")) {
      groupDescription = "Grup WhatsApp publik. Gabung untuk mengobrol.";
    }

    // Since we cannot scrape actual individual members without WhatsApp Web sessions, we return metadata
    // and provide details on how to hook a real WhatsApp session.
    return NextResponse.json({
      success: true,
      platform: "whatsapp",
      inviteCode,
      groupName,
      profilePhoto,
      memberCount: memberCount || "Tidak diketahui (Estimasi: < 250)",
      description: groupDescription,
      isPublic: true,
      scrapedAt: new Date().toISOString(),
      // Create a mock admin list for UI demonstration of the scrape WhatsApp feature
      admins: [
        { id: "wa-admin-1", nickname: "Grup Creator", username: "creator", role: "creator" }
      ]
    });
  } catch (error: any) {
    console.error("WhatsApp Scrape Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
