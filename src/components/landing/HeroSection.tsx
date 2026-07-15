"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Terminal, Play, Check, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// JSON previews untuk masing-masing tab
const PREVIEWS = {
  scrape: `{
  "status": "success",
  "data": {
    "url": "https://leanian.studio/about",
    "title": "About LeanianStudio",
    "markdown": "# LeanianStudio\\n\\nWe build high-performance AI agents and tools.\\n\\n## Core Technologies\\n* Next.js & React\\n* Python & LLMs\\n* Autonomous systems",
    "metadata": {
      "language": "en",
      "author": "Lean"
    }
  }
}`,
  search: `{
  "query": "nextjs 14 speeds",
  "results": [
    {
      "title": "Next.js 14 Performance Features",
      "url": "https://nextjs.org/blog/next-14",
      "snippet": "Next.js 14 introduces server action optimization and faster builds."
    },
    {
      "title": "Benchmarking Next.js 14",
      "url": "https://vercel.com/blog/benchmarking-nextjs",
      "snippet": "We benchmarked Next.js 14 App Router and found 53% faster startups."
    }
  ]
}`,
  map: `{
  "success": true,
  "links": [
    "https://leanian.studio/",
    "https://leanian.studio/projects",
    "https://leanian.studio/blog",
    "https://leanian.studio/contact"
  ]
}`,
  crawl: `{
  "jobId": "crl_9f8e7d6c5b4a",
  "status": "crawling",
  "pagesCrawled": 42,
  "activeWorkers": 3,
  "queue": 128,
  "logs": [
    "FETCHED: /projects - 200 OK",
    "FETCHED: /blog/agentic-ai - 200 OK",
    "FETCHED: /terms - 200 OK"
  ]
}`,
};

