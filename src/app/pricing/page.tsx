"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, DollarSign } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Pricing() {
  return (
    <main className="min-h-screen bg-bg text-white font-sans flex flex-col justify-between">
      <div className="scanline opacity-10 pointer-events-none" />
      <Navbar />

      <section className="py-24 relative overflow-hidden flex-1 flex items-center justify-center">
        {/* Spotlights */}
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
        <div className="absolute w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full mx-auto px-4 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-1 border border-red-500/20 bg-red-500/5 text-red-400 px-3 py-1 rounded text-xs font-mono mb-2 animate-pulse">
            <DollarSign size={12} />
            <span>PORTAL_CLOSED</span>
          </div>

          <div className="relative p-8 rounded-lg border border-border bg-[#0b0a0e] overflow-hidden shadow-2xl space-y-4">
            <div className="corner-brackets" />
            <ShieldAlert size={48} className="text-red-500 mx-auto animate-pulse" />
            
            <h1 className="text-2xl font-bold font-mono tracking-wider text-white">
              PRICING PORTAL CLOSED
            </h1>
            
            <div className="space-y-3 text-xs text-gray-400 font-sans leading-relaxed">
              <p>
                <strong>[EN]</strong> LeanScrape is currently in open beta and accessible free of charge (with limit resets). Premium subscription portals are temporarily offline.
              </p>
              <div className="h-px bg-border/20 my-2" />
              <p>
                <strong>[ID]</strong> Portal pembayaran LeanScrape ditutup sementara untuk masa open beta. Sistem dapat diakses secara gratis dengan batas kuota otomatis.
              </p>
            </div>

            <div className="pt-4 border-t border-border/20">
              <Link 
                href="/" 
                className="w-full py-2.5 rounded bg-primary hover:shadow-glow text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-1.5 focus:outline-none"
              >
                <ArrowLeft size={14} />
                <span>RETURN_TO_HOME</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
