import { NextRequest, NextResponse } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiId, apiHash, phoneNumber, phoneCodeHash, phoneCode, password, tempSession } = body;

    if (!apiId || !apiHash || !phoneNumber || !phoneCodeHash || !phoneCode || !tempSession) {
      return NextResponse.json(
        { success: false, error: "Parameter login tidak lengkap" },
        { status: 400 }
      );
    }

    const numericApiId = parseInt(apiId);
    const session = new StringSession(tempSession);
    const client = new TelegramClient(session, numericApiId, apiHash, {
      connectionRetries: 3,
    });

    await client.connect();

    try {
      // Attempt to sign in
      await client.signIn({
        phoneNumber,
        phoneCodeHash,
        phoneCode,
      });
    } catch (err: any) {
      // Check if 2FA (Two-Factor Authentication) is required
      if (
        err.message?.includes("SESSION_PASSWORD_NEEDED") ||
        err.message?.includes("PASSWORD_HASH_INVALID") ||
        err.className === "SessionPasswordNeededError"
      ) {
        if (!password) {
          // Tell client that 2FA password is required
          await client.disconnect();
          return NextResponse.json({
            success: true,
            requiresPassword: true,
            tempSession: tempSession,
          });
        } else {
          // Retry sign in with 2FA password
          await client.signIn({
            password: password,
          });
        }
      } else {
        throw err;
      }
    }

    const finalSession = client.session.save() as string;
    
    // Get user details to confirm login success
    const me = await client.getMe();
    
    await client.disconnect();

    return NextResponse.json({
      success: true,
      session: finalSession,
      user: {
        id: me.id.toString(),
        firstName: me.firstName || "",
        lastName: me.lastName || "",
        username: me.username || "",
        phone: me.phone || "",
      },
    });
  } catch (error: any) {
    console.error("Telegram Login Error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
