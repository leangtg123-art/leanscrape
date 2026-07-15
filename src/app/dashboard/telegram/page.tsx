"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Send, Users, Shield, User, FileJson, 
  Download, Eye, Settings, ShieldCheck, 
  HelpCircle, LogOut, CheckCircle2, AlertTriangle, Play 
} from "lucide-react";

interface TelegramUser {
  id: string;
  username: string;
  nickname: string;
  isBot: boolean;
  isPremium: boolean;
  role: string;
  bio?: string;
  photoUrl?: string;
  phone?: string;
  loadingDetail?: boolean;
}

interface GroupInfo {
  id: string;
  title: string;
  username: string;
  description: string;
  totalMembers: number;
  totalAdmins: number;
  admins: any[];
}

function TelegramScraperContent() {
  const searchParams = useSearchParams();
  
  // Auth Config States
  const [apiId, setApiId] = useState("");
  const [apiHash, setApiHash] = useState("");
  const [phone, setPhone] = useState("");
  const [sessionKey, setSessionKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Login Steps States
  const [loginStep, setLoginStep] = useState<"config" | "otp" | "2fa">("config");
  const [otpCode, setOtpCode] = useState("");
  const [password2FA, setPassword2FA] = useState("");
  const [phoneCodeHash, setPhoneCodeHash] = useState("");
  const [tempSession, setTempSession] = useState("");
  const [loginError, setLoginError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Scraper Page States
  const [groupIdentifier, setGroupIdentifier] = useState("");
  const [memberType, setMemberType] = useState<"all" | "admin" | "user">("all");
  const [limit, setLimit] = useState(100);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<TelegramUser[]>([]);
  const [scrapeError, setScrapeError] = useState("");

  // Dialogs List (User's Telegram Groups)
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [dialogsLoading, setDialogsLoading] = useState(false);

  // Selected User for Detail View
  const [selectedUser, setSelectedUser] = useState<TelegramUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Batch selection states
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    // Load config from localStorage on mount
    const savedApiId = localStorage.getItem("ls-tg-api-id") || "";
    const savedApiHash = localStorage.getItem("ls-tg-api-hash") || "";
    const savedSession = localStorage.getItem("ls-tg-session") || "";

    if (savedApiId) setApiId(savedApiId);
    if (savedApiHash) setApiHash(savedApiHash);
    if (savedSession) {
      setSessionKey(savedSession);
      setIsAuthenticated(true);
    }

    const linkParam = searchParams.get("link");
    if (linkParam) {
      setGroupIdentifier(linkParam);
    }
  }, [searchParams]);

  // Load dialogs list when authenticated
  useEffect(() => {
    if (isAuthenticated && apiId && apiHash && sessionKey) {
      loadDialogs();
    }
  }, [isAuthenticated]);

  const loadDialogs = async () => {
    setDialogsLoading(true);
    try {
      const res = await fetch("/api/telegram/dialogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiId, apiHash, session: sessionKey }),
      });
      const json = await res.json();
      if (json.success) {
        setDialogs(json.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat daftar grup Telegram:", err);
    } finally {
      setDialogsLoading(false);
    }
  };

  // Auth Handling
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiId || !apiHash || !phone) {
      setLoginError("API ID, API Hash, dan Nomor Telepon wajib diisi.");
      return;
    }

    setAuthLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/telegram/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiId, apiHash, phoneNumber: phone }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mengirim kode verifikasi.");
      }

      setPhoneCodeHash(json.phoneCodeHash);
      setTempSession(json.tempSession);
      setLoginStep("otp");
      
      // Save credentials for easier future login
      localStorage.setItem("ls-tg-api-id", apiId);
      localStorage.setItem("ls-tg-api-hash", apiHash);
    } catch (err: any) {
      setLoginError(err.message || "Gagal memproses request.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setLoginError("Kode OTP wajib diisi.");
      return;
    }

    setAuthLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/telegram/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiId,
          apiHash,
          phoneNumber: phone,
          phoneCodeHash,
          phoneCode: otpCode,
          password: password2FA,
          tempSession,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal masuk.");
      }

      if (json.requiresPassword) {
        setLoginStep("2fa");
        setLoginError("Akun Anda mengaktifkan Verifikasi Dua Langkah (2FA). Harap masukkan kata sandi.");
        return;
      }

      // Login Success
      const finalSession = json.session;
      setSessionKey(finalSession);
      localStorage.setItem("ls-tg-session", finalSession);
      setIsAuthenticated(true);
      setLoginError("");
    } catch (err: any) {
      setLoginError(err.message || "Gagal masuk ke Telegram.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ls-tg-session");
    setSessionKey("");
    setIsAuthenticated(false);
    setLoginStep("config");
    setDialogs([]);
    setGroupInfo(null);
    setMembers([]);
  };

  // Scraping Handling
  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupIdentifier.trim()) return;

    setScrapeLoading(true);
    setScrapeError("");
    setGroupInfo(null);
    setMembers([]);
    setSelectedUser(null);
    setSelectedUserIds([]);

    try {
      const res = await fetch("/api/telegram/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiId,
          apiHash,
          session: sessionKey,
          groupIdentifier,
          memberType,
          limit,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal melakukan scraping.");
      }

      setGroupInfo(json.groupInfo);
      setMembers(json.data || []);
    } catch (err: any) {
      console.error(err);
      setScrapeError(err.message || "Terjadi kesalahan saat memproses data.");
    } finally {
      setScrapeLoading(false);
    }
  };

  const selectGroupFromDialog = (username: string, id: string) => {
    setGroupIdentifier(username || id);
  };

  // Fetch Detail User Bio & Photo One-by-One
  const handleFetchDetail = async (userId: string) => {
    // Update local state to show detail loading
    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, loadingDetail: true } : m))
    );
    if (selectedUser?.id === userId) {
      setDetailLoading(true);
    }

    try {
      const res = await fetch("/api/telegram/user-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiId,
          apiHash,
          session: sessionKey,
          userId,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mengambil data detail.");
      }

      const updatedData = json.data;
      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, ...updatedData, loadingDetail: false } : m))
      );

      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, ...updatedData } : null));
      }
    } catch (err: any) {
      console.error(err);
      alert("Gagal mengambil bio/foto: " + err.message);
      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, loadingDetail: false } : m))
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Fetch Batch Details (Check Some at Once)
  const handleFetchBatchDetails = async () => {
    if (selectedUserIds.length === 0) return;
    setBatchLoading(true);

    // Set loading status for selected members
    setMembers((prev) =>
      prev.map((m) => (selectedUserIds.includes(m.id) ? { ...m, loadingDetail: true } : m))
    );

    try {
      const res = await fetch("/api/telegram/user-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiId,
          apiHash,
          session: sessionKey,
          userIds: selectedUserIds,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mengambil detail batch.");
      }

      const listDetails = json.data || [];
      const detailsMap = new Map(listDetails.map((item: any) => [item.id, item]));

      setMembers((prev) =>
        prev.map((m) => {
          if (detailsMap.has(m.id)) {
            const detailObj = detailsMap.get(m.id);
            return { ...m, ...detailObj, loadingDetail: false };
          }
          return selectedUserIds.includes(m.id) ? { ...m, loadingDetail: false } : m;
        })
      );

      // Reset selection
      setSelectedUserIds([]);
    } catch (err: any) {
      console.error(err);
      alert("Gagal memuat detail batch: " + err.message);
      setMembers((prev) =>
        prev.map((m) => (selectedUserIds.includes(m.id) ? { ...m, loadingDetail: false } : m))
      );
    } finally {
      setBatchLoading(false);
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === members.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(members.map((m) => m.id));
    }
  };

  const handleExport = (format: "json" | "csv") => {
    if (!groupInfo) return;

    let content = "";
    let filename = `telegram_scrape_${groupInfo.id}`;
    let mimeType = "";

    if (format === "json") {
      content = JSON.stringify({ groupInfo, members }, null, 2);
      filename += ".json";
      mimeType = "application/json";
    } else {
      content = "User ID,Username,Nickname,Role,Bio,Phone,Is Bot,Is Premium\n";
      members.forEach((m) => {
        content += `"${m.id}","${m.username}","${m.nickname}","${m.role}","${(m.bio || "").replace(/"/g, '""')}","${m.phone || "Unknown"}","${m.isBot}","${m.isPremium}"\n`;
      });
      filename += ".csv";
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto space-y-8 font-sans py-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Send className="text-primary animate-pulse" size={20} />
            <span>Connect Telegram Client</span>
          </h1>
          <p className="text-xs text-text-muted mt-1 font-mono">// START_MTPROTO_SESSION_HANDSHAKE</p>
        </div>

        <div className="relative p-6 rounded-lg border border-border bg-[#0B0A0E] space-y-6">
          <div className="corner-brackets" />

          {loginError && (
            <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-mono rounded flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {loginStep === "config" && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-text-muted font-mono">// TELEGRAM_API_ID</label>
                  <a href="https://my.telegram.org" target="_blank" rel="noopener noreferrer" className="text-[8px] text-primary underline">Get API ID</a>
                </div>
                <input
                  type="text"
                  value={apiId}
                  onChange={(e) => setApiId(e.target.value)}
                  placeholder="Masukkan API ID Anda (misal: 1234567)"
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted font-mono block">// TELEGRAM_API_HASH</label>
                <input
                  type="text"
                  value={apiHash}
                  onChange={(e) => setApiHash(e.target.value)}
                  placeholder="Masukkan API Hash Anda"
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted font-mono block">// PHONE_NUMBER (INTERNATIONAL FORMAT)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="misal: +6281234567890"
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-primary text-white text-xs font-bold font-mono rounded hover:bg-primary/80 transition-all disabled:opacity-50"
              >
                {authLoading ? "SENDING OTP..." : "REQUEST VERIFICATION CODE"}
              </button>
            </form>
          )}

          {(loginStep === "otp" || loginStep === "2fa") && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <span className="text-[9px] text-text-muted font-mono block">SMS/Telegram OTP sent to {phone}.</span>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted font-mono block">// VERIFICATION_CODE</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Masukkan kode OTP Telegram Anda"
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {loginStep === "2fa" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] text-text-muted font-mono block">// TWO_FACTOR_PASSWORD</label>
                  <input
                    type="password"
                    value={password2FA}
                    onChange={(e) => setPassword2FA(e.target.value)}
                    placeholder="Masukkan Password Verifikasi Dua Langkah Anda"
                    className="w-full bg-bg border border-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoginStep("config")}
                  className="px-4 py-2 border border-border hover:bg-white/5 text-xs text-white font-mono rounded"
                >
                  KEMBALI
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="flex-1 py-2 bg-primary text-white text-xs font-bold font-mono rounded hover:bg-primary/80 transition-all disabled:opacity-50"
                >
                  {authLoading ? "AUTHENTICATING..." : "SUBMIT & CONNECT"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Send className="text-primary" size={20} />
            <span>Telegram Group Scraper</span>
          </h1>
          <p className="text-xs text-text-muted mt-1 font-mono">// SECURE_STEALTH_MTPROTO_SCRAPER_ONLINE</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 border border-green-500/20 bg-green-500/5 text-green-400 font-mono text-[9px] flex items-center gap-1.5 rounded">
            <CheckCircle2 size={12} />
            <span>MTPROTO_CONNECTED</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 border border-border hover:bg-red-500/10 hover:text-red-400 rounded text-text-muted transition-all"
            title="Disconnect Telegram Session"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Dialogs / Groups (Left - 3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative p-4 border border-border bg-[#0B0A0E] rounded-lg">
            <div className="corner-brackets" />
            <h3 className="text-[10px] font-bold font-mono text-white mb-3 uppercase">// MY_TELEGRAM_GROUPS</h3>
            
            {dialogsLoading ? (
              <div className="py-8 text-center text-[10px] text-text-muted font-mono">
                <div className="animate-spin inline-block w-4 h-4 border border-primary border-t-transparent rounded-full mb-1"></div>
                <div>Syncing dialogs...</div>
              </div>
            ) : dialogs.length > 0 ? (
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                {dialogs.map((dg) => (
                  <button
                    key={dg.id}
                    onClick={() => selectGroupFromDialog(dg.username, dg.id)}
                    className="w-full text-left p-2 hover:bg-white/5 rounded border border-transparent hover:border-border transition-all flex flex-col gap-1 text-[10px]"
                  >
                    <span className="font-bold text-white line-clamp-1">{dg.title}</span>
                    <div className="flex items-center justify-between text-[8px] text-text-muted font-mono">
                      <span>@{dg.username || "private_id"}</span>
                      {dg.unreadCount > 0 && (
                        <span className="bg-primary/20 text-primary px-1.5 rounded-full">{dg.unreadCount}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-[10px] text-text-muted italic">
                No groups found.
              </div>
            )}
          </div>
        </div>

        {/* Core Scraper form and parameters (Right - 9 columns) */}
        <div className="lg:col-span-9 space-y-6">
          <form onSubmit={handleScrape} className="relative p-6 border border-border bg-[#0B0A0E] rounded-lg space-y-4">
            <div className="corner-brackets" />
            <span className="text-[10px] text-text-muted font-mono block mb-1">// SCRAPER_SETTINGS</span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[10px] text-text-muted font-mono block">Target Group ID / Link</label>
                <input
                  type="text"
                  value={groupIdentifier}
                  onChange={(e) => setGroupIdentifier(e.target.value)}
                  placeholder="@groupname, -100xxx, or t.me/link"
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted font-mono block">Filter Member Type</label>
                <select
                  value={memberType}
                  onChange={(e: any) => setMemberType(e.target.value)}
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="all">Semua Anggota</option>
                  <option value="admin">Hanya Administrator</option>
                  <option value="user">Hanya Anggota Biasa</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted font-mono block">Limit Scraping (Max 500)</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  min={1}
                  max={500}
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={scrapeLoading}
              className="w-full py-2.5 bg-primary text-white text-xs font-bold font-mono rounded hover:bg-primary/80 transition-all disabled:opacity-50"
            >
              {scrapeLoading ? "FETCHING MEMBERS VIA MTPROTO..." : "RUN SCRAPER ENGINE"}
            </button>
          </form>

          {scrapeError && (
            <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono rounded">
              [ERROR] {scrapeError}
            </div>
          )}

          {scrapeLoading ? (
            <div className="py-24 border border-border bg-[#0B0A0E] rounded-lg text-center font-mono text-xs text-text-muted">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3"></div>
              <div>Menghubungkan klien MTProto & mengambil data partisipan...</div>
            </div>
          ) : groupInfo ? (
            <div className="space-y-6">
              {/* Group Metadata Overview Card */}
              <div className="relative p-6 border border-border bg-[#0B0A0E] rounded-lg">
                <div className="corner-brackets" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-base font-bold text-white">{groupInfo.title}</h2>
                    <span className="text-[8px] font-bold font-mono px-2 py-0.5 rounded border bg-blue-500/10 border-blue-500/30 text-blue-400 uppercase">
                      Telegram MTProto Scraped
                    </span>
                  </div>

                  <p className="text-[10px] text-text-muted leading-relaxed">
                    {groupInfo.description || "Tidak ada deskripsi grup."}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-3 font-mono text-[9px] text-text-muted border-t border-border/20">
                    <div>
                      ID: <span className="text-white font-bold">{groupInfo.id}</span>
                    </div>
                    {groupInfo.username && (
                      <div>
                        USERNAME: <span className="text-primary font-bold">@{groupInfo.username}</span>
                      </div>
                    )}
                    <div>
                      TOTAL_MEMBERS: <span className="text-white font-bold">{groupInfo.totalMembers}</span>
                    </div>
                    <div>
                      TOTAL_ADMINS: <span className="text-accent font-bold">{groupInfo.totalAdmins}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Members Table */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className={`${selectedUser ? "xl:col-span-8" : "xl:col-span-12"} relative border border-border bg-[#0B0A0E] rounded-lg overflow-hidden transition-all duration-300`}>
                  <div className="corner-brackets" />
                  <div className="flex items-center justify-between p-4 border-b border-border/40 bg-bg/50 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-white">// SCRAPED_MEMBERS ({members.length})</span>
                      {selectedUserIds.length > 0 && (
                        <button
                          onClick={handleFetchBatchDetails}
                          disabled={batchLoading}
                          className="px-2 py-1 bg-primary/10 border border-primary/30 text-[8px] font-mono text-primary rounded hover:bg-primary/20"
                        >
                          {batchLoading ? "LOADING BATCH..." : `CHECK SELECTED DETAILS (${selectedUserIds.length})`}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleExport("json")}
                        className="px-2.5 py-1.5 border border-border bg-bg-elevated hover:bg-white/5 text-[9px] font-mono text-white rounded flex items-center gap-1 transition-all"
                      >
                        <FileJson size={10} /> JSON
                      </button>
                      <button
                        onClick={() => handleExport("csv")}
                        className="px-2.5 py-1.5 border border-border bg-bg-elevated hover:bg-white/5 text-[9px] font-mono text-white rounded flex items-center gap-1 transition-all"
                      >
                        <Download size={10} /> CSV
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full font-mono text-[10px] text-left">
                      <thead>
                        <tr className="border-b border-border/20 text-text-muted bg-white/[0.01]">
                          <th className="p-3 w-8">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.length === members.length && members.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded bg-bg border-border text-primary"
                            />
                          </th>
                          <th className="p-3">User ID</th>
                          <th className="p-3">Nickname</th>
                          <th className="p-3">Username</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Badges</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr 
                            key={member.id} 
                            className={`border-b border-border/10 hover:bg-white/[0.02] cursor-pointer ${
                              selectedUser?.id === member.id ? "bg-white/[0.03]" : ""
                            }`}
                            onClick={() => setSelectedUser(member)}
                          >
                            <td className="p-3" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedUserIds.includes(member.id)}
                                onChange={() => toggleSelectUser(member.id)}
                                className="rounded bg-bg border-border text-primary"
                              />
                            </td>
                            <td className="p-3 text-text-muted">{member.id}</td>
                            <td className="p-3 text-white font-sans font-bold">{member.nickname}</td>
                            <td className="p-3 text-primary">
                              {member.username ? `@${member.username}` : <span className="text-gray-600">-</span>}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded border text-[8px] uppercase ${
                                  member.role === "admin"
                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    : "bg-gray-500/10 border-gray-500/20 text-gray-400"
                                }`}
                              >
                                {member.role}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                {member.isBot && (
                                  <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[7px] px-1 rounded font-bold">BOT</span>
                                )}
                                {member.isPremium && (
                                  <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[7px] px-1 rounded font-bold">PREM</span>
                                )}
                                {member.bio && (
                                  <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[7px] px-1 rounded font-bold">BIO_LOADED</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleFetchDetail(member.id)}
                                disabled={member.loadingDetail}
                                className="px-2 py-1 bg-white/5 border border-border hover:border-primary text-[8px] rounded font-bold flex items-center gap-0.5 ml-auto text-white transition-colors"
                              >
                                {member.loadingDetail ? "..." : (member.bio ? "RE-LOAD" : "CHECK_BIO")}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Single Member Detail Card (Floated Right on Large Screens) */}
                {selectedUser && (
                  <div className="xl:col-span-4 relative p-6 border border-border bg-[#0B0A0E] rounded-lg space-y-6 animate-fade-in-right">
                    <div className="corner-brackets" />
                    
                    <div className="flex justify-between items-center border-b border-border/20 pb-3">
                      <h3 className="text-xs font-bold text-white font-mono uppercase">// USER_DEEP_DIVE</h3>
                      <button 
                        onClick={() => setSelectedUser(null)} 
                        className="text-text-muted hover:text-white text-xs font-mono"
                      >
                        [CLOSE]
                      </button>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Avatar Image downloaded live from Telegram */}
                      {selectedUser.photoUrl ? (
                        <img
                          src={selectedUser.photoUrl}
                          alt={selectedUser.nickname}
                          className="w-20 h-20 rounded-full border border-primary/30 object-cover shadow-glow"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono text-xl">
                          {selectedUser.nickname.charAt(0)}
                        </div>
                      )}

                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white font-sans">{selectedUser.nickname}</h4>
                        {selectedUser.username ? (
                          <p className="text-xs text-primary">@{selectedUser.username}</p>
                        ) : (
                          <p className="text-xs text-text-muted italic">no username</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 font-mono text-[10px] bg-white/[0.01] p-4 border border-border/30 rounded">
                      <div className="space-y-1">
                        <span className="text-text-muted block font-bold">// USER_BIO:</span>
                        <p className="text-white font-sans text-xs bg-bg/50 p-2.5 rounded border border-border/20 italic leading-relaxed">
                          {selectedUser.bio || (
                            <span className="text-gray-500 text-[10px]">
                              Belum dicek. Klik CHECK_BIO pada tabel atau tombol di bawah.
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-border/10 pt-3">
                        <div>
                          ID: <span className="text-white font-bold block">{selectedUser.id}</span>
                        </div>
                        <div>
                          PHONE: <span className="text-white font-bold block">{selectedUser.phone || "Hidden"}</span>
                        </div>
                        <div>
                          BOT: <span className={selectedUser.isBot ? "text-purple-400 font-bold block" : "text-text-muted block"}>{selectedUser.isBot ? "YES" : "NO"}</span>
                        </div>
                        <div>
                          PREMIUM: <span className={selectedUser.isPremium ? "text-indigo-400 font-bold block" : "text-text-muted block"}>{selectedUser.isPremium ? "YES" : "NO"}</span>
                        </div>
                      </div>
                    </div>

                    {!selectedUser.bio && (
                      <button
                        onClick={() => handleFetchDetail(selectedUser.id)}
                        disabled={detailLoading}
                        className="w-full py-2 bg-primary text-white text-xs font-bold font-mono rounded hover:bg-primary/80 transition-all flex items-center justify-center gap-1.5"
                      >
                        {detailLoading ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Eye size={12} />
                        )}
                        <span>CHECK BIO & PHOTO</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-28 border border-dashed border-border/40 rounded-lg text-center space-y-4">
              <Send className="mx-auto text-text-muted animate-pulse" size={32} />
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Stealth Telegram Scraper Ready
              </h3>
              <p className="text-[10px] text-text-muted max-w-xs mx-auto">
                Pilih grup dari sidebar menu atau masukkan ID / link grup Telegram di atas untuk mengekstrak anggota secara stealth.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TelegramScraperPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center font-mono text-xs text-text-muted">
        Loading Telegram Scraper Panel...
      </div>
    }>
      <TelegramScraperContent />
    </Suspense>
  );
}
