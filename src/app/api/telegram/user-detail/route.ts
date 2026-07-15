import { NextRequest, NextResponse } from "next/server";
import { getTelegramClient } from "@/lib/telegram";
import { Api } from "telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiId, apiHash, session, userId, userIds } = body;

    if (!apiId || !apiHash || !session) {
      return NextResponse.json(
        { success: false, error: "API ID, API Hash, dan Session wajib diisi" },
        { status: 400 }
      );
    }

    if (!userId && (!userIds || !Array.isArray(userIds))) {
      return NextResponse.json(
        { success: false, error: "userId atau userIds (array) wajib diisi" },
        { status: 400 }
      );
    }

    const client = await getTelegramClient(session, parseInt(apiId), apiHash);

    const fetchSingleUser = async (id: string) => {
      try {
        const fullUser = await client.invoke(
          new Api.users.GetFullUser({
            id: id,
          })
        );
        const bio = (fullUser as any).fullUser?.about || "-";
        
        let photoBase64 = "";
        try {
          const buffer = await client.downloadProfilePhoto(id, { isBig: false });
          if (buffer) {
            photoBase64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
          }
        } catch (photoErr) {
          console.warn(`Gagal mengambil foto profil untuk user ${id}:`, photoErr);
        }

        const user = (fullUser as any).users?.[0] || {};
        return {
          id: id,
          bio: bio,
          photoUrl: photoBase64,
          username: user.username || "",
          nickname: [user.firstName || "", user.lastName || ""].filter(Boolean).join(" ") || "User",
          isBot: user.bot || false,
          isPremium: user.premium || false,
          verified: user.verified || false,
          restricted: user.restricted || false,
          phone: user.phone || "Hidden",
        };
      } catch (err: any) {
        console.error(`Gagal mengambil detail user ${id}:`, err);
        return {
          id: id,
          error: err.message || String(err),
          bio: "Tidak dapat memuat bio (Error)",
          photoUrl: "",
        };
      }
    };

    if (userId) {
      const detail = await fetchSingleUser(userId);
      await client.disconnect();
      return NextResponse.json({ success: true, data: detail });
    }

    // Batch fetch (limit to max 10 to avoid rate limits / timeouts)
    const activeIds = userIds.slice(0, 10);
    const details = [];
    for (const id of activeIds) {
      const detail = await fetchSingleUser(id);
      details.push(detail);
      // Small sleep to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    await client.disconnect();
    return NextResponse.json({ success: true, data: details });
  } catch (error: any) {
    console.error("Telegram User Detail Error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
