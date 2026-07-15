import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

const isRealSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== "https://mock.supabase.co" && 
  supabaseAnonKey && 
  supabaseAnonKey !== "mock-anon-key";

// Supabase Client (bisa berupa client asli atau mock client)
export const supabase = isRealSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock database helper untuk LocalStorage/Memory fallback
export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  endpoint: string;
  targetUrl: string;
  status: string;
  credits: number;
  responsePreview?: string;
}

const DEFAULT_CREDITS = 10;

export const mockDb = {
  getCurrentUserEmail: (): string => {
    if (typeof window === "undefined") return "default@leanscrape.dev";
    const userStr = localStorage.getItem("ls-user");
    if (!userStr) return "default@leanscrape.dev";
    try {
      return JSON.parse(userStr).email || "default@leanscrape.dev";
    } catch {
      return "default@leanscrape.dev";
    }
  },

  getCredits: (email?: string): number => {
    if (typeof window === "undefined") return DEFAULT_CREDITS;
    
    const targetEmail = email || mockDb.getCurrentUserEmail();
    const storageKey = `ls-credits-${targetEmail}`;
    
    const now = Date.now();
    const lastResetStr = localStorage.getItem(`ls-credits-reset-${targetEmail}`);
    const lastReset = lastResetStr ? Number(lastResetStr) : 0;
    const fiveHoursMs = 5 * 60 * 60 * 1000;
    
    if (now - lastReset >= fiveHoursMs || lastResetStr === null) {
      localStorage.setItem(storageKey, String(DEFAULT_CREDITS));
      localStorage.setItem(`ls-credits-reset-${targetEmail}`, String(now));
      return DEFAULT_CREDITS;
    }
    
    const creds = localStorage.getItem(storageKey);
    if (creds === null) {
      localStorage.setItem(storageKey, String(DEFAULT_CREDITS));
      return DEFAULT_CREDITS;
    }
    return Number(creds);
  },

  deductCredits: (amount: number, email?: string): number => {
    const targetEmail = email || mockDb.getCurrentUserEmail();
    const current = mockDb.getCredits(targetEmail);
    const next = Math.max(0, current - amount);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ls-credits-${targetEmail}`, String(next));
    }
    return next;
  },

  addCredits: (amount: number, email?: string): number => {
    const targetEmail = email || mockDb.getCurrentUserEmail();
    const current = mockDb.getCredits(targetEmail);
    const next = current + amount;
    if (typeof window !== "undefined") {
      localStorage.setItem(`ls-credits-${targetEmail}`, String(next));
    }
    return next;
  },

  setCredits: (amount: number, email?: string): number => {
    const targetEmail = email || mockDb.getCurrentUserEmail();
    if (typeof window !== "undefined") {
      localStorage.setItem(`ls-credits-${targetEmail}`, String(amount));
    }
    return amount;
  },

  getApiKeys: (): ApiKeyItem[] => {
    if (typeof window === "undefined") return [];
    const keys = localStorage.getItem("ls-apikeys");
    if (keys === null) {
      const defaultKeys = [
        {
          id: "key-1",
          name: "Telegram Scraper Bot",
          key: "ls_live_a1b2c3d4e5f6g7h8i9j0",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "key-2",
          name: "Deep Research Agent",
          key: "ls_live_z9y8x7w6v5u4t3s2r1q0",
          createdAt: new Date().toISOString(),
        }
      ];
      localStorage.setItem("ls-apikeys", JSON.stringify(defaultKeys));
      return defaultKeys;
    }
    return JSON.parse(keys);
  },

  createApiKey: (name: string): ApiKeyItem => {
    const keys = mockDb.getApiKeys();
    const newKey: ApiKeyItem = {
      id: "key-" + Math.random().toString(36).substring(2, 9),
      name,
      key: `ls_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`,
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("ls-apikeys", JSON.stringify([...keys, newKey]));
    }
    return newKey;
  },

  deleteApiKey: (id: string): void => {
    const keys = mockDb.getApiKeys();
    const filtered = keys.filter(k => k.id !== id);
    if (typeof window === "undefined") return;
    localStorage.setItem("ls-apikeys", JSON.stringify(filtered));
  },

  getHistory: (): HistoryItem[] => {
    if (typeof window === "undefined") return [];
    const history = localStorage.getItem("ls-history");
    if (history === null) {
      const defaultHistory = [
        {
          id: "hist-1",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          endpoint: "SCRAPE",
          targetUrl: "https://wikipedia.org/wiki/Web_scraping",
          status: "200 OK",
          credits: 1,
        },
        {
          id: "hist-2",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          endpoint: "SEARCH",
          targetUrl: "query: 'nextjs 14 performance optimization'",
          status: "200 OK",
          credits: 5,
        },
        {
          id: "hist-3",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          endpoint: "MAP",
          targetUrl: "https://github.com",
          status: "200 OK",
          credits: 2,
        }
      ];
      localStorage.setItem("ls-history", JSON.stringify(defaultHistory));
      return defaultHistory;
    }
    return JSON.parse(history);
  },

  addHistory: (endpoint: string, targetUrl: string, status: string, credits: number, responsePreview?: string): HistoryItem => {
    const history = mockDb.getHistory();
    const newItem: HistoryItem = {
      id: "hist-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      endpoint,
      targetUrl,
      status,
      credits,
      responsePreview,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("ls-history", JSON.stringify([newItem, ...history]));
    }
    return newItem;
  }
};
