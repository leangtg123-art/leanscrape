"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Database, KeyRound, Clock, Play, Terminal, ArrowUpRight } from "lucide-react";
import { mockDb, HistoryItem } from "@/lib/supabase";

export default function DashboardOverview() {
  const [credits, setCredits] = useState(1000);
  const [activeKeysCount, setActiveKeysCount] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [chartAnim, setChartAnim] = useState(false);

  useEffect(() => {
    setCredits(mockDb.getCredits());
    setActiveKeysCount(mockDb.getApiKeys().length);
    setHistory(mockDb.getHistory());
    setTimeout(() => setChartAnim(true), 200);
  }, []);

  // Hitung total requests
  const totalRequests = history.length;
  // Ambil request terbaru
  const recentHistory = history.slice(0, 3);

  // SVG Chart path calculation
  const pathData = "M 0 80 Q 50 20 100 60 T 200 40 T 300 70 T 400 30 T 500 50 T 600 10";

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-text-muted mt-1 font-mono">// WELCOME_TO_OPERATIONS_CONTROL</p>
        </div>

        <Link
          href="/playground"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-primary bg-primary/10 text-white rounded text-xs font-bold font-mono hover:bg-primary/20 transition-colors"
        >
          <Play size={12} fill="currentColor" className="text-accent animate-pulse" />
          <span>RUN PLAYGROUND SCRAPE</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1: Credits */}
        <div className="relative p-6 rounded-lg border border-border bg-bg-elevated/20 flex items-center justify-between">
          <div className="corner-brackets" />
          <div>
            <span className="text-[10px] text-text-muted font-mono block mb-1">REMAINING_CREDITS</span>
            <span className="text-2xl font-black text-white">{credits} Cr</span>
          </div>
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
            <Database size={18} />
          </div>
        </div>

        {/* Card 2: API Keys */}
        <div className="relative p-6 rounded-lg border border-border bg-bg-elevated/20 flex items-center justify-between">
          <div className="corner-brackets" />
          <div>
            <span className="text-[10px] text-text-muted font-mono block mb-1">ACTIVE_API_KEYS</span>
            <span className="text-2xl font-black text-white">{activeKeysCount} Keys</span>
          </div>
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
            <KeyRound size={18} />
          </div>
        </div>

        {/* Card 3: Total Requests */}
        <div className="relative p-6 rounded-lg border border-border bg-bg-elevated/20 flex items-center justify-between">
          <div className="corner-brackets" />
          <div>
            <span className="text-[10px] text-text-muted font-mono block mb-1">TOTAL_REQUESTS_MNT</span>
            <span className="text-2xl font-black text-white">{totalRequests} Req</span>
          </div>
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
            <Clock size={18} />
          </div>
        </div>

      </div>

      {/* Main Grid: Chart & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Animated usage chart */}
        <div className="lg:col-span-8 p-6 rounded-lg border border-border bg-[#0B0A0E] flex flex-col justify-between relative min-h-[300px]">
          <div className="corner-brackets" />
          
          <div>
            <h3 className="text-xs font-bold font-mono text-white mb-2 uppercase">// USAGE_TRAFFIC_30_DAYS</h3>
            <p className="text-[10px] text-text-muted">Grafik request total per hari (glowing SVG path).</p>
          </div>

          {/* SVG Glow path */}
          <div className="flex-1 w-full relative min-h-[140px] flex items-end">
            <svg 
              viewBox="0 0 600 100" 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Grid guide lines */}
              <line x1="0" y1="20" x2="600" y2="20" className="stroke-white/5 stroke-1" />
              <line x1="0" y1="50" x2="600" y2="50" className="stroke-white/5 stroke-1" />
              <line x1="0" y1="80" x2="600" y2="80" className="stroke-white/5 stroke-1" />

              {/* Glowing gradient path */}
              <path
                d={pathData}
                fill="none"
                stroke="var(--lc-primary)"
                strokeWidth="2.5"
                className="transition-all duration-[2000ms] ease-in-out"
                style={{
                  strokeDasharray: 1000,
                  strokeDashoffset: chartAnim ? 0 : 1000,
                }}
              />
              {/* Highlight points */}
              <circle cx="50" cy="20" r="3" className="fill-accent stroke-accent/40 stroke-4" />
              <circle cx="400" cy="30" r="3" className="fill-accent stroke-accent/40 stroke-4" />
              <circle cx="600" cy="10" r="3" className="fill-accent stroke-accent/40 stroke-4" />
            </svg>
          </div>

          {/* Chart footer labels */}
          <div className="flex justify-between font-mono text-[8px] text-text-muted pt-4 border-t border-border/20">
            <span>30 DAYS AGO</span>
            <span>15 DAYS AGO</span>
            <span>TODAY</span>
          </div>

        </div>

        {/* Right: Recent requests logs */}
        <div className="lg:col-span-4 p-6 rounded-lg border border-border bg-[#0B0A0E] flex flex-col justify-between relative min-h-[300px]">
          <div className="corner-brackets" />
          
          <div>
            <h3 className="text-xs font-bold font-mono text-white mb-4 uppercase">// RECENT_LOGS</h3>
            {recentHistory.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic p-4 text-center">No logs generated yet.</p>
            ) : (
              <div className="flex flex-col gap-3 font-mono text-[10px]">
                {recentHistory.map((item) => (
                  <div key={item.id} className="border-b border-border/20 pb-3 flex flex-col gap-1.5 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-white truncate max-w-[120px]">{item.targetUrl}</span>
                      <span className="text-accent font-bold">-{item.credits} Cr</span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] text-text-muted">
                      <span>{item.endpoint}</span>
                      <span className="text-green-400">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/20 mt-4">
            <Link
              href="/dashboard/history"
              className="w-full flex items-center justify-center gap-1 py-2 border border-border bg-bg-elevated hover:bg-white/5 text-[10px] font-mono text-white rounded transition-colors"
            >
              <span>VIEW ALL HISTORY</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