export default function HeroSection() {
  const { theme } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<"scrape" | "search" | "map" | "crawl">("scrape");
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 1. Particle Canvas Background Effect (Qi / Energy flow)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Dapatkan warna primer dari CSS variable
    const getPrimaryColor = () => {
      const style = getComputedStyle(document.documentElement);
      return style.getPropertyValue("--lc-primary").trim() || "#C81E3A";
    };

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      life: number;
    }> = [];

    const createParticle = () => {
      return {
        x: Math.random() * width,
        y: height + Math.random() * 20,
        size: Math.random() * 2 + 1,
        speedY: -(Math.random() * 0.8 + 0.3),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        life: Math.random() * 300 + 100,
      };
    };

    // Inisialisasi partikel
    for (let i = 0; i < 40; i++) {
      particles.push({
        ...createParticle(),
        y: Math.random() * height,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const primaryColor = getPrimaryColor();

      particles.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.life--;

        // Render partikel
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = p.opacity * (p.life / 400);
        ctx.shadowBlur = 6;
        ctx.shadowColor = primaryColor;
        ctx.fill();

        // Regenerasi jika mati atau keluar layar
        if (p.y < 0 || p.life <= 0) {
          particles[idx] = createParticle();
        }
      });
      ctx.shadowBlur = 0; // reset
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [theme]);

  // 2. Typewriter Effect untuk Terminal Widget
  useEffect(() => {
    setIsTyping(true);
    setTypedText("");
    const targetText = PREVIEWS[activeTab];
    let index = 0;
    
    // Kecepatan mengetik dipercepat agar tidak terlalu lama menunggu
    const interval = setInterval(() => {
      if (index < targetText.length) {
        // Efek scramble karakter acak pada karakter terakhir (matrix style)
        setTypedText((prev) => prev.slice(0, -1) + targetText[index] + (index < targetText.length - 1 ? "_" : ""));
        index++;
      } else {
        setTypedText(targetText);
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 4); // Cepat sekali

    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-16 overflow-hidden">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Radial Spotlight */}
      <div className="absolute inset-0 spotlight opacity-70 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Kolom Kiri: Teks & Informasi */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Status Pills */}
            <div className="flex flex-wrap gap-2 mb-6 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded border border-accent/20 bg-bg-elevated text-accent animate-float-slow">
                [ 200 OK ]
              </span>
              <span className="px-2 py-0.5 rounded border border-primary/20 bg-bg-elevated text-primary animate-float-delayed">
                [ .JSON ]
              </span>
              <span className="px-2 py-0.5 rounded border border-green-500/20 bg-bg-elevated text-green-400 animate-float-slow">
                [ SCRAPE ]
              </span>
              <span className="px-2 py-0.5 rounded border border-purple-500/20 bg-bg-elevated text-purple-400 animate-float-delayed">
                [ .MD ]
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight font-sans text-white mb-6 leading-[1.1]">
              Convert any website into{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-glow">
                structured data
              </span>{" "}
              instantly
            </h1>

            {/* Subheadline */}
            <p className="text-gray-400 text-base md:text-lg mb-8 font-sans max-w-lg leading-relaxed">
              Ekstrak data dari situs web mana pun secara instan. LeanScrape mengonversi halaman web kompleks menjadi Markdown bersih, HTML tanpa boilerplates, dan JSON terstruktur melalui API yang cepat dan andal.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10 w-full sm:w-auto">
              <Link
                href="/signin?view=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded text-sm font-bold font-mono text-white bg-primary border border-primary hover:shadow-glow hover:scale-[1.02] transition-all duration-300 group"
              >
                <span>START FOR FREE</span>
                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/docs"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded text-sm font-bold font-mono text-gray-300 border border-border bg-bg-elevated/40 hover:bg-white/5 hover:text-white transition-all duration-300"
              >
                <Terminal size={16} className="mr-2 text-primary" />
                <span>READ DOCUMENTATION</span>
              </Link>
            </div>

            {/* Tab Swappers */}
            <div className="w-full border-t border-border/40 pt-6">
              <p className="text-xs text-text-muted font-mono mb-3 tracking-wider">CHOOSE ENDPOINT DEMO:</p>
              <div className="flex flex-wrap gap-2 font-mono">
                {(["scrape", "search", "map", "crawl"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3 py-1.5 rounded text-xs border transition-all duration-300 focus:outline-none",
                      activeTab === tab
                        ? "border-primary bg-primary/10 text-white font-semibold"
                        : "border-border bg-bg-elevated/40 text-text-muted hover:border-text-muted/40 hover:text-white"
                    )}
                  >
                    {`$ ./${tab}`}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Terminal Widget */}
          <div className="lg:col-span-6 w-full relative">
            {/* Ambient Glow behind card */}
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-accent opacity-15 blur-2xl pointer-events-none" />
            
            {/* Terminal Card */}
            <div className="relative rounded-lg border border-border bg-[#0B0A0E] overflow-hidden shadow-2xl flex flex-col h-[380px] w-full font-mono text-xs">
              {/* Corner decor */}
              <div className="corner-brackets" />

              {/* Title bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-elevated/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-[10px] text-text-muted flex items-center gap-1.5">
                  <Terminal size={12} className="text-primary" />
                  <span>leanscrape_{activeTab}.json</span>
                </div>
                <div className="w-12" /> {/* spacer */}
              </div>

              {/* Body */}
              <div className="flex-1 p-4 overflow-y-auto relative text-gray-300 select-text">
                {/* scanline sweep inside card */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none h-16 w-full animate-scanline-sweep" />
                
                <pre className="whitespace-pre-wrap word-break-all text-[11px] leading-relaxed">
                  {typedText}
                </pre>
              </div>

              {/* Status bar */}
              <div className="px-4 py-2 border-t border-border bg-bg-elevated/20 flex items-center justify-between text-[10px] text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span>{isTyping ? "Scraping..." : "Status: idle"}</span>
                </div>
                <div>
                  <span>UTF-8</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
