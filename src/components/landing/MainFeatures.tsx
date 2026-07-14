"use client";

import React, { useState } from "react";
import { Search, Globe, RotateCw, Copy, Check, Terminal, Play } from "lucide-react";
import { cn } from "@/lib/utils";

// Contoh kode integrasi
const CODES = {
  python: `from leanscrape import LeanScrape

# Inisialisasi client
client = LeanScrape(api_key="your_leanscrape_key")

# Scrape halaman web ke Markdown
result = client.scrape_url(
    "https://leanian.studio",
    formats=["markdown"]
)

print(result["data"]["markdown"])`,
  node: `import { LeanScrape } from "leanscrape";

// Inisialisasi client
const client = new LeanScrape({ apiKey: "your_leanscrape_key" });

// Scrape halaman web ke Markdown
const result = await client.scrapeUrl("https://leanian.studio", {
  formats: ["markdown", "json"]
});

console.log(result.data.markdown);`,
  curl: `curl -X POST https://leanscrape.dev/api/leanscrape/scrape \\
  -H "Authorization: Bearer your_leanscrape_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://leanian.studio",
    "formats": ["markdown"]
  }'`,
  cli: `# Jalankan scraper langsung dari terminal Anda
npx -y leanscrape-cli@latest scrape https://leanian.studio --markdown`,
};

