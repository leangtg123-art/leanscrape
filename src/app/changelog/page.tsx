"use client";

import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Terminal, GitCommit, Sparkles, AlertCircle } from "lucide-react";

const UPDATES = [
  {
    version: "v1.0.0",
    date: "July 14, 2026",
    badge: "INITIAL RELEASE",
    changes: [
      "Inisialisasi visual playground & dashboard fungsional LeanScrape.",
      "Integrasi proksi backend Next.js API route ke Firecrawl API.",
      "Sistem multi-tema (5 tema warna unik dengan transisi sweep & flash).",
      "Fungsi manajemen API Key kustom dan sisa kredit pemakaian (mock Supabase).",
      "Penyalinan output scraping berupa Markdown bersih, JSON, dan tangkapan layar.",
    ],
  },
  {
    version: "v0.9.0",
    date: "July 01, 2026",
    badge: "BETA LAUNCH",
    changes: [
      "Inisialisasi sistem otentikasi pengguna (Supabase Auth).",
      "Penyusunan basis data mock untuk menyimpan riwayat request lokal.",
      "Simulasi Qi Canvas Particle background pada hero section.",
    ],
  },
];

export default function Changelog() {
  return (
    <main className="min-h-screen bg-bg text-white font-sans flex flex-col justify-between">
      <div className="scanline opacity-10 pointer-events-none" />
      <Navbar />

      <section className="py-20 relative overflow-hidden flex-1">
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="max-w-xl mb-16 text-left">
            <div className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/5 text-primary px-3 py-1 rounded text-xs font-mono mb-4">
              <GitCommit size={12} />
              <span>SYSTEM_UPDATE_LOG</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-sans text-white mb-4">
              Changelog
            </h1>
            <p className="text-gray-400 text-sm">
              Linimasa rilis pembaruan, fitur baru, perbaikan bug, dan optimasi performa LeanScrape.
            </p>
          </div>

          {/* Timeline entries */}
          <div className="relative border-l border-border/40 pl-6 ml-4 space-y-12 font-mono text-xs text-gray-300">
            {UPDATES.map((up) => (
              <div key={up.version} className="relative">
                {/* Node icon dot */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-bg border-2 border-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-bold text-white font-sans">{up.version}</span>
                    <span className="text-text-muted text-[10px]">{up.date}</span>
                    <span className="px-2 py-0.5 border border-primary/20 bg-primary/5 text-primary text-[8px] font-bold rounded">
                      {up.badge}
                    </span>
                  </div>

                  <ul className="space-y-2.5 list-disc pl-4 text-gray-400 font-sans text-sm">
                    {up.changes.map((change, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
