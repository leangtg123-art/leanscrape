"use client";

import React from "react";
import Link from "next/link";
import { GitBranch, Send, MessageCircle, Command } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-[#070609] pt-16 pb-8 overflow-hidden">
      {/* Accent Glow at the bottom center */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-2 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-2 group font-mono">
              <div className="w-6 h-6 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-primary fill-none stroke-current stroke-2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-wider text-white">LEANSCRAPE</span>
            </Link>
            
            <p className="text-xs text-text-muted max-w-xs leading-relaxed">
              Playground & dashboard premium buatan LeanianStudio di atas Firecrawl API. Membantu AI Anda berselancar di web dengan kecepatan kilat.
            </p>
            
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border bg-bg-elevated/40 text-[9px] font-mono rounded text-accent">
              <Command size={10} />
              <span>BACKED BY LEANIANSTUDIO</span>
            </div>
          </div>

          {/* Links Column 1: Products */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-widest mb-4">// PRODUCTS</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-text-muted font-sans">
              <li><Link href="/playground?tab=scrape" className="hover:text-white transition-colors">Scrape API</Link></li>
              <li><Link href="/playground?tab=search" className="hover:text-white transition-colors">Search Web</Link></li>
              <li><Link href="/playground?tab=crawl" className="hover:text-white transition-colors">Crawl Job</Link></li>
              <li><Link href="/playground?tab=map" className="hover:text-white transition-colors">URL Mapping</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Resources */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-widest mb-4">// RESOURCES</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-text-muted font-sans">
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Studio Blog</Link></li>
              <li><Link href="/use-cases" className="hover:text-white transition-colors">Use Cases</Link></li>
            </ul>
          </div>

          {/* Links Column 3: Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-widest mb-4">// STUDIO</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-text-muted font-sans">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><a href="https://t.me/LeanianStudio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram Channel</a></li>
              <li><Link href="/compare" className="hover:text-white transition-colors">Benchmarks</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-text-muted font-mono">
            &copy; {new Date().getFullYear()} LeanScrape. Built by leangtg123-art. Independent wrapper built on Firecrawl.
          </p>
          
          {/* Social icons */}
          <div className="flex items-center gap-4 text-text-muted">
            <a href="https://github.com/leangtg123-art" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="GitHub">
              <GitBranch size={16} />
            </a>
            <a href="https://t.me/LeanianStudio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Telegram">
              <Send size={16} />
            </a>
            <a href="https://twitter.com/LeanianStudio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Twitter/X">
              <MessageCircle size={16} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
