"use client";

import React, { useState } from "react";
import { Search, Globe, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GroupSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch(`/api/groupku/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal melakukan pencarian.");
      }

      setResults(json.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memproses request.");
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeRedirect = (groupLink: string, platform: string) => {
    if (platform === "telegram") {
      router.push(`/dashboard/telegram?link=${encodeURIComponent(groupLink)}`);
    } else {
      router.push(`/dashboard/whatsapp?link=${encodeURIComponent(groupLink)}`);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Public Group Finder</h1>
          <p className="text-xs text-text-muted mt-1 font-mono">// SEARCH_WHATSAPP_TELEGRAM_GROUPS_ON_WEB</p>
        </div>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="relative p-6 rounded-lg border border-border bg-[#0B0A0E] space-y-4">
        <div className="corner-brackets" />
        <span className="text-[10px] text-text-muted font-mono block mb-1">// GROUPKU_DATABASE_SEARCH_ENGINE</span>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Masukkan kata kunci pencarian (misal: bitcoin, indonesia, gamer)..."
              className="w-full bg-bg border border-border rounded pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="bg-bg border border-border rounded px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value={10}>10 Hasil</option>
              <option value={20}>20 Hasil</option>
              <option value={50}>50 Hasil</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold font-mono rounded hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {loading ? "SEARCHING..." : "SEARCH"}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono rounded">
          [ERROR] {error}
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-text-muted">
            <div className="animate-spin inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
            <div>Mencari grup di database publik...</div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((group, idx) => (
              <div
                key={idx}
                className="relative p-5 border border-border bg-[#0B0A0E] hover:border-primary/40 transition-all rounded-lg flex flex-col justify-between space-y-4 group"
              >
                <div className="corner-brackets opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white line-clamp-1">{group.title}</span>
                    <span
                      className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded border uppercase shrink-0 ${
                        group.platform === "telegram"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : group.platform === "whatsapp"
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-gray-500/10 border-gray-500/30 text-gray-400"
                      }`}
                    >
                      {group.platform}
                    </span>
                  </div>

                  <p className="text-[10px] text-text-muted line-clamp-2 mt-2 leading-relaxed">
                    {group.description || "Tidak ada deskripsi."}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {group.categories.slice(0, 3).map((cat: string, cIdx: number) => (
                      <span key={cIdx} className="text-[8px] font-mono text-text-muted bg-white/5 px-1.5 py-0.5 rounded">
                        #{cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/20 pt-4 text-[9px] font-mono text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} /> {group.publishedDate}
                  </span>

                  <div className="flex items-center gap-2">
                    {group.postUrl && (
                      <a
                        href={group.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white flex items-center gap-0.5"
                        title="Lihat Artikel Sumber"
                      >
                        Sumber <ExternalLink size={8} />
                      </a>
                    )}
                    {group.groupLink ? (
                      <button
                        onClick={() => handleScrapeRedirect(group.groupLink, group.platform)}
                        className="flex items-center gap-0.5 px-2 py-1 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-white rounded font-bold"
                      >
                        Scrape <ArrowRight size={8} />
                      </button>
                    ) : (
                      <span className="text-red-400 italic">No Link</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searched ? (
          <div className="py-12 border border-dashed border-border/40 rounded text-center text-xs font-mono text-text-muted">
            Tidak ada grup ditemukan untuk kata kunci "{query}". Coba kata kunci lainnya.
          </div>
        ) : (
          <div className="py-16 border border-dashed border-border/40 rounded text-center space-y-3">
            <Globe className="mx-auto text-text-muted animate-pulse" size={28} />
            <div className="text-xs font-mono text-text-muted">// DATABASE_READY_FOR_QUERY</div>
            <p className="text-[10px] text-text-muted max-w-xs mx-auto">
              Cari ribuan tautan grup WhatsApp dan Telegram publik yang dibagikan secara online menggunakan formulir di atas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
