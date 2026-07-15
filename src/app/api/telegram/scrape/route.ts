import { NextRequest, NextResponse } from "next/server";
import { getTelegramClient, normalizeGroupId } from "@/lib/telegram";
import { Api } from "telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiId, apiHash, session, groupIdentifier, memberType = "all", limit = 100, offset = 0 } = body;

    if (!apiId || !apiHash || !session || !groupIdentifier) {
      return NextResponse.json(
        { success: false, error: "API ID, API Hash, Session, dan ID/Link grup wajib diisi" },
        { status: 400 }
      );
    }

    const client = await getTelegramClient(session, parseInt(apiId), apiHash);
    const normalizedId = normalizeGroupId(groupIdentifier);

    // Get Group Entity
    let entity: any;
    try {
      entity = await client.getEntity(normalizedId);
    } catch (err: any) {
      // Try resolving as numeric ID directly (GramJS requires integer/BigInt for raw IDs)
      try {
        const numericId = parseInt(normalizedId);
        if (!isNaN(numericId)) {
          entity = await client.getEntity(numericId);
        } else {
          throw err;
        }
      } catch (err2) {
        // If error is about username/invite hash, try to import invite link if possible
        if (normalizedId.startsWith("+") || normalizedId.startsWith("joinchat/")) {
          const hash = normalizedId.replace("+", "").replace("joinchat/", "");
          try {
            const res = await client.invoke(
              new Api.messages.ImportChatInvite({ hash })
            );
            entity = (res as any).chats?.[0];
          } catch (inviteErr: any) {
            throw new Error("Gagal memproses link invite: " + (inviteErr.message || String(inviteErr)));
          }
        } else {
          throw new Error("Grup tidak ditemukan: " + (err.message || String(err)));
        }
      }
    }

    if (!entity) {
      throw new Error("Entitas grup tidak ditemukan.");
    }

    // Get full chat info to see member count, title, bio/description
    let totalMembersCount = 0;
    let groupTitle = entity.title || "Grup Telegram";
    let groupDescription = "";

    const isChannel = entity.className === "Channel" || entity.className === "ChannelForbidden";

    if (isChannel) {
      try {
        const fullChannel = await client.invoke(
          new Api.channels.GetFullChannel({
            channel: entity,
          })
        );
        const fullInfo = (fullChannel as any).fullChat;
        totalMembersCount = fullInfo.participantsCount || 0;
        groupDescription = fullInfo.about || "";
      } catch (channelErr) {
        totalMembersCount = entity.participantsCount || 0;
      }
    } else {
      try {
        const fullChat = await client.invoke(
          new Api.messages.GetFullChat({
            chatId: entity.id,
          })
        );
        const fullInfo = (fullChat as any).fullChat;
        totalMembersCount = fullInfo.participantsCount || fullInfo.participants?.participants?.length || 0;
        groupDescription = fullInfo.about || "";
      } catch (chatErr) {
        totalMembersCount = entity.participantsCount || 0;
      }
    }

    // 1. Fetch Admin List
    const adminIds = new Set<string>();
    const adminDetails: any[] = [];
    try {
      const admins = await client.getParticipants(entity, {
        filter: new Api.ChannelParticipantsAdmins(),
        limit: 100,
      });

      for (const admin of admins) {
        adminIds.add(admin.id.toString());
        adminDetails.push({
          id: admin.id.toString(),
          username: admin.username || "",
          nickname: [admin.firstName || "", admin.lastName || ""].filter(Boolean).join(" ") || "Admin",
          isBot: admin.bot,
          isPremium: admin.premium,
        });
      }
    } catch (adminErr) {
      console.warn("Could not fetch admin list explicitly:", adminErr);
    }

    // 2. Fetch Participants
    let participants: any[] = [];
    try {
      let filterOption: any = undefined;
      
      if (memberType === "admin") {
        filterOption = new Api.ChannelParticipantsAdmins();
      }

      participants = await client.getParticipants(entity, {
        filter: filterOption,
        limit: Math.min(parseInt(String(limit)), 500), // Max 500 per call for safety
        offset: parseInt(String(offset)),
      });
    } catch (scrapeErr: any) {
      await client.disconnect();
      return NextResponse.json({
        success: false,
        error: "Gagal mengambil daftar anggota grup. Kemungkinan daftar anggota disembunyikan oleh admin. " + (scrapeErr.message || String(scrapeErr))
      }, { status: 403 });
    }

    // Filter and map members
    const members = participants
      .filter((p) => {
        const isAdmin = adminIds.has(p.id.toString());
        if (memberType === "admin" && !isAdmin) return false;
        if (memberType === "user" && isAdmin) return false;
        return true;
      })
      .map((p) => {
        const isAdmin = adminIds.has(p.id.toString());
        return {
          id: p.id.toString(),
          username: p.username || "",
          nickname: [p.firstName || "", p.lastName || ""].filter(Boolean).join(" ") || "User",
          isBot: p.bot || false,
          isPremium: p.premium || false,
          role: isAdmin ? "admin" : "member",
          bio: "", // Will be loaded on demand/individually to avoid flood limits
          photoUrl: "", // Will be loaded on demand/individually
        };
      });

    await client.disconnect();

    return NextResponse.json({
      success: true,
      groupInfo: {
        id: entity.id.toString(),
        title: groupTitle,
        username: entity.username || "",
        description: groupDescription,
        totalMembers: totalMembersCount || members.length,
        totalAdmins: adminIds.size || adminDetails.length,
        admins: adminDetails,
      },
      count: members.length,
      data: members,
    });
  } catch (error: any) {
    console.error("Telegram Scrape Error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
