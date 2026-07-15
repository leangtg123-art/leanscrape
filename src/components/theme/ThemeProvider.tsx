"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import ThemePickerModal from "./ThemePickerModal";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, showPicker, setShowPicker } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    // Baca theme dari localStorage saat mount
    const savedTheme = localStorage.getItem("leanscrape-theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Jika first visit, set default theme dan tampilkan modal picker
      document.documentElement.setAttribute("data-theme", "crimson-core");
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

  // KRITIS: Jangan blokir render children saat SSR/belum mount!
  // Cukup render children langsung, hidupkan layer tema setelah mount
  return (
    <>
      {/* Efek transisi visual - hanya aktif setelah mount */}
      {mounted && transitioning && (
        <>
          <div className="theme-flash-active" />
          <div className="theme-sweep-active" />
        </>
      )}

      {children}

      {/* Modal Picker saat kunjungan pertama - hanya tampil setelah mount */}
      {mounted && showPicker && (
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
