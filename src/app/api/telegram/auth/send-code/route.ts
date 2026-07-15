import { NextRequest, NextResponse } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiId, apiHash, phoneNumber } = body;

    if (!apiId || !apiHash || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: "API ID, API Hash, dan Nomor Telepon wajib diisi" },
        { status: 400 }
      );
    }

    const numericApiId = parseInt(apiId);
    if (isNaN(numericApiId)) {
      return NextResponse.json({ success: false, error: "API ID harus berupa angka" }, { status: 400 });
    }

    const session = new StringSession("");
    const client = new TelegramClient(session, numericApiId, apiHash, {
      connectionRetries: 3,
    });

    await client.connect();

    // Send verification code
    const result = await client.sendCode(
      {
        apiId: numericApiId,
        apiHash: apiHash,
      },
      phoneNumber
    );

    const tempSession = client.session.save() as string;

    // We must disconnect
    await client.disconnect();

    return NextResponse.json({
      success: true,
      phoneCodeHash: result.phoneCodeHash,
      tempSession: tempSession,
    });
  } catch (error: any) {
    console.error("Telegram Send Code Error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
