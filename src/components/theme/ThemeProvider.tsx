"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import ThemePickerModal from "./ThemePickerModal";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, showPicker, setShowPicker } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    // 1. Baca theme dari localStorage saat mount
    const savedTheme = localStorage.getItem("leanscrape-theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Jika first visit, tampilkan modal picker
      setShowPicker(true);
    }
    setMounted(true);
  }, [setTheme, setShowPicker]);

  // Efek transisi saat ganti tema
  const changeThemeWithTransition = (newTheme: string) => {
    if (newTheme === theme) return;

    setTransitioning(true);
    
    // Terapkan ke HTML
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("leanscrape-theme", newTheme);
    setTheme(newTheme);

    // Durasi animasi transisi sweep & flash selesai
    setTimeout(() => {
      setTransitioning(false);
    }, 600);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#0A0A0C]" />;
  }

  return (
    <>
      {/* Efek transisi visual */}
      {transitioning && (
        <>
          <div className="theme-flash-active" />
          <div className="theme-sweep-active" />
        </>
      )}
      
      {children}
      
      {/* Modal Picker saat kunjungan pertama */}
      {showPicker && (
        <ThemePickerModal 
          onSelect={(selected) => {
            changeThemeWithTransition(selected);
            setShowPicker(false);
          }} 
        />
      )}
    </>
  );
}
