"use client";

import React, { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AnnounceBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("ls-announce-dismissed");
    if (!isDismissed) {
      // Tunggu sebentar untuk efek slide-down
      setTimeout(() => {
        setIsVisible(true);
      }, 300);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("ls-announce-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="relative w-full bg-accent text-bg px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 select-none z-50 animate-scanline-sweep overflow-hidden">
      {/* Decorative dots */}
      <span className="hidden sm:inline font-mono">[ NEW ]</span>
      <span>LeanScrape v1.0.0 is officially released by LeanianStudio.</span>
      <Link 
        href="/docs" 
        className="underline hover:text-black inline-flex items-center gap-1.5 transition-colors"
      >
        Read Documentation <ArrowRight size={12} />
      </Link>
      <button 
        onClick={handleDismiss} 
        className="absolute right-4 hover:bg-black/10 p-0.5 rounded transition-colors"
        title="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
