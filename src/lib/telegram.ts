import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

// Helper to initialize Telegram Client
export async function getTelegramClient(
  sessionString: string,
  apiId: number,
  apiHash: string
): Promise<TelegramClient> {
  if (!apiId || !apiHash) {
    throw new Error("API ID dan API Hash wajib diisi di Pengaturan");
  }

  const session = new StringSession(sessionString || "");
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 3,
    useWSS: false,
  });

  await client.connect();
  return client;
}

// Helper to resolve group identifier (resolves Username, ID, or Link)
export function normalizeGroupId(identifier: string): string {
  let clean = identifier.trim();

  // Handle t.me links
  // https://t.me/username -> username
  // t.me/username -> username
  if (clean.includes("t.me/")) {
    const parts = clean.split("t.me/");
    const path = parts[parts.length - 1];
    if (path.startsWith("+")) {
      // Invite link hash, can't easily resolve peer directly without joining
      // But we will pass it to importChatInvite
      return path;
    }
    // Remove query params if any
    clean = path.split("?")[0];
  }

  // Remove @ prefix if username
  if (clean.startsWith("@")) {
    clean = clean.substring(1);
  }

  return clean;
}
