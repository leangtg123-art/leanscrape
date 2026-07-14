"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BarChart, ShieldAlert, Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Compare() {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Aktifkan bar anim setelah mount
    setTimeout(() => {
      setInView(true);
    }, 200);
  }, []);

  return (
    <main className="min-h-screen bg-bg text-white font-sans flex flex-col justify-between">
      <div className="scanline opacity-10 pointer-events-none" />
      <Navbar />

      <section className="py-20 relative overflow-hidden flex-1">
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[250px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Header */}
          <div className="max-w-xl mx-auto mb-16 text-center">
            <div className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/5 text-primary px-3 py-1 rounded text-xs font-mono mb-4">
              <BarChart size={12} />
              <span>PERFORMANCE_BENCHMARKS</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-sans text-white mb-4">
              Performance analysis
            </h1>
            <p className="text-gray-400 text-sm">
              Perbandingan objektif kemampuan bypass proteksi, latensi rata-rata, dan kebersihan parsing teks LeanScrape vs kompetitor industri.
            </p>
          </div>

          {/* Benchmark Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto mb-16">
            
            {/* Chart 1: Cloudflare & Captcha Bypass Rate */}
            <div className="p-6 rounded-lg border border-border bg-bg-elevated/20 relative">
              <div className="corner-brackets" />
              <h3 className="text-sm font-bold text-white font-mono mb-6 flex items-center gap-2">
                <Award size={14} className="text-primary animate-pulse" />
                <span>CLOUDFLARE_BYPASS_SUCCESS_RATE</span>
              </h3>
              
              <div className="space-y-4 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-white">LeanScrape (Firecrawl Cloud)</span>
                    <span className="text-accent font-bold">99.2%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-[1500ms] ease-out" 
                      style={{ width: inView ? "99.2%" : "0%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-400">Jina Reader API</span>
                    <span className="text-gray-400 font-bold">84.5%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gray-500 transition-all duration-[1500ms] ease-out" 
                      style={{ width: inView ? "84.5%" : "0%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-500">Standard ScrapingBee</span>
                    <span className="text-gray-500 font-bold">78.0%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gray-700 transition-all duration-[1500ms] ease-out" 
                      style={{ width: inView ? "78.0%" : "0%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Average Scraping Latency (Lower is Better) */}
            <div className="p-6 rounded-lg border border-border bg-bg-elevated/20 relative">
              <div className="corner-brackets" />
              <h3 className="text-sm font-bold text-white font-mono mb-6 flex items-center gap-2">
                <Sparkles size={14} className="text-accent" />
                <span>AVG_SCRAPE_LATENCY_MS (LOWER=BETTER)</span>
              </h3>

              <div className="space-y-4 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-white">LeanScrape (Proxy Core)</span>
                    <span className="text-accent font-bold">620ms</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-[1500ms] ease-out" 
                      style={{ width: inView ? "30%" : "0%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-400">Custom Puppeteer Instance</span>
                    <span className="text-gray-400 font-bold">1,850ms</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gray-500 transition-all duration-[1500ms] ease-out" 
                      style={{ width: inView ? "80%" : "0%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-500">Standard Playwright Script</span>
                    <span className="text-gray-500 font-bold">2,400ms</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gray-700 transition-all duration-[1500ms] ease-out" 
                      style={{ width: inView ? "100%" : "0%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Data Note */}
          <div className="max-w-xl mx-auto border border-border bg-bg-elevated/40 p-4 rounded flex items-center gap-3 font-mono text-[9px] text-text-muted text-left">
            <ShieldAlert size={16} className="text-accent shrink-0" />
            <span>Semua grafik didasarkan pada tes pengujian rata-rata internal LeanianStudio pada 1,000 URL target populer (E-Commerce, SPA, Wiki, JS Hydration). Hasil dapat bervariasi bergantung lokasi geografis & koneksi server.</span>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