export default function MainFeatures() {
  const [activeLang, setActiveLang] = useState<"python" | "node" | "curl" | "cli">("python");
  const [copied, setCopied] = useState(false);
  const [outputTab, setOutputTab] = useState<"markdown" | "json">("markdown");
  
  // Interactive Demo States
  const [demoUrl, setDemoUrl] = useState("https://leanian.studio");
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoFinished, setDemoFinished] = useState(false);

  const runDemo = () => {
    setDemoRunning(true);
    setDemoFinished(false);
    setTimeout(() => {
      setDemoRunning(false);
      setDemoFinished(true);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(CODES[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 relative overflow-hidden bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16 text-left">
          <div className="inline-block px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-xs font-mono rounded mb-4">
            01 / 06 · MAIN FEATURES
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-sans text-white mb-4">
            Mulai scraping hari ini
          </h2>
          <p className="text-gray-400 font-sans max-w-xl">
            Tiga pilar utama untuk mengubah data web mentah menjadi bahan bakar berkualitas tinggi untuk model AI Anda.
          </p>
        </div>

        {/* 3 Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Search */}
          <div className="relative p-6 rounded-lg border border-border bg-bg-elevated/40 hover:border-primary/50 transition-all duration-300 group">
            <div className="corner-brackets" />
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Search size={20} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Search</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Cari apa saja di web secara real-time dan dapatkan konten lengkap yang diformat khusus untuk dimasukkan ke konteks LLM.
            </p>
          </div>

          {/* Card 2: Scrape */}
          <div className="relative p-6 rounded-lg border border-border bg-bg-elevated/40 hover:border-primary/50 transition-all duration-300 group">
            <div className="corner-brackets" />
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Globe size={20} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Scrape</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Konversi satu atau ratusan URL sekaligus menjadi Markdown bersih, HTML ter-strip, JSON terstruktur, bahkan tangkapan layar (screenshot).
            </p>
          </div>

          {/* Card 3: Crawl */}
          <div className="relative p-6 rounded-lg border border-border bg-bg-elevated/40 hover:border-primary/50 transition-all duration-300 group">
            <div className="corner-brackets" />
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <RotateCw size={20} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Crawl</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Crawl seluruh situs web secara mendalam dan terstruktur. Otomatis menelusuri sub-halaman, mengekstrak tautan, dan memformat semuanya.
            </p>
          </div>
        </div>

        {/* Integration Code & Output Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Kolom Kiri: Interactive Demo & Code */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Interactive Demo Input */}
            <div className="mb-6 p-4 rounded-lg border border-primary/30 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <div className="flex items-center gap-2 mb-3">
                <Play size={12} className="text-primary fill-primary animate-pulse" />
                <h4 className="text-[10px] font-mono font-bold text-primary tracking-widest">LIVE_API_DEMO</h4>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="url" 
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="flex-1 bg-[#08070A] border border-border rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary transition-colors"
                />
                <button 
                  onClick={runDemo}
                  disabled={demoRunning}
                  className="px-6 py-2 bg-primary hover:shadow-glow text-bg font-bold font-mono text-xs rounded transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {demoRunning ? (
                    <span className="animate-pulse">EXTRACTING...</span>
                  ) : (
                    "RUN SCRAPE"
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border border-border bg-bg-elevated/30 rounded-t-lg px-4 py-2 border-b-0">
              <div className="flex gap-2">
                {(["python", "node", "curl", "cli"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={cn(
                      "px-3 py-1 rounded text-xs font-mono transition-colors",
                      activeLang === lang
                        ? "bg-primary/20 text-white font-semibold"
                        : "text-text-muted hover:text-white"
                    )}
                  >
                    {lang === "node" ? "Node.js" : lang === "cli" ? "CLI" : lang.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={copyToClipboard}
                className="text-text-muted hover:text-white flex items-center gap-1 text-xs font-mono transition-colors focus:outline-none"
                title="Copy Code"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            
            <div className="flex-1 rounded-b-lg border border-border bg-[#0B0A0E] p-4 font-mono text-xs text-gray-300 overflow-x-auto relative min-h-[220px]">
              <div className="corner-brackets-bottom-left" />
              <pre className="leading-relaxed whitespace-pre">{CODES[activeLang]}</pre>
            </div>
          </div>

          {/* Kolom Kanan: Output Preview */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between border border-border bg-bg-elevated/30 rounded-t-lg px-4 py-2 border-b-0">
              <div className="flex gap-2">
                <button
                  onClick={() => setOutputTab("markdown")}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-mono transition-colors",
                    outputTab === "markdown" ? "bg-accent/20 text-white font-semibold" : "text-text-muted hover:text-white"
                  )}
                >
                  Output: Markdown
                </button>
                <button
                  onClick={() => setOutputTab("json")}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-mono transition-colors",
                    outputTab === "json" ? "bg-accent/20 text-white font-semibold" : "text-text-muted hover:text-white"
                  )}
                >
                  Output: JSON
                </button>
              </div>
              <span className="text-[10px] font-mono text-accent">[ clean_data ]</span>
            </div>

            <div className="flex-1 rounded-b-lg border border-border bg-[#08070A] p-4 font-mono text-xs text-gray-400 overflow-y-auto max-h-[350px] relative">
              <div className="corner-brackets-top-right" />
              
              {demoRunning ? (
                <div className="space-y-2 text-primary font-mono text-[10px] animate-pulse pt-4">
                  <p>{`> Initializing stealth browser...`}</p>
                  <p>{`> Bypassing anti-bot protections...`}</p>
                  <p>{`> Navigating to ${demoUrl}...`}</p>
                  <p>{`> Extracting DOM tree and converting to Markdown...`}</p>
                </div>
              ) : (
                <>
                  {outputTab === "markdown" ? (
                    <div className="space-y-2 text-[11px] pt-2">
                      <p className="text-gray-500"># Source: {demoFinished ? demoUrl : "https://leanian.studio"}</p>
                      <p className="text-white">### 1. Extracted Data Segment</p>
                      <p>Cleaned and formatted markdown ready for LLM consumption.</p>
                      <p className="text-gray-500 italic mt-4">[ Content dynamically scraped from {demoFinished ? demoUrl : "https://leanian.studio"} in 1.2s ]</p>
                    </div>
                  ) : (
                    <pre className="text-[10px] text-gray-300 leading-normal pt-2">{`{
  "success": true,
  "url": "${demoFinished ? demoUrl : "https://leanian.studio"}",
  "data": {
    "title": "Extracted Title",
    "markdown": "# Extracted Markdown...",
    "metadata": {
      "language": "en",
      "tokens": 450
    }
  }
}`}</pre>
                  )}
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
