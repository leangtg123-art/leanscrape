"use client";

import React, { useEffect, useState } from "react";
import { FileText, Hourglass, Database, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  "Navigate", "Click", "Type", "Wait", "Scroll", "Press", "Screenshot", "Scrape"
];

export default function ZeroConfigSection() {
  const [activeActionIdx, setActiveActionIdx] = useState(0);
  const [parseProgress, setParseProgress] = useState(0);
  const [requestPulse, setRequestPulse] = useState(false);

  // 1. Loop highlight active action chip
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveActionIdx((prev) => (prev + 1) % ACTIONS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // 2. Loop progress bar docs to data
  useEffect(() => {
    const interval = setInterval(() => {
      setParseProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // 3. Request Pulse dot loop
  useEffect(() => {
    const interval = setInterval(() => {
      setRequestPulse((prev) => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-bg relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16 text-left">
          <div className="inline-block px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-xs font-mono rounded mb-4">
            04 / 06 · ZERO CONFIGURATION
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-sans text-white mb-4">
            Powerful developer utilities
          </h2>
          <p className="text-gray-400 font-sans max-w-xl">
            No complex browser setup required. We provide all the scraping utilities you need out-of-the-box.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: Docs to Data (Parsing) */}
          <div className="relative p-8 rounded-lg border border-border bg-bg-elevated/20 flex flex-col justify-between min-h-[220px]">
            <div className="corner-brackets" />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-primary" />
                <h3 className="text-lg font-bold text-white font-sans">Docs to data</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Automatically parse dynamic documents including PDF, DOCX, XLSX, XML, and complex HTML.
              </p>
            </div>
            
            {/* Visual parsing bar */}
            <div className="border border-border/30 bg-bg/50 p-4 rounded font-mono text-[10px] space-y-2">
              <div className="flex justify-between text-text-muted">
                <span>PARSING: quarterly_report.pdf</span>
                <span>{parseProgress}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-150 ease-out" 
                  style={{ width: `${parseProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Smart Wait */}
          <div className="relative p-8 rounded-lg border border-border bg-bg-elevated/20 flex flex-col justify-between min-h-[220px]">
            <div className="corner-brackets" />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Hourglass size={16} className="text-accent" />
                <h3 className="text-lg font-bold text-white font-sans">Smart wait</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Automatically wait for client-side scripts, SPA hydration, and async data fetches before extracting content.
              </p>
            </div>

            {/* Visual loading state */}
            <div className="border border-border/30 bg-bg/50 p-4 rounded font-mono text-[10px] flex items-center justify-between">
              <span className="text-text-muted">SPA_LOADING_DETECTOR</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  requestPulse ? "bg-accent scale-110 shadow-glow" : "bg-accent/40"
                )} />
                <span className="text-white">Waiting hydration...</span>
              </div>
            </div>
          </div>

          {/* Card 3: Live Web Data Diagram */}
          <div className="relative p-8 rounded-lg border border-border bg-bg-elevated/20 flex flex-col justify-between min-h-[220px]">
            <div className="corner-brackets" />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database size={16} className="text-green-400" />
                <h3 className="text-lg font-bold text-white font-sans">Live web data (index & cache)</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Efficient internal caching system to accelerate repeat requests without scraping the target website again.
              </p>
            </div>

            {/* SVG Diagram with path animations */}
            <div className="border border-border/30 bg-bg/50 p-4 rounded flex items-center justify-around font-mono text-[9px] text-gray-300 relative h-16">
              <div className="flex flex-col items-center">
                <span>User</span>
                <span className="text-primary text-[11px] font-bold">●</span>
              </div>
              
              {/* Connector line with dash animation */}
              <div className="flex-1 px-4">
                <svg className="w-full h-2 overflow-visible" stroke="currentColor">
                  <line 
                    x1="0%" y1="50%" x2="100%" y2="50%" 
                    className="stroke-accent stroke-1 stroke-dasharray-[4,4] animate-[scanline-sweep_3s_linear_infinite]"
                  />
                </svg>
              </div>

              <div className="flex flex-col items-center border border-accent/30 bg-accent/5 px-2 py-1 rounded">
                <span>LEANCACHE</span>
                <span className="text-accent">HIT (0.01ms)</span>
              </div>

              <div className="flex-1 px-4">
                <svg className="w-full h-2 overflow-visible" stroke="currentColor">
                  <line 
                    x1="0%" y1="50%" x2="100%" y2="50%" 
                    className="stroke-gray-600 stroke-1"
                  />
                </svg>
              </div>

              <div className="flex flex-col items-center">
                <span>Target Web</span>
                <span className="text-gray-500 text-[11px] font-bold">●</span>
              </div>
            </div>
          </div>

          {/* Card 4: Interact with Pages (Actions) */}
          <div className="relative p-8 rounded-lg border border-border bg-bg-elevated/20 flex flex-col justify-between min-h-[220px]">
            <div className="corner-brackets" />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Settings size={16} className="text-purple-400" />
                <h3 className="text-lg font-bold text-white font-sans">Interact with pages (Actions)</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Perform browser interactions on target pages. Click buttons, fill forms, navigate, scroll, press keys, and retrieve the output.
              </p>
            </div>

            {/* Highlighted chips */}
            <div className="flex flex-wrap gap-1.5 font-mono text-[9px]">
              {ACTIONS.map((action, idx) => (
                <span
                  key={action}
                  className={cn(
                    "px-2 py-1 rounded border transition-all duration-300",
                    activeActionIdx === idx
                      ? "border-primary bg-primary/20 text-white font-bold scale-105"
                      : "border-border/30 bg-bg/30 text-text-muted"
                  )}
                >
                  {action}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
