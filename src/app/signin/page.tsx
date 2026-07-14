"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, GitBranch, Mail, Lock, Globe, ArrowRight, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function Signin() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("lean@leanian.studio");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  // Detect GitHub OAuth callback
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        setLoading(true);
        fetch("/api/auth/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            localStorage.setItem("ls-user", JSON.stringify(data.user));
            router.push("/playground");
          } else {
            alert(data.error || "GitHub Authentication failed");
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulasi login sukses
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("ls-user", JSON.stringify({ email }));
      }
      setLoading(false);
      router.push("/playground"); // Redirect directly to playground
    }, 1000);
  };

  const handleGithubLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    
    if (clientId) {
      const redirectUri = window.location.origin + "/signin";
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user&redirect_uri=${encodeURIComponent(redirectUri)}`;
    } else {
      setLoading(true);
      // Simulasi GitHub OAuth sukses jika Client ID tidak diset
      setTimeout(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("ls-user", JSON.stringify({ 
            email: "leangtg123-art@github.com",
            name: "leangtg123-art",
            provider: "github",
            avatar: "https://avatars.githubusercontent.com/u/237972227?v=4"
          }));
        }
        setLoading(false);
        router.push("/playground");
      }, 1000);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="scanline opacity-10 pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
      
      {/* Glow behind container */}
      <div className="absolute w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Card Wrapper */}
      <div className="relative max-w-md w-full rounded-lg border border-border bg-[#0B0A0E] overflow-hidden shadow-2xl p-8">
        {/* Corner Decor */}
        <div className="corner-brackets" />

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group font-mono mb-6">
            <div className="w-7 h-7 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary fill-none stroke-current stroke-2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-wider text-white">LEANSCRAPE</span>
          </Link>
          <h2 className="text-xl font-bold text-white mb-2">
            {isSignUp ? "Create your account" : "Sign in to system"}
          </h2>
          <p className="text-xs text-text-muted">
            Calibrate visual playground frequency. Enter credentials below.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-sm">
          
          <div className="space-y-2">
            <label className="block text-gray-400">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-elevated/40 border border-border rounded pl-9 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                placeholder="developer@leanscrape.dev"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-400">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-elevated/40 border border-border rounded pl-9 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-primary hover:shadow-glow text-white font-bold transition-all flex items-center justify-center gap-1.5 focus:outline-none"
          >
            {loading ? (
              <span className="animate-pulse">DECODING_AUTH...</span>
            ) : (
              <>
                <span>{isSignUp ? "INITIALIZE SIGN UP" : "EXECUTE SIGN IN"}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center font-mono text-[9px] text-text-muted">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40"></div></div>
          <span className="relative bg-[#0B0A0E] px-2">OR RUN OAUTH</span>
        </div>

        {/* Social Buttons */}
        <div className="font-mono text-[10px]">
          <button 
            onClick={handleGithubLogin}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded border border-border bg-bg-elevated/40 hover:bg-white/5 transition-colors text-white"
          >
            <GitBranch size={12} />
            <span>GITHUB OAUTH</span>
          </button>
        </div>

        {/* Switch mode */}
        <div className="text-center mt-6 text-xs font-sans text-gray-400">
          {isSignUp ? "Already have an account? " : "New to LeanScrape? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-bold hover:underline font-mono text-xs"
          >
            {isSignUp ? "SIGN_IN" : "CREATE_ACCOUNT"}
          </button>
        </div>

      </div>
    </main>
  );
}
