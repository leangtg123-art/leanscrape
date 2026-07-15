"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, KeyRound, BarChart3, History, 
  Database, LogOut, Terminal, Menu, X, ArrowLeft, Send, Phone, Search 
} from "lucide-react";
import { mockDb } from "@/lib/supabase";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [credits, setCredits] = useState(1000);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("developer@leanscrape.dev");
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    // Cek sign-in status
    const user = localStorage.getItem("ls-user");
    if (!user) {
      router.push("/signin");
      return;
    }
    const parsed = JSON.parse(user);
    setUserEmail(parsed.email);
    setUserRole(parsed.role || "user");
    setCredits(mockDb.getCredits());

    // Listener untuk sinkronisasi kredit saat runtime
    const handleStorageChange = () => {
      setCredits(mockDb.getCredits());
      
      // Update role jika user diganti di tab lain
      const u = localStorage.getItem("ls-user");
      if (u) {
        const p = JSON.parse(u);
        setUserRole(p.role || "user");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000); // Polling internal gratis

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("ls-user");
    router.push("/signin");
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Telegram Scraper", href: "/dashboard/telegram", icon: Send },
    { name: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
    { name: "Usage Credits", href: "/dashboard/usage", icon: BarChart3 },
    { name: "Request History", href: "/dashboard/history", icon: History },
  ];

  if (userRole === "developer") {
    navItems.push({ name: "Dev Console", href: "/dashboard/developer", icon: Terminal });
  }

  return (
    <div className="min-h-screen bg-bg text-white font-sans flex flex-col md:flex-row">
      <div className="scanline opacity-10 pointer-events-none" />

      {/* 1. Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col justify-between border-r border-border bg-[#0B0A0E] p-6 shrink-0 relative">
        <div className="corner-brackets-top-right" />
        
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group font-mono">
            <div className="w-6 h-6 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-primary fill-none stroke-current stroke-2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-wider text-white">LEANSCRAPE</span>
          </Link>

          {/* User Info & Credits */}
          <div className="border border-border/40 bg-bg/50 p-4 rounded font-mono text-[10px]">
            <div className="text-text-muted truncate mb-2" title={userEmail}>
              {userEmail}
            </div>
            <div className="flex items-center justify-between border-t border-border/20 pt-2 text-white">
              <span className="flex items-center gap-1"><Database size={10} className="text-accent" /> Balance:</span>
              <span className="font-bold">{credits} Cr</span>
            </div>
          </div>

          {/* Menu Navigasi */}
          <nav className="flex flex-col gap-1 font-mono text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded transition-all",
                    isActive
                      ? "bg-primary/10 border border-primary/20 text-white font-bold"
                      : "border border-transparent text-text-muted hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={14} className={isActive ? "text-primary" : "text-text-muted"} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4 font-mono text-xs border-t border-border/40 pt-4">
          <Link 
            href="/playground" 
            className="flex items-center gap-3 px-3 py-2 border border-border bg-bg-elevated hover:bg-white/5 text-white rounded transition-colors text-center justify-center font-bold"
          >
            <Terminal size={12} className="text-primary" />
            <span>PLAYGROUND</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-text-muted hover:text-red-400 hover:bg-red-500/5 rounded transition-all focus:outline-none"
          >
            <LogOut size={14} />
            <span>SIGN OUT</span>
          </button>
        </div>
      </aside>

      {/* 2. Top Navigation - Mobile */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-border bg-[#0B0A0E] z-30">
        <Link href="/" className="flex items-center gap-2 font-mono">
          <span className="text-xs font-bold tracking-wider text-white">LEANSCRAPE</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-gray-400 hover:text-white focus:outline-none"
            title="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0A0E] border-b border-border absolute top-[57px] left-0 w-full p-6 flex flex-col gap-4 z-20 font-mono text-xs">
          <div className="text-[10px] text-text-muted pb-2 border-b border-border/40 truncate">{userEmail}</div>
          <div className="flex items-center justify-between text-white font-bold pb-2 border-b border-border/40">
            <span className="flex items-center gap-1"><Database size={12} className="text-accent" /> CREDITS:</span>
            <span>{credits} Cr</span>
          </div>

          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "py-2.5 px-3 rounded",
                  pathname === item.href ? "bg-primary/10 text-white font-bold" : "text-gray-300"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <hr className="border-border/40" />

          <Link 
            href="/playground" 
            className="text-center py-2 bg-primary text-white rounded font-bold"
            onClick={() => setMobileMenuOpen(false)}
          >
            PLAYGROUND
          </Link>

          <button
            onClick={handleSignOut}
            className="text-center py-2 border border-border text-red-400 hover:bg-red-500/5 rounded font-bold"
          >
            SIGN OUT
          </button>
        </div>
      )}

      {/* 3. Main Content Wrapper */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-[calc(100vh-57px)] md:max-h-screen">
        {children}
      </main>
    </div>
  );
}
