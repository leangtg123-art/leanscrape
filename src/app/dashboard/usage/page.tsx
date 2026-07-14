"use client";

import React, { useEffect, useState } from "react";
import { Database, BarChart3, TrendingUp, Info } from "lucide-react";
import { mockDb, HistoryItem } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function UsagePage() {
  const [credits, setCredits] = useState(1000);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setCredits(mockDb.getCredits());
    setHistory(mockDb.getHistory());
    setTimeout(() => setInView(true), 200);
  }, []);

  // Hitung pemakaian per endpoint
  const stats = {
    scrape: 0,
    search: 0,
    crawl: 0,
    map: 0,
    interact: 0,
  };

  history.forEach((item) => {
    const end = item.endpoint.toLowerCase();
    if (end in stats) {
      stats[end as keyof typeof stats] += item.credits;
    }
  });

  const totalUsed = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Usage Statistics</h1>
        <p className="text-xs text-text-muted mt-1 font-mono">// VIEW_ACCUMULATED_RESOURCE_CONSUMPTION</p>
      </div>

      {/* Credit usage card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Credits Remaining */}
        <div className="relative p-6 rounded-lg border border-border bg-bg-elevated/20 flex items-center justify-between">
          <div className="corner-brackets" />
          <div>
            <span className="text-[10px] text-text-muted font-mono block mb-1">REMAINING_BALANCE</span>
            <span className="text-2xl font-black text-white">{credits} Cr</span>
          </div>
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
            <Database size={18} />
          </div>
        </div>

        {/* Total Credits Used */}
        <div className="relative p-6 rounded-lg border border-border bg-bg-elevated/20 flex items-center justify-between">
          <div className="corner-brackets" />
          <div>
            <span className="text-[10px] text-text-muted font-mono block mb-1">TOTAL_CREDITS_CONSUMED</span>
            <span className="text-2xl font-black text-white">{totalUsed} Cr</span>
          </div>
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* Endpoint Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Table breakdown */}
        <div className="lg:col-span-7 p-6 rounded-lg border border-border bg-[#0B0A0E] relative flex flex-col justify-between">
          <div className="corner-brackets" />
          <div>
            <h3 className="text-xs font-bold font-mono text-white mb-4 uppercase">// ENDPOINT_CONSUMPTION_BREAKDOWN</h3>
            
            <div className="space-y-4 font-mono text-[11px] text-gray-300">
              
              {/* Scrape Breakdown */}
              <div>
                <div className="flex justify-between mb-1">
                  <span>POST /v2/scrape</span>
                  <span className="text-white font-bold">{stats.scrape} Cr</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out" 
                    style={{ width: totalUsed > 0 ? `${(stats.scrape / totalUsed) * 100}%` : "0%" }}
                  />
                </div>
              </div>

              {/* Search Breakdown */}
              <div>
                <div className="flex justify-between mb-1">
                  <span>POST /v2/search</span>
                  <span className="text-white font-bold">{stats.search} Cr</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-1000 ease-out" 
                    style={{ width: totalUsed > 0 ? `${(stats.search / totalUsed) * 100}%` : "0%" }}
                  />
                </div>
              </div>

              {/* Crawl Breakdown */}
              <div>
                <div className="flex justify-between mb-1">
                  <span>POST /v2/crawl</span>
                  <span className="text-white font-bold">{stats.crawl} Cr</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-1000 ease-out" 
                    style={{ width: totalUsed > 0 ? `${(stats.crawl / totalUsed) * 100}%` : "0%" }}
                  />
                </div>
              </div>

              {/* Map Breakdown */}
              <div>
                <div className="flex justify-between mb-1">
                  <span>POST /v2/map</span>
                  <span className="text-white font-bold">{stats.map} Cr</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-1000 ease-out" 
                    style={{ width: totalUsed > 0 ? `${(stats.map / totalUsed) * 100}%` : "0%" }}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="text-[10px] text-text-muted mt-6 pt-4 border-t border-border/20 flex items-center gap-1.5 font-mono">
            <Info size={12} />
            <span>Kredit diperbarui setiap kali request berhasil dieksekusi.</span>
          </div>

        </div>

        {/* Right: Pie Distribution (SVG custom donut) */}
        <div className="lg:col-span-5 p-6 rounded-lg border border-border bg-[#0B0A0E] relative flex flex-col items-center justify-center min-h-[250px]">
          <div className="corner-brackets" />
          <h3 className="text-xs font-bold font-mono text-white mb-6 uppercase text-left w-full">// TRAFFIC_DISTRIBUTION</h3>
          
          <div className="relative w-36 h-36">
            {/* Custom SVG Donut */}
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              {totalUsed > 0 ? (
                <>
                  {/* Scrape Arc */}
                  <circle 
                    cx="18" cy="18" r="15.915" fill="none" stroke="var(--lc-primary)" strokeWidth="3.2" 
                    strokeDasharray={`${(stats.scrape / totalUsed) * 100} ${100 - (stats.scrape / totalUsed) * 100}`}
                    strokeDashoffset="0"
                    className="transition-all duration-1000"
                  />
                  {/* Search Arc */}
                  <circle 
                    cx="18" cy="18" r="15.915" fill="none" stroke="var(--lc-accent)" strokeWidth="3.2" 
                    strokeDasharray={`${(stats.search / totalUsed) * 100} ${100 - (stats.search / totalUsed) * 100}`}
                    strokeDashoffset={-(stats.scrape / totalUsed) * 100}
                    className="transition-all duration-1000"
                  />
                </>
              ) : (
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.2" />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-xs text-text-muted">USED</span>
              <span className="text-base font-black text-white">{totalUsed} Cr</span>
            </div>
          </div>

          <div className="flex gap-4 font-mono text-[9px] mt-6 flex-wrap justify-center">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> SCRAPE</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> SEARCH</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> CRAWL</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> MAP</span>
          </div>

        </div>

      </div>

    </div>
  );
}
