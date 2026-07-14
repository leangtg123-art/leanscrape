"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Terminal, GitBranch, Menu, X, ChevronDown, Activity, Server, FileText, Play } from "lucide-react";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ghStars, setGhStars] = useState(158); // Fallback

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);

    // Fetch GitHub stars (live)
    fetch("https://api.github.com/repos/leangtg123-art/leanscrape")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (data.stargazers_count !== undefined) setGhStars(data.stargazers_count);
      })
      .catch(() => {
        // Abaikan error, gunakan fallback
      });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 w-full z-40 transition-all duration-300 border-b border-transparent",
        scrolled 
          ? "bg-bg/85 backdrop-blur-md border-border py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Kiri: Logo */}
        <Link href="/" className="flex items-center gap-2 group font-mono">
          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
            {/* Geometric lightning vector logo */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5 text-primary fill-none stroke-current stroke-2"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </div>
          <span className="text-lg font-bold tracking-wider text-white">
            LEAN<span className="text-primary font-black">SCRAPE</span>
          </span>
        </Link>

        {/* Tengah: Menu Desktop */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {/* Dropdown Products */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors focus:outline-none">
              Products <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 rounded bg-bg-elevated border border-border opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 p-2 shadow-2xl">
              <div className="corner-brackets-top-right" />
              <div className="corner-brackets-bottom-left" />
              <Link href="/playground?tab=scrape" className="flex items-start gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                <Terminal size={16} className="text-primary mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-white">Scrape API</div>
                  <p className="text-[10px] text-gray-400">Extract clean markdown or JSON.</p>
                </div>
              </Link>
              <Link href="/playground?tab=search" className="flex items-start gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                <Server size={16} className="text-accent mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-white">Search API</div>
                  <p className="text-[10px] text-gray-400">Perform live web searches for LLMs.</p>
                </div>
              </Link>
              <Link href="/playground?tab=crawl" className="flex items-start gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                <Activity size={16} className="text-green-400 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-white">Crawl API</div>
                  <p className="text-[10px] text-gray-400">Crawl websites recursively.</p>
                </div>
              </Link>
            </div>
          </div>

          <Link href="/playground" className="text-gray-300 hover:text-white transition-colors">Playground</Link>
          <Link href="/docs" className="text-gray-300 hover:text-white transition-colors">Docs</Link>
          <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
        </nav>

        {/* Kanan: Utilities & CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {/* GitHub Star Counter */}
          <a
            href="https://github.com/leangtg123-art/leanscrape"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-bg-elevated hover:bg-white/5 transition-colors text-xs text-gray-300 font-mono"
          >
            <GitBranch size={14} />
            <span>Star</span>
            <span className="border-l border-border pl-1.5 text-accent font-bold">{ghStars}</span>
          </a>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          <Link
            href="/signin"
            className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 transition-colors"
          >
            Sign in
          </Link>

          <Link
            href="/signin?view=signup"
            className="relative inline-flex items-center justify-center px-4 py-2 text-xs font-bold font-mono text-white bg-primary rounded border border-primary hover:shadow-glow transition-all duration-300 overflow-hidden group"
          >
            <span className="relative z-10">START FREE</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white focus:outline-none"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-bg-elevated border-b border-border absolute left-0 w-full px-4 py-6 flex flex-col gap-4 z-40 transition-all duration-300 font-mono text-xs">
          <Link href="/playground" className="text-gray-300 hover:text-white text-base py-1">Playground</Link>
          <Link href="/docs" className="text-gray-300 hover:text-white text-base py-1">Documentation</Link>
          <Link href="/about" className="text-gray-300 hover:text-white text-base py-1">About LeanianStudio</Link>
          
          <hr className="border-border" />
          
          <div className="flex flex-col gap-2.5">
            <Link
              href="/signin"
              className="text-center w-full py-2.5 rounded border border-border text-gray-300 hover:text-white font-medium text-sm transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signin?view=signup"
              className="text-center w-full py-2.5 rounded bg-primary text-white font-bold text-sm hover:shadow-glow transition-all duration-300"
            >
              START FOR FREE
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
