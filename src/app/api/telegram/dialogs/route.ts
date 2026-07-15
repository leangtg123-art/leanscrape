import { NextRequest, NextResponse } from "next/server";
import { getTelegramClient } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiId, apiHash, session } = body;

    if (!apiId || !apiHash || !session) {
      return NextResponse.json(
        { success: false, error: "API ID, API Hash, dan Session Key wajib diisi" },
        { status: 400 }
      );
    }

    const client = await getTelegramClient(session, parseInt(apiId), apiHash);

    // Get latest 100 dialogs
    const dialogs = await client.getDialogs({ limit: 80 });

    const groupDialogs = dialogs
      .filter((dialog) => dialog.isGroup || dialog.isChannel)
      .map((dialog) => {
        const entity = dialog.entity as any;
        return {
          id: dialog.id.toString(),
          title: dialog.title,
          username: entity?.username || "",
          platform: "telegram",
          type: dialog.isChannel && !entity?.megagroup ? "channel" : "group",
          unreadCount: dialog.unreadCount,
          membersCount: entity?.participantsCount || null,
        };
      });

    await client.disconnect();

    return NextResponse.json({
      success: true,
      data: groupDialogs,
    });
  } catch (error: any) {
    console.error("Telegram Get Dialogs Error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
