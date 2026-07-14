"use client";

import React, { useEffect, useState } from "react";
import { Search, Compass, Users, Bot, FileInput, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const CASES = [
  {
    icon: Search,
    title: "Deep Research",
    desc: "Beri makan model penalaran (reasoning models) dengan puluhan halaman web terstruktur sekaligus.",
  },
  {
    icon: Compass,
    title: "Smarter AI Chats",
    desc: "Sambungkan agen RAG ke hasil mesin pencarian langsung untuk mendapatkan informasi web terbaru.",
  },
  {
    icon: Bot,
    title: "AI Agent Tools",
    desc: "Persenjatai AI Agent Anda dengan alat browsing otonom yang stabil dan tidak terdeteksi bot.",
  },
  {
    icon: FileInput,
    title: "Onboarding Data",
    desc: "Dapatkan dokumen, manual, atau artikel bantuan dari web target untuk mengisi basis data internal.",
  },
  {
    icon: Users,
    title: "Lead Enrichment",
    desc: "Scrape profil bisnis, media sosial, dan data kontak dari situs web perusahaan secara berkala.",
  },
];

const RESEARCH_LOGS = [
  "INITIALIZE: Deep Research Agent v2",
  "QUERY: 'next generation battery anode technologies'",
  "SEARCHING: Web index query sent... found 18 targets",
  "SCRAPING: target [1/5] - nature.com/articles/battery-tech ... SUCCESS (200 OK)",
  "EXTRACTING: Key claims, figures, tables from Nature paper",
  "SCRAPING: target [2/5] - sciencedirect.com/journal/energy ... SUCCESS (200 OK)",
  "SCRAPING: target [3/5] - MIT Energy Initiative report ... BYPASSING CLOUDFLARE ... SUCCESS (200 OK)",
  "EXTRACTING: MIT report tables extracted, size: 45KB MD",
  "COMPILING: Synthesizing facts and resolving contradictions",
  "SAVING: Saving final output to research_summary.md (1,240 tokens)",
  "TASK_COMPLETED: Research finished successfully in 4.2 seconds."
];

export default function UseCases() {
  const [activeLogIdx, setActiveLogIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>([RESEARCH_LOGS[0]]);
  const [papersFound, setPapersFound] = useState(0);

  // 1. Loop log messages simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLogIdx((prev) => {
        const next = (prev + 1) % RESEARCH_LOGS.length;
        if (next === 0) {
          setLogs([RESEARCH_LOGS[0]]);
          setPapersFound(0);
        } else {
          setLogs((curr) => [...curr.slice(-5), RESEARCH_LOGS[next]]);
          if (RESEARCH_LOGS[next].includes("SUCCESS")) {
            setPapersFound((f) => f + 1);
          }
        }
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-bg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-16 text-left">
          <div className="inline-block px-3 py-1 border border-accent/20 bg-accent/5 text-accent text-xs font-mono rounded mb-4">
            05 / 06 · REAL-WORLD USE CASES
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-sans text-white mb-4">
            Designed for versatile workflows
          </h2>
          <p className="text-gray-400 font-sans max-w-xl">
            Dari asisten chat sederhana hingga agen riset otonom yang bekerja semalam penuh untuk mengumpulkan intelijen pasar.
          </p>
        </div>

        {/* Grid 5 cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          {CASES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-5 rounded-lg border border-border bg-bg-elevated/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow hover:border-primary/50 group"
              >
                <div className="corner-brackets" />
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
                  <Icon size={16} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2 font-sans">{item.title}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Large visual panel: Deep research logs logger */}
        <div className="max-w-3xl mx-auto rounded-lg border border-border bg-[#0B0A0E] overflow-hidden shadow-2xl flex flex-col h-[280px]">
          <div className="corner-brackets" />
          
          {/* Top Panel Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-bg-elevated/40 border-b border-border">
            <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
              <Terminal size={12} className="text-primary animate-pulse" />
              <span>research_agent_terminal.log</span>
            </div>
            <div className="font-mono text-[9px] text-accent">
              Academic papers: <span className="font-black">{papersFound} / 5 found</span>
            </div>
          </div>

          {/* Console output body */}
          <div className="flex-1 p-4 font-mono text-[10px] md:text-[11px] text-gray-300 flex flex-col gap-2 overflow-y-auto bg-[#070609] select-text">
            {logs.map((log, idx) => {
              const isHighlight = log.includes("SUCCESS") || log.includes("COMPLETED");
              const isError = log.includes("WARNING") || log.includes("CLOUDFLARE");
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-start gap-2 py-0.5 border-l-2 pl-2 transition-all duration-300",
                    isHighlight 
                      ? "border-green-500 text-green-400 font-bold" 
                      : isError 
                        ? "border-accent text-accent font-bold" 
                        : "border-primary/40 text-gray-400"
                  )}
                >
                  <span className="text-gray-600 select-none">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log}</span>
                </div>
              );
            })}
            <div className="w-1.5 h-3.5 bg-primary/80 animate-blink-cursor inline-block" />
          </div>
        </div>

      </div>
    </section>
  );
}
