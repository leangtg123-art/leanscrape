"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Send, Terminal, ShieldAlert, Cpu } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function About() {
  return (
    <main className="min-h-screen bg-bg text-white font-sans flex flex-col justify-between">
      <div className="scanline opacity-10 pointer-events-none" />
      <Navbar />

      <section className="py-20 relative overflow-hidden flex-1">
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[250px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-left mb-12">
            <div className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/5 text-primary px-3 py-1 rounded text-xs font-mono mb-4">
              <Cpu size={12} className="animate-pulse" />
              <span>THE_STUDIO_GENESIS</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-sans text-white mb-6 leading-tight">
              About LeanianStudio
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl font-sans">
              Kami adalah studio pengembangan perangkat lunak kecil dan lincah yang berfokus pada pembuatan alat bantu pengembang (*developer-tools*), agen kecerdasan buatan (*AI agents*), serta otomatisasi alur kerja tingkat lanjut.
            </p>
          </div>

          {/* Story Content */}
          <div className="space-y-10 text-sm md:text-base text-gray-300 font-sans leading-relaxed">
            
            <div className="p-6 rounded-lg border border-border bg-bg-elevated/20 relative">
              <div className="corner-brackets" />
              <h3 className="text-lg font-bold text-white mb-3">Filosofi Kami</h3>
              <p>
                Di LeanianStudio, kami percaya bahwa masa depan rekayasa perangkat lunak akan digerakkan oleh agen AI otonom. Namun, agen AI tersebut hanya seandal data yang mereka konsumsi. LeanScrape dibangun untuk menyelesaikan kesenjangan ini — dengan menyajikan data web mentah yang bebas dari noise boilerplate, terenkripsi, dan diformat dengan sempurna ke dalam format yang disukai LLM (Markdown & JSON).
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white font-mono">// INDEPENDENT_DEVELOPMENT_DISCLOSURE</h3>
              <p className="text-xs text-gray-400 border-l-2 border-accent pl-4 italic">
                "LeanScrape is an independent client interface wrapper built by LeanianStudio on top of the official Firecrawl.dev API. We are not officially affiliated with, endorsed by, or partnered with Firecrawl."
              </p>
              <p>
                Pernyataan di atas adalah komitmen transparansi kami. Kami memanfaatkan ketangguhan mesin ekstraksi data milik Firecrawl secara resmi menggunakan token API berlisensi untuk menghadirkan dasbor bermain Playground yang kaya akan animasi futuristik bagi tim internal dan pengguna publik kami.
              </p>
            </div>

            {/* Telegram channel card */}
            <div className="border border-border/40 bg-bg-elevated/40 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 relative">
              <div className="corner-brackets-top-right" />
              <div className="corner-brackets-bottom-left" />
              
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Send size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">Join Telegram Channel</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Dapatkan update berkala di <a href="https://t.me/alewrld" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">@alewrld</a> atau hubungi personal chat di <a href="https://t.me/Littlealean" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">@Littlealean</a>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a
                  href="https://t.me/alewrld"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded text-xs font-bold font-mono text-white bg-primary border border-primary hover:shadow-glow transition-all"
                >
                  <span>CHANNEL @ALEWRLD</span>
                  <ArrowRight size={12} className="ml-1" />
                </a>
                <a
                  href="https://t.me/Littlealean"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded text-xs font-bold font-mono text-gray-300 border border-border bg-bg-elevated/40 hover:bg-white/5 transition-all"
                >
                  <span>CHAT @LITTLEALEAN</span>
                  <ArrowRight size={12} className="ml-1" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
