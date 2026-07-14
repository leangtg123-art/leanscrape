"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Terminal, Copy, Check, ArrowLeft, ArrowUpRight, BookOpen, FileText } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "intro", title: "Introduction" },
  { id: "auth", title: "Authentication" },
  { id: "scrape", title: "POST /scrape" },
  { id: "search", title: "POST /search" },
  { id: "crawl", title: "POST /crawl" },
  { id: "map", title: "POST /map" },
  { id: "interact", title: "POST /interact (Actions)" },
];

const CODE_EXAMPLES = {
  scrape: `{
  "url": "https://leanian.studio",
  "formats": ["markdown", "html"]
}`,
  scrapeRes: `{
  "success": true,
  "data": {
    "title": "LeanianStudio",
    "markdown": "# LeanianStudio\\n\\nHigh-performance AI systems...",
    "html": "<html><body>..."
  }
}`,
  search: `{
  "query": "leanscrape release date",
  "limit": 5
}`,
  searchRes: `{
  "success": true,
  "data": [
    {
      "title": "LeanScrape launch notes",
      "url": "https://leanian.studio/blog/leanscrape",
      "snippet": "LeanianStudio launched LeanScrape, a Next.js playground..."
    }
  ]
}`,
  interact: `{
  "url": "https://leanian.studio/login",
  "actions": [
    { "type": "type", "selector": "#email", "text": "dev@leanian.studio" },
    { "type": "click", "selector": "button[type='submit']" },
    { "type": "wait", "milliseconds": 2000 }
  ]
}`,
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("intro");
  const [copied, setCopied] = useState(false);

  const copyMarkdown = () => {
    // Generate markdown representing this doc page
    const docMd = `# LeanScrape API Documentation
    
This page details all available endpoints on LeanScrape client wrapper:
- Scrape API
- Search API
- Crawl API
- Map API
- Interact Actions API`;
    navigator.clipboard.writeText(docMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-bg text-white font-sans flex flex-col justify-between">
      <div className="scanline opacity-10 pointer-events-none" />
      <Navbar />

      <section className="py-12 relative overflow-hidden flex-1">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* 1. Sidebar Navigasi Docs */}
          <aside className="w-full lg:w-64 shrink-0 rounded-lg border border-border bg-bg-elevated/20 p-5 font-mono text-xs space-y-4">
            <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/40 font-bold">
              <BookOpen size={14} className="text-primary" />
              <span>API_DOCUMENTATION</span>
            </div>
            
            <nav className="flex flex-col gap-1.5">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded transition-colors focus:outline-none",
                    activeSection === sec.id
                      ? "bg-primary/10 border border-primary/20 text-white font-bold"
                      : "border border-transparent text-text-muted hover:bg-white/5 hover:text-white"
                  )}
                >
                  {sec.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* 2. Konten Kanan Docs */}
          <article className="flex-1 rounded-lg border border-border bg-[#0B0A0E] p-8 relative min-h-[400px] w-full text-left">
            <div className="corner-brackets" />
            
            {/* Copy as MD button */}
            <div className="absolute top-6 right-6 z-10">
              <button
                onClick={copyMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-bg-elevated hover:bg-white/5 rounded text-[10px] font-mono text-white transition-colors focus:outline-none"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <FileText size={12} />}
                <span>COPY PAGE AS MD</span>
              </button>
            </div>

            {/* Render Section based on activeState */}
            {activeSection === "intro" && (
              <div className="space-y-6 font-sans">
                <h1 className="text-3xl font-bold text-white tracking-tight">Introduction</h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Selamat datang di dokumentasi pengembang LeanScrape. LeanScrape memproksi request Anda ke Firecrawl API dengan aman menggunakan token API server-side terenkripsi untuk mengonversi data web mentah menjadi Markdown bersih yang siap dimasukkan ke agen kecerdasan buatan (LLM).
                </p>
                <div className="border border-border/40 bg-bg-elevated/40 p-4 rounded text-xs font-mono space-y-2 text-accent">
                  <span className="font-bold">QUICKSTART:</span>
                  <p className="text-gray-300">Setiap request API ke proxy backend LeanScrape wajib menyertakan Authorization token yang didapat dari halaman dasbor Anda.</p>
                </div>
              </div>
            )}

            {activeSection === "auth" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">Authentication</h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Semua request API yang diajukan ke endpoint proksi backend kami wajib menyertakan header otentikasi Bearer token LeanScrape Anda.
                </p>
                <pre className="border border-border/30 bg-bg/50 p-4 rounded font-mono text-xs text-gray-300 overflow-x-auto">
                  {`Authorization: Bearer your_leanscrape_key`}
                </pre>
              </div>
            )}

            {activeSection === "scrape" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">POST /scrape</h1>
                <p className="text-gray-400 text-sm">Mengonversi isi halaman URL tunggal menjadi data Markdown atau HTML bersih.</p>
                
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-accent">REQUEST BODY EXAMPLE (JSON)</h4>
                  <pre className="border border-border/30 bg-bg/50 p-4 rounded font-mono text-xs text-gray-300 overflow-x-auto">{CODE_EXAMPLES.scrape}</pre>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-accent">RESPONSE PAYLOAD EXAMPLE</h4>
                  <pre className="border border-border/30 bg-bg/50 p-4 rounded font-mono text-xs text-gray-300 overflow-x-auto">{CODE_EXAMPLES.scrapeRes}</pre>
                </div>
              </div>
            )}

            {activeSection === "search" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">POST /search</h1>
                <p className="text-gray-400 text-sm">Melakukan pencarian kata kunci langsung di mesin pencari web dan mengambil potongan konten hasil.</p>
                
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-accent">REQUEST BODY EXAMPLE (JSON)</h4>
                  <pre className="border border-border/30 bg-bg/50 p-4 rounded font-mono text-xs text-gray-300 overflow-x-auto">{CODE_EXAMPLES.search}</pre>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-accent">RESPONSE PAYLOAD EXAMPLE</h4>
                  <pre className="border border-border/30 bg-bg/50 p-4 rounded font-mono text-xs text-gray-300 overflow-x-auto">{CODE_EXAMPLES.searchRes}</pre>
                </div>
              </div>
            )}

            {activeSection === "crawl" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">POST /crawl</h1>
                <p className="text-gray-400 text-sm">Menjalankan pekerjaan crawling latar belakang (background crawl job) untuk menyisir semua link sub-halaman di satu domain target.</p>
                <p className="text-xs text-text-muted font-mono leading-relaxed">
                  Endpoint ini bersifat asinkron. Mengembalikan `jobId` yang bisa Anda pantau status penyelesaiannya secara berkala via endpoint GET `/api/leanscrape/crawl-status?jobId=...`.
                </p>
              </div>
            )}

            {activeSection === "map" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">POST /map</h1>
                <p className="text-gray-400 text-sm">Menyisir peta situs (sitemap) domain target dan menghasilkan daftar URL anak lengkap dalam array data.</p>
              </div>
            )}

            {activeSection === "interact" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">POST /interact (Actions)</h1>
                <p className="text-gray-400 text-sm">Menginstruksikan browser virtual serverless untuk melakukan serangkaian aksi seperti klik, ketik data, scroll, atau tangkapan layar.</p>
                
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-accent">REQUEST PAYLOAD ACTIONS (JSON)</h4>
                  <pre className="border border-border/30 bg-bg/50 p-4 rounded font-mono text-xs text-gray-300 overflow-x-auto">{CODE_EXAMPLES.interact}</pre>
                </div>
              </div>
            )}

          </article>

        </div>
      </section>

      <Footer />
    </main>
  );
}
