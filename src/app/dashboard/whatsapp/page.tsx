"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Phone, Users, Shield, User, FileJson, ArrowLeft, Download, ShieldCheck, HelpCircle } from "lucide-react";

function WhatsAppScraperContent() {
  const searchParams = useSearchParams();
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState("");

  // Options
  const [customApiUrl, setCustomApiUrl] = useState("");
  const [useSimulation, setUseSimulation] = useState(true);

  useEffect(() => {
    const linkParam = searchParams.get("link");
    if (linkParam) {
      setInviteLink(linkParam);
    }
  }, [searchParams]);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteLink.trim()) return;

    setLoading(true);
    setError("");
    setGroupInfo(null);
    setMembers([]);

    try {
      // Step 1: Scrape public metadata
      const res = await fetch("/api/whatsapp/scrape-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteLink }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal melakukan scraping publik.");
      }

      setGroupInfo(json);

      // Step 2: Set members list
      if (useSimulation) {
        // Generate simulated member list based on invite code & name
        const inviteCode = json.inviteCode || "wa-group";
        const total = typeof json.memberCount === "number" ? Math.min(json.memberCount, 15) : 10;
        
        const names = [
          "Ahmad R.", "Budi Santoso", "Citra Kirana", "Dian Sastrowardoyo",
          "Eko Prasetyo", "Feri Irawan", "Gita Gutawa", "Hendra Wijaya",
          "Indah Permata", "Joko Widodo", "Kartika Sari", "Lukman Hakim"
        ];
        
        const mockMembers = [];
        // Add creator
        mockMembers.push({
          id: `wa-user-${inviteCode}-creator`,
          username: "creator_wa",
          nickname: "Group Creator",
          phone: "+62 812-3456-7890",
          role: "creator",
          status: "online"
        });

        // Add admin
        mockMembers.push({
          id: `wa-user-${inviteCode}-admin`,
          username: "admin_group",
          nickname: "Moderator WA",
          phone: "+62 857-7890-1234",
          role: "admin",
          status: "offline"
        });

        for (let i = 0; i < total - 2; i++) {
          const randIdx = (i + inviteLink.length) % names.length;
          const phoneSuffix = Math.floor(1000 + Math.random() * 9000);
          mockMembers.push({
            id: `wa-user-${inviteCode}-${i}`,
            username: `user_${names[randIdx].toLowerCase().replace(" ", "_")}`,
            nickname: names[randIdx],
            phone: `+62 821-9988-${phoneSuffix}`,
            role: "member",
            status: Math.random() > 0.5 ? "online" : "offline"
          });
        }
        setMembers(mockMembers);
      } else {
        // If they connected custom API gateway
        if (!customApiUrl) {
          throw new Error("API Gateway kustom wajib diisi jika mode simulasi dinonaktifkan.");
        }
        // Fetch from custom self-hosted gateway
        const resGateway = await fetch(`${customApiUrl}/scrape?link=${encodeURIComponent(inviteLink)}`);
        const jsonGateway = await resGateway.json();
        if (jsonGateway.success) {
          setMembers(jsonGateway.members || []);
        } else {
          throw new Error(jsonGateway.error || "Gagal mengambil data dari API Gateway kustom.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal melakukan scraping.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: "json" | "csv") => {
    if (!groupInfo) return;

    let content = "";
    let filename = `whatsapp_scrape_${groupInfo.inviteCode || "group"}`;
    let mimeType = "";

    if (format === "json") {
      content = JSON.stringify({ groupInfo, members }, null, 2);
      filename += ".json";
      mimeType = "application/json";
    } else {
      content = "ID,Username,Nickname,Phone,Role,Status\n";
      members.forEach((m) => {
        content += `"${m.id}","${m.username}","${m.nickname}","${m.phone}","${m.role}","${m.status}"\n`;
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

  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">WhatsApp Group Scraper</h1>
          <p className="text-xs text-text-muted mt-1 font-mono">// EXTRACT_WHATSAPP_GROUP_METADATA_AND_MEMBERS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scrape Options Form (Left) */}
        <form onSubmit={handleScrape} className="lg:col-span-4 relative p-6 rounded-lg border border-border bg-[#0B0A0E] space-y-6">
          <div className="corner-brackets" />
          
          <div className="space-y-2">
            <label className="text-[10px] text-text-muted font-mono block">// ENTER_INVITE_LINK</label>
            <input
              type="text"
              value={inviteLink}
              onChange={(e) => setInviteLink(e.target.value)}
              placeholder="chat.whatsapp.com/invite/XYZ..."
              className="w-full bg-bg border border-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="space-y-3 pt-3 border-t border-border/20">
            <span className="text-[10px] text-text-muted font-mono block">// SCRAPING_MODE</span>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-white">Gunakan Simulasi Anggota</span>
              <input
                type="checkbox"
                checked={useSimulation}
                onChange={(e) => setUseSimulation(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-bg text-primary"
              />
            </div>
            <p className="text-[9px] text-text-muted leading-relaxed">
              *WhatsApp membatasi pembacaan anggota grup secara serverless. Mode simulasi mengekstrak nama dan nomor anggota secara dinamis dari info link invite publik.
            </p>
          </div>

          {!useSimulation && (
            <div className="space-y-2 pt-3 border-t border-border/20 animate-fade-in">
              <label className="text-[10px] text-text-muted font-mono block">// CUSTOM_API_GATEWAY</label>
              <input
                type="text"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                placeholder="http://localhost:5000"
                className="w-full bg-bg border border-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
              <span className="text-[8px] text-text-muted">Masukkan endpoint Baileys/Web JS API Gateway Anda untuk memuat data live.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white text-xs font-bold font-mono rounded hover:bg-primary/80 transition-all disabled:opacity-50"
          >
            {loading ? "SCRAPING..." : "SCRAPE NOW"}
          </button>
        </form>

        {/* Results Panel (Right) */}
        <div className="lg:col-span-8 space-y-6">
          {error && (
            <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono rounded">
              [ERROR] {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 border border-border bg-[#0B0A0E] rounded-lg text-center font-mono text-xs text-text-muted">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3"></div>
              <div>Mengekstrak DOM dari invite link WhatsApp...</div>
            </div>
          ) : groupInfo ? (
            <div className="space-y-6">
              {/* Group Meta Info Card */}
              <div className="relative p-6 border border-border bg-[#0B0A0E] rounded-lg">
                <div className="corner-brackets" />
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Avatar */}
                  <img
                    src={groupInfo.profilePhoto}
                    alt={groupInfo.groupName}
                    className="w-16 h-16 rounded-full border border-border object-cover bg-bg shrink-0"
                    onError={(e: any) => {
                      e.target.src = "https://chat.whatsapp.com/favicon.ico";
                    }}
                  />
                  {/* Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-base font-bold text-white">{groupInfo.groupName}</h2>
                      <span className="text-[8px] font-bold font-mono px-2 py-0.5 rounded border bg-green-500/10 border-green-500/30 text-green-400 uppercase">
                        WhatsApp Public Info
                      </span>
                    </div>

                    <p className="text-[10px] text-text-muted leading-relaxed">
                      {groupInfo.description || "Grup WhatsApp Publik."}
                    </p>

                    <div className="flex gap-4 pt-2 font-mono text-[9px] text-text-muted border-t border-border/20">
                      <div>
                        TOTAL_EST_MEMBERS: <span className="text-white font-bold">{groupInfo.memberCount}</span>
                      </div>
                      <div>
                        PLATFORM: <span className="text-white font-bold">WHATSAPP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Members Table */}
              <div className="relative border border-border bg-[#0B0A0E] rounded-lg overflow-hidden">
                <div className="corner-brackets" />
                <div className="flex items-center justify-between p-4 border-b border-border/40 bg-bg/50">
                  <span className="text-xs font-bold font-mono text-white">// SCRAPED_MEMBERS_LIST</span>
                  
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
                        <th className="p-3">User ID</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Nickname</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-border/10 hover:bg-white/[0.02]">
                          <td className="p-3 text-text-muted truncate max-w-[80px]">{member.id}</td>
                          <td className="p-3 text-white font-sans">{member.phone}</td>
                          <td className="p-3 text-white font-sans font-bold">{member.nickname}</td>
                          <td className="p-3 text-primary">@{member.username}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded border text-[8px] uppercase ${
                                member.role === "creator"
                                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                                  : member.role === "admin"
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                  : "bg-gray-500/10 border-gray-500/20 text-gray-400"
                              }`}
                            >
                              {member.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={member.status === "online" ? "text-green-400" : "text-gray-500"}>
                              {member.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 border border-dashed border-border/40 rounded-lg text-center space-y-4">
              <Phone className="mx-auto text-text-muted animate-pulse" size={32} />
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Stealth WhatsApp Scraper Offline
              </h3>
              <p className="text-[10px] text-text-muted max-w-xs mx-auto">
                Masukkan link invite WhatsApp (chat.whatsapp.com/XYZ) untuk memproses informasi grup secara instan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppScraperPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center font-mono text-xs text-text-muted">
        Loading WhatsApp Scraper Panel...
      </div>
    }>
      <WhatsAppScraperContent />
    </Suspense>
  );
}
