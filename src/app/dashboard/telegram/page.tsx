"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Send, Users, Shield, User, FileJson, 
  Download, Eye, Settings, ShieldCheck, 
  HelpCircle, LogOut, CheckCircle2, AlertTriangle, Play,
  Search, Info, Award, MessageSquare, ShieldAlert, Sparkles, Trash2, CheckSquare
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
  const logsEndRef = useRef<HTMLDivElement>(null);
  
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

  // Live filtering / search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "member">("all");
  const [filterBot, setFilterBot] = useState<"all" | "yes" | "no">("all");
  const [filterPremium, setFilterPremium] = useState<"all" | "yes" | "no">("all");
  const [filterHasUsername, setFilterHasUsername] = useState(false);
  const [filterHasBio, setFilterHasBio] = useState(false);

  // Terminal logging states
  const [logs, setLogs] = useState<string[]>([]);
  
  // Batch details progress states
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);

  // Dialogs List (User's Telegram Groups)
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [dialogsLoading, setDialogsLoading] = useState(false);

  // Selected User for Detail View
  const [selectedUser, setSelectedUser] = useState<TelegramUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  // Auto scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${message}`]);
  };

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
    setSelectedUser(null);
    setLogs([]);
  };

  const performScrape = async (target: string) => {
    if (!target.trim()) return;

    setScrapeLoading(true);
    setScrapeError("");
    setGroupInfo(null);
    setMembers([]);
    setSelectedUser(null);
    setSelectedUserIds([]);
    setLogs([]);

    addLog("[INFO] Starting stealth Telegram MTProto Scraper engine...");
    addLog(`[INFO] Parameters configured -> Limit: ${limit}, Type: ${memberType}`);
    addLog(`[INFO] Targeting identifier: "${target}"`);
    addLog("[INFO] Connecting client session to Telegram Gateways...");

    try {
      const res = await fetch("/api/telegram/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiId,
          apiHash,
          session: sessionKey,
          groupIdentifier: target,
          memberType,
          limit,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal melakukan scraping.");
      }

      addLog(`[SUCCESS] Connected to group: "${json.groupInfo.title}" (ID: ${json.groupInfo.id})`);
      addLog(`[SUCCESS] Extracted metadata. Total members count: ${json.groupInfo.totalMembers}`);
      addLog(`[SUCCESS] Loaded ${json.data.length} participants list successfully!`);
      
      setGroupInfo(json.groupInfo);
      setMembers(json.data || []);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "Terjadi kesalahan saat memproses data.";
      addLog(`[ERROR] Scraping failed: ${errMsg}`);
      setScrapeError(errMsg);
    } finally {
      setScrapeLoading(false);
    }
  };

  // Scraping Handling
  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    await performScrape(groupIdentifier);
  };

  const selectGroupFromDialog = async (username: string, id: string) => {
    const target = username ? `@${username}` : id;
    setGroupIdentifier(target);
    addLog(`[INFO] Selected group from sidebar: ${target}`);
    await performScrape(target);
  };

  // Fetch Detail User Bio & Photo One-by-One
  const handleFetchDetail = async (userId: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, loadingDetail: true } : m))
    );
    if (selectedUser?.id === userId) {
      setDetailLoading(true);
    }

    addLog(`[INFO] Fetching deep details for user ID: ${userId}...`);

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
      addLog(`[SUCCESS] Detail loaded for user: ${updatedData.nickname || userId}`);
    } catch (err: any) {
      console.error(err);
      addLog(`[ERROR] Failed to load user detail: ${err.message}`);
      alert("Gagal mengambil bio/foto: " + err.message);
      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, loadingDetail: false } : m))
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Fetch Batch Details (Progressive Loop to bypass rates)
  const handleFetchBatchDetails = async () => {
    if (selectedUserIds.length === 0) return;
    setBatchLoading(true);
    setBatchTotal(selectedUserIds.length);
    setBatchProgress(0);

    addLog(`[INFO] Initiating progressive batch details fetch for ${selectedUserIds.length} users...`);

    const idsToFetch = [...selectedUserIds];
    let processed = 0;
    
    for (const userId of idsToFetch) {
      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, loadingDetail: true } : m))
      );
      
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
        if (res.ok && json.success) {
          const updatedData = json.data;
          setMembers((prev) =>
            prev.map((m) => (m.id === userId ? { ...m, ...updatedData, loadingDetail: false } : m))
          );
          if (selectedUser?.id === userId) {
            setSelectedUser((prev) => (prev ? { ...prev, ...updatedData } : null));
          }
        } else {
          setMembers((prev) =>
            prev.map((m) => (m.id === userId ? { ...m, loadingDetail: false } : m))
          );
        }
      } catch (err) {
        console.error(err);
        setMembers((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, loadingDetail: false } : m))
        );
      }
      processed++;
      setBatchProgress(processed);
      // Wait 350ms to avoid Telegram rate limits
      await new Promise((r) => setTimeout(r, 350));
    }

    addLog(`[SUCCESS] Progressive batch fetch completed. Processed: ${processed}/${selectedUserIds.length}`);
    setBatchLoading(false);
    setSelectedUserIds([]);
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredMembers.map(m => m.id);
    const allVisibleSelected = visibleIds.every(id => selectedUserIds.includes(id));

    if (allVisibleSelected) {
      // Unselect only the visible ones
      setSelectedUserIds((prev) => prev.filter(id => !visibleIds.includes(id)));
    } else {
      // Add all visible ones to selection
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleExport = (format: "json" | "csv" | "txt", exportSelected = false) => {
    if (!groupInfo) return;

    const listToExport = exportSelected 
      ? members.filter(m => selectedUserIds.includes(m.id))
      : filteredMembers;

    if (listToExport.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    let content = "";
    let filename = `telegram_${groupInfo.username || groupInfo.id}_scraped`;
    let mimeType = "";

    if (format === "json") {
      content = JSON.stringify({ groupInfo, members: listToExport }, null, 2);
      filename += ".json";
      mimeType = "application/json";
    } else if (format === "csv") {
      content = "User ID,Username,Nickname,Role,Bio,Phone,Is Bot,Is Premium\n";
      listToExport.forEach((m) => {
        content += `"${m.id}","${m.username}","${m.nickname.replace(/"/g, '""')}","${m.role}","${(m.bio || "").replace(/"/g, '""')}","${m.phone || "Hidden"}","${m.isBot}","${m.isPremium}"\n`;
      });
      filename += ".csv";
      mimeType = "text/csv";
    } else {
      // Export as formatted list text (very friendly for logs/usernames)
      content = `=== TELEGRAM GROUP EXPORTS ===\n`;
      content += `Group: ${groupInfo.title} (${groupInfo.username ? `@${groupInfo.username}` : groupInfo.id})\n`;
      content += `Total exported: ${listToExport.length} members\n`;
      content += `==============================\n\n`;
      listToExport.forEach((m, idx) => {
        content += `[${idx + 1}] ID: ${m.id} | Name: ${m.nickname} | Username: ${m.username ? `@${m.username}` : "-"}\n`;
        content += `    Role: ${m.role.toUpperCase()} | Bot: ${m.isBot ? "YES" : "NO"} | Premium: ${m.isPremium ? "YES" : "NO"}\n`;
        if (m.bio) content += `    Bio: ${m.bio}\n`;
        content += `------------------------------\n`;
      });
      filename += ".txt";
      mimeType = "text/plain";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog(`[SUCCESS] Exported ${listToExport.length} members in ${format.toUpperCase()} format.`);
  };

  // Calculate live statistics
  const totalScraped = members.length;
  const adminCount = members.filter(m => m.role === "admin").length;
  const botCount = members.filter(m => m.isBot).length;
  const premiumCount = members.filter(m => m.isPremium).length;
  const usernameCount = members.filter(m => m.username).length;
  const bioCount = members.filter(m => m.bio).length;

  const botPercentage = totalScraped > 0 ? ((botCount / totalScraped) * 100).toFixed(1) : "0";
  const premiumPercentage = totalScraped > 0 ? ((premiumCount / totalScraped) * 100).toFixed(1) : "0";
  const usernamePercentage = totalScraped > 0 ? ((usernameCount / totalScraped) * 100).toFixed(1) : "0";
  const bioPercentage = totalScraped > 0 ? ((bioCount / totalScraped) * 100).toFixed(1) : "0";
  const adminRatio = totalScraped > 0 ? ((adminCount / totalScraped) * 100).toFixed(1) : "0";

  // Filtered members list
  const filteredMembers = members.filter((member) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nicknameMatch = member.nickname.toLowerCase().includes(q);
      const usernameMatch = member.username?.toLowerCase().includes(q);
      const idMatch = member.id.includes(q);
      if (!nicknameMatch && !usernameMatch && !idMatch) return false;
    }

    if (filterRole !== "all" && member.role !== filterRole) return false;

    if (filterBot === "yes" && !member.isBot) return false;
    if (filterBot === "no" && member.isBot) return false;

    if (filterPremium === "yes" && !member.isPremium) return false;
    if (filterPremium === "no" && member.isPremium) return false;

    if (filterHasUsername && !member.username) return false;
    if (filterHasBio && !member.bio) return false;

    return true;
  });

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
            <Send className="text-primary animate-pulse" size={20} />
            <span>Telegram Group Scraper</span>
          </h1>
          <p className="text-xs text-text-muted mt-1 font-mono">// SECURE_STEALTH_MTPROTO_SCRAPER_ONLINE</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 border border-green-500/20 bg-green-500/5 text-green-400 font-mono text-[9px] flex items-center gap-1.5 rounded">
            <CheckCircle2 size={12} className="text-green-400" />
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
          
          <div className="p-4 border border-border bg-[#0B0A0E] rounded-lg text-[10px] font-mono text-text-muted space-y-2">
            <span className="font-bold text-white block">// SCRAPING_TIPS</span>
            <ul className="list-disc list-inside space-y-1 text-[9px] leading-relaxed">
              <li>Mendukung username grup (@username) atau link undangan.</li>
              <li>Scraping beroperasi secara stealth, meminimalkan rate-limit.</li>
              <li>Ambil bio detail dengan mengaktifkan checkbox pada baris tabel lalu klik Check Bio.</li>
            </ul>
          </div>
        </div>

        {/* Core Scraper form and parameters (Right - 9 columns) */}
        <div className="lg:col-span-9 space-y-6">
          <div className="relative p-6 border border-border bg-[#0B0A0E] rounded-lg space-y-4">
            <div className="corner-brackets" />
            <span className="text-[10px] text-text-muted font-mono block mb-1">// SCRAPER_SETTINGS</span>

            <form onSubmit={handleScrape} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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

              <button
                type="submit"
                disabled={scrapeLoading}
                className="w-full md:col-span-3 py-2.5 bg-primary text-white text-xs font-bold font-mono rounded hover:bg-primary/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {scrapeLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>CONNECTING MTPROTO & PARSING PEERS...</span>
                  </>
                ) : (
                  <>
                    <Play size={12} className="fill-current text-white" />
                    <span>RUN SCRAPER ENGINE</span>
                  </>
                )}
              </button>
            </form>

            {/* Live Terminal Output console log */}
            {logs.length > 0 && (
              <div className="mt-4 p-4 bg-black/60 border border-border/40 rounded font-mono text-[9px] text-green-400 space-y-1 max-h-[130px] overflow-y-auto relative">
                <div className="flex justify-between items-center text-text-muted border-b border-border/20 pb-1 mb-1 sticky top-0 bg-[#0B0A0E]/90">
                  <span className="flex items-center gap-1.5">
                    <Terminal size={10} className="text-primary animate-pulse" />
                    <span>ENGINE_CONSOLE_OUTPUT</span>
                  </span>
                  <button onClick={() => setLogs([])} className="hover:text-white text-[8px]">[CLEAR_CONSOLE]</button>
                </div>
                <div className="space-y-0.5">
                  {logs.map((log, i) => (
                    <div 
                      key={i} 
                      className={
                        log.includes("[SUCCESS]") 
                          ? "text-blue-400" 
                          : log.includes("[ERROR]") 
                          ? "text-red-400" 
                          : log.includes("[INFO]") 
                          ? "text-green-400/80" 
                          : "text-green-400"
                      }
                    >
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            )}
          </div>

          {scrapeError && (
            <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono rounded flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0 text-red-400" />
              <span>[ERROR] {scrapeError}</span>
            </div>
          )}

          {scrapeLoading ? (
            <div className="py-24 border border-border bg-[#0B0A0E] rounded-lg text-center font-mono text-xs text-text-muted relative overflow-hidden">
              <div className="corner-brackets" />
              <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3"></div>
              <div>Mengambil data partispian & mendaftarkan peer grup...</div>
            </div>
          ) : groupInfo ? (
            <div className="space-y-6">
              {/* Group Metadata Overview Card */}
              <div className="relative p-6 border border-border bg-[#0B0A0E] rounded-lg">
                <div className="corner-brackets" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                      <Sparkles size={16} className="text-primary animate-pulse" />
                      <span>{groupInfo.title}</span>
                    </h2>
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
                      MEMBERS: <span className="text-white font-bold">{groupInfo.totalMembers}</span>
                    </div>
                    <div>
                      ADMINS: <span className="text-accent font-bold">{groupInfo.totalAdmins}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Interactive Metrics Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 border border-border bg-[#0C0B0F] rounded-lg relative">
                  <span className="text-[8px] text-text-muted font-mono block uppercase">// TOTAL_SCRAPED</span>
                  <span className="text-xl font-bold text-white block mt-1">{totalScraped}</span>
                  <span className="text-[8px] text-text-muted font-mono block mt-1">Users loaded</span>
                </div>
                
                <div className="p-4 border border-border bg-[#0C0B0F] rounded-lg relative">
                  <span className="text-[8px] text-text-muted font-mono block uppercase">// ADMINS_RATIO</span>
                  <span className="text-xl font-bold text-amber-400 block mt-1">{adminRatio}%</span>
                  <div className="w-full bg-white/5 h-1 rounded mt-2 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded" style={{ width: `${Math.min(parseFloat(adminRatio), 100)}%` }} />
                  </div>
                </div>

                <div className="p-4 border border-border bg-[#0C0B0F] rounded-lg relative">
                  <span className="text-[8px] text-text-muted font-mono block uppercase">// BOT_PERCENTAGE</span>
                  <span className="text-xl font-bold text-purple-400 block mt-1">{botPercentage}%</span>
                  <div className="w-full bg-white/5 h-1 rounded mt-2 overflow-hidden">
                    <div className="bg-purple-400 h-full rounded" style={{ width: `${Math.min(parseFloat(botPercentage), 100)}%` }} />
                  </div>
                </div>

                <div className="p-4 border border-border bg-[#0C0B0F] rounded-lg relative">
                  <span className="text-[8px] text-text-muted font-mono block uppercase">// PREMIUM_MEMBERS</span>
                  <span className="text-xl font-bold text-indigo-400 block mt-1">{premiumPercentage}%</span>
                  <div className="w-full bg-white/5 h-1 rounded mt-2 overflow-hidden">
                    <div className="bg-indigo-400 h-full rounded" style={{ width: `${Math.min(parseFloat(premiumPercentage), 100)}%` }} />
                  </div>
                </div>

                <div className="p-4 border border-border bg-[#0C0B0F] rounded-lg relative">
                  <span className="text-[8px] text-text-muted font-mono block uppercase">// USERNAME_COVERAGE</span>
                  <span className="text-xl font-bold text-blue-400 block mt-1">{usernamePercentage}%</span>
                  <div className="w-full bg-white/5 h-1 rounded mt-2 overflow-hidden">
                    <div className="bg-blue-400 h-full rounded" style={{ width: `${Math.min(parseFloat(usernamePercentage), 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Members Table & Filters */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className={`${selectedUser ? "xl:col-span-8" : "xl:col-span-12"} space-y-4 transition-all duration-300`}>
                  
                  {/* Advanced Filters Panel */}
                  <div className="p-4 border border-border bg-[#0B0A0E] rounded-lg space-y-4">
                    <span className="text-[10px] text-text-muted font-mono block">// ADVANCED_LIVE_FILTERS</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Search Bar */}
                      <div className="relative sm:col-span-2">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Cari berdasarkan nickname, username, ID..."
                          className="w-full bg-bg border border-border rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Filter Role */}
                      <div>
                        <select
                          value={filterRole}
                          onChange={(e: any) => setFilterRole(e.target.value)}
                          className="w-full bg-bg border border-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary font-mono text-[10px]"
                        >
                          <option value="all">ROLE: ALL</option>
                          <option value="admin">ROLE: ADMINS</option>
                          <option value="member">ROLE: MEMBERS</option>
                        </select>
                      </div>

                      {/* Filter Premium */}
                      <div>
                        <select
                          value={filterPremium}
                          onChange={(e: any) => setFilterPremium(e.target.value)}
                          className="w-full bg-bg border border-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary font-mono text-[10px]"
                        >
                          <option value="all">PREMIUM: ALL</option>
                          <option value="yes">ONLY PREMIUM</option>
                          <option value="no">NON PREMIUM</option>
                        </select>
                      </div>
                    </div>

                    {/* Filter Checkboxes */}
                    <div className="flex flex-wrap gap-4 pt-1 font-mono text-[9px] text-text-muted">
                      <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                        <input
                          type="checkbox"
                          checked={filterHasUsername}
                          onChange={(e) => setFilterHasUsername(e.target.checked)}
                          className="rounded bg-bg border-border text-primary focus:ring-0 focus:ring-offset-0"
                        />
                        <span>HAS_USERNAME_ONLY</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                        <input
                          type="checkbox"
                          checked={filterHasBio}
                          onChange={(e) => setFilterHasBio(e.target.checked)}
                          className="rounded bg-bg border-border text-primary focus:ring-0 focus:ring-offset-0"
                        />
                        <span>HAS_BIO_LOADED_ONLY</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                        <input
                          type="checkbox"
                          checked={filterBot === "yes"}
                          onChange={(e) => setFilterBot(e.target.checked ? "yes" : "all")}
                          className="rounded bg-bg border-border text-primary focus:ring-0 focus:ring-offset-0"
                        />
                        <span>BOTS_ONLY</span>
                      </label>
                    </div>
                  </div>

                  {/* Main Scraped Table */}
                  <div className="relative border border-border bg-[#0B0A0E] rounded-lg overflow-hidden">
                    <div className="corner-brackets" />
                    
                    <div className="flex items-center justify-between p-4 border-b border-border/40 bg-bg/50 flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold font-mono text-white">
                          // MEMBERS_LIST ({filteredMembers.length} filtered)
                        </span>
                        
                        {/* Batch Action Buttons */}
                        {selectedUserIds.length > 0 && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleFetchBatchDetails}
                              disabled={batchLoading}
                              className="px-2.5 py-1 bg-primary/25 border border-primary/40 text-[9px] font-mono text-primary rounded hover:bg-primary/30 transition-all flex items-center gap-1"
                            >
                              <Eye size={10} />
                              <span>{batchLoading ? `CHECKING DETAILS (${batchProgress}/${batchTotal})...` : `CHECK SELECTED BIOS (${selectedUserIds.length})`}</span>
                            </button>
                            
                            <button
                              onClick={() => handleExport("txt", true)}
                              className="px-2 py-1 bg-white/5 border border-border hover:bg-white/10 text-[9px] font-mono text-white rounded transition-all"
                              title="Export selected members to TXT"
                            >
                              <span>Export Selected</span>
                            </button>

                            <button
                              onClick={() => setSelectedUserIds([])}
                              className="p-1 hover:text-red-400 text-text-muted"
                              title="Clear selection"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Exports buttons */}
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
                        <button
                          onClick={() => handleExport("txt")}
                          className="px-2.5 py-1.5 border border-border bg-bg-elevated hover:bg-white/5 text-[9px] font-mono text-white rounded flex items-center gap-1 transition-all"
                          title="Export lists as beautiful formatted TXT"
                        >
                          <MessageSquare size={10} /> TXT
                        </button>
                      </div>
                    </div>

                    {/* Batch progressive fetching loading bar */}
                    {batchLoading && (
                      <div className="w-full bg-white/5 h-1 relative overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-300" 
                          style={{ width: `${(batchProgress / batchTotal) * 100}%` }}
                        />
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full font-mono text-[10px] text-left">
                        <thead>
                          <tr className="border-b border-border/20 text-text-muted bg-white/[0.01]">
                            <th className="p-3 w-8">
                              <input
                                type="checkbox"
                                checked={filteredMembers.length > 0 && filteredMembers.every(m => selectedUserIds.includes(m.id))}
                                onChange={toggleSelectAll}
                                className="rounded bg-bg border-border text-primary focus:ring-0"
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
                          {filteredMembers.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-text-muted italic">
                                Tidak ada anggota grup yang cocok dengan filter pencarian saat ini.
                              </td>
                            </tr>
                          ) : (
                            filteredMembers.map((member) => (
                              <tr 
                                key={member.id} 
                                className={`border-b border-border/10 hover:bg-white/[0.02] cursor-pointer transition-all ${
                                  selectedUser?.id === member.id ? "bg-white/[0.03] border-l-2 border-l-primary" : ""
                                }`}
                                onClick={() => setSelectedUser(member)}
                              >
                                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={selectedUserIds.includes(member.id)}
                                    onChange={() => toggleSelectUser(member.id)}
                                    className="rounded bg-bg border-border text-primary focus:ring-0"
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
                                    className="px-2.5 py-1 bg-white/5 border border-border hover:border-primary text-[8px] rounded font-bold flex items-center gap-0.5 ml-auto text-white transition-colors"
                                  >
                                    {member.loadingDetail ? "..." : (member.bio ? "RE-LOAD" : "CHECK_BIO")}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Single Member Detail Card (Floated Right on Large Screens) */}
                {selectedUser && (
                  <div className="xl:col-span-4 relative p-6 border border-border bg-[#0B0A0E] rounded-lg space-y-6 animate-fade-in-right">
                    <div className="corner-brackets" />
                    
                    <div className="flex justify-between items-center border-b border-border/20 pb-3">
                      <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                        <Users size={12} className="text-primary animate-pulse" />
                        <span>USER_DEEP_DIVE</span>
                      </h3>
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
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300" />
                          <img
                            src={selectedUser.photoUrl}
                            alt={selectedUser.nickname}
                            className="w-20 h-20 rounded-full border border-primary/30 object-cover shadow-glow relative"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono text-xl shadow-inner relative">
                          <div className="absolute -inset-0.5 bg-primary rounded-full blur opacity-10" />
                          <span>{selectedUser.nickname.charAt(0)}</span>
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
                        <p className="text-white font-sans text-xs bg-bg/50 p-2.5 rounded border border-border/20 italic leading-relaxed whitespace-pre-wrap">
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

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFetchDetail(selectedUser.id)}
                        disabled={detailLoading}
                        className="flex-1 py-2 bg-primary text-white text-xs font-bold font-mono rounded hover:bg-primary/80 transition-all flex items-center justify-center gap-1.5"
                      >
                        {detailLoading ? (
                          <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Eye size={12} />
                        )}
                        <span>{selectedUser.bio ? "RE-CHECK BIO" : "CHECK BIO & PHOTO"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-28 border border-dashed border-border/40 rounded-lg text-center space-y-4 relative overflow-hidden">
              <div className="corner-brackets" />
              <Send className="mx-auto text-text-muted animate-pulse" size={32} />
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Stealth Telegram Scraper Ready
              </h3>
              <p className="text-[10px] text-text-muted max-w-xs mx-auto leading-relaxed">
                Pilih grup dari menu sidebar di sebelah kiri, atau masukkan ID / link grup Telegram di atas untuk mengekstrak anggota secara stealth menggunakan token client Anda.
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
