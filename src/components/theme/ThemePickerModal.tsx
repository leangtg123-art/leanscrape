"use client";

import React, { useState } from "react";
import { Sparkles, Terminal } from "lucide-react";

interface ThemeOption {
  id: string;
  name: string;
  primary: string;
  accent: string;
  bg: string;
  bgElevated: string;
  character: string;
}

const THEMES: ThemeOption[] = [
  {
    id: "crimson-core",
    name: "Crimson Core",
    primary: "#C81E3A",
    accent: "#D4AF37",
    bg: "#0A0A0C",
    bgElevated: "#141417",
    character: "Wuxia, Elegant & Deep",
  },
  {
    id: "blaze-orange",
    name: "Blaze Orange",
    primary: "#FF6A1A",
    accent: "#FFB347",
    bg: "#0D0B08",
    bgElevated: "#17130F",
    character: "Industrial, Active & Energetic",
  },
  {
    id: "verdant-mint",
    name: "Verdant Mint",
    primary: "#4ADE80",
    accent: "#A7F3D0",
    bg: "#07100C",
    bgElevated: "#0F1A15",
    character: "Cyber Matrix, Calm & Futuristic",
  },
  {
    id: "neon-rose",
    name: "Neon Rose",
    primary: "#FF2E88",
    accent: "#FFA6D2",
    bg: "#120810",
    bgElevated: "#1D101C",
    character: "Neon Cyberpunk, Playful & Vibrant",
  },
  {
    id: "pure-red",
    name: "Pure Red",
    primary: "#E11D2E",
    accent: "#FF7A7A",
    bg: "#0B0505",
    bgElevated: "#150C0C",
    character: "Alert Tech, Aggressive & Precision",
  },
];

export default function ThemePickerModal({ onSelect }: { onSelect: (themeId: string) => void }) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-md transition-all duration-500"
      style={{
        backgroundColor: hoveredTheme 
          ? `${THEMES.find(t => t.id === hoveredTheme)?.bg}ee` 
          : "rgba(10, 10, 12, 0.95)"
      }}
    >
      {/* Scanline inside modal */}
      <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />

      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      {/* Terminal decorative header */}
      <div className="relative max-w-4xl w-full text-center mb-8 z-10">
        <div className="inline-flex items-center gap-2 border border-accent/20 bg-bg-elevated px-3 py-1 rounded text-xs text-accent font-mono mb-4 animate-float-slow">
          <Terminal size={14} className="animate-pulse" />
          <span>SYSTEM_INIT: CHOOSE_INTERFACE_FREQUENCY</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-sans mb-3 text-white">
          Initialize <span className="text-primary font-extrabold" style={{ color: hoveredTheme ? THEMES.find(t => t.id === hoveredTheme)?.primary : "#C81E3A" }}>LeanScrape</span>
        </h1>
        <p className="text-sm md:text-base text-gray-400 font-sans max-w-xl mx-auto">
          Welcome to LeanianStudio's scraping system. Select a core visual frequency to calibrate your developer playground.
        </p>
      </div>

      {/* Theme Cards Grid */}
      <div className="relative max-w-4xl w-full grid grid-cols-1 md:grid-cols-5 gap-4 z-10">
        {THEMES.map((t) => {
          const isHovered = hoveredTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              onMouseEnter={() => setHoveredTheme(t.id)}
              onMouseLeave={() => setHoveredTheme(null)}
              className="relative text-left flex flex-col justify-between p-5 rounded-lg border bg-opacity-40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none"
              style={{
                backgroundColor: isHovered ? t.bgElevated : "rgba(20, 20, 23, 0.6)",
                borderColor: isHovered ? t.primary : "rgba(255, 255, 255, 0.08)",
                boxShadow: isHovered ? `0 0 25px ${t.primary}44` : "none",
              }}
            >
              {/* Corner brackets */}
              <div className="corner-brackets" style={{ "--lc-accent": t.accent } as React.CSSProperties} />
              
              <div>
                {/* Visual Palette Preview */}
                <div className="flex gap-1.5 mb-6">
                  <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: t.primary }} />
                  <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: t.accent }} />
                  <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: t.bg }} />
                </div>
                
                <h3 className="text-lg font-bold font-sans text-white mb-1">
                  {t.name}
                </h3>
                <p className="text-[10px] font-mono opacity-60 mb-8" style={{ color: t.primary }}>
                  {t.id.toUpperCase()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-sans italic border-t border-white/5 pt-3">
                  {t.character}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <div className="relative mt-8 z-10 text-xs text-gray-500 font-mono flex items-center gap-1.5">
        <Sparkles size={12} className="text-accent" style={{ color: hoveredTheme ? THEMES.find(t => t.id === hoveredTheme)?.accent : "#D4AF37" }} />
        <span>Theme can be changed dynamically anytime from the navbar.</span>
      </div>
    </div>
  );
}
