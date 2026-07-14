"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { useAppStore } from "@/lib/store";

const THEMES = [
  { id: "crimson-core", name: "Crimson Core", color: "#C81E3A" },
  { id: "blaze-orange", name: "Blaze Orange", color: "#FF6A1A" },
  { id: "verdant-mint", name: "Verdant Mint", color: "#4ADE80" },
  { id: "neon-rose", name: "Neon Rose", color: "#FF2E88" },
  { id: "pure-red", name: "Pure Red", color: "#E11D2E" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeTheme = (newTheme: string) => {
    if (newTheme === theme) return;

    // Tambahkan class transisi visual ke body/document
    const flash = document.createElement("div");
    flash.className = "theme-flash-active";
    const sweep = document.createElement("div");
    sweep.className = "theme-sweep-active";
    
    document.body.appendChild(flash);
    document.body.appendChild(sweep);

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("leanscrape-theme", newTheme);
    setTheme(newTheme);

    setTimeout(() => {
      flash.remove();
      sweep.remove();
    }, 600);

    setIsOpen(false);
  };

  return (
    <div className="relative font-mono" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-md border border-border bg-bg-elevated hover:bg-primary/10 transition-colors text-white focus:outline-none"
        title="Switch Visual Theme"
      >
        <Palette size={16} className="text-primary animate-pulse-glow" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-bg-elevated border border-border shadow-lg py-1 z-[999] overflow-hidden">
          {/* Card corners */}
          <div className="corner-brackets-top-right" />
          <div className="corner-brackets-bottom-left" />
          
          <div className="px-3 py-1.5 text-[10px] text-text-muted border-b border-border font-bold">
            SELECT FREQUENCY
          </div>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-primary/10 transition-colors text-white"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                <span>{t.name}</span>
              </div>
              {theme === t.id && <Check size={12} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
