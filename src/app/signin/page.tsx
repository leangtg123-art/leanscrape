"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Cryptographic SHA-256 helper for client-side password hashing
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export default function Signin() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Check error parameter from Dev Console locking simulation
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "AccountBlockedByDevConsole") {
        setErrorMsg("SECURITY ALERT: Session terminated by Developer Lock Command.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const emailHash = await sha256(email.trim().toLowerCase());
      const passwordHash = await sha256(password);

      // Secure cryptographic comparison on GitHub - no raw passwords/emails in code!
      const isAdmin = emailHash === "86365791cbb8369db7be1992861821c68722002c869706f86c42b7293b1d059f" && passwordHash === "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
      const isDev = emailHash === "be82af293223cf6cf7f1ac81d4afce7327e0993577e6dcdd87e7190d41c358f7" && passwordHash === "65f52262a252a73e0f9005322bff7eaa69ce13835c517297284d44389626948c";

      setTimeout(() => {
        if (isSignUp) {
          // Simulation sign up mode
          if (isAdmin || isDev) {
            setLoading(false);
            setErrorMsg("SECURITY RESTRICTION: Cannot register developer accounts.");
            return;
          }
          if (password.length < 6) {
            setLoading(false);
            setErrorMsg("REGISTRATION ERROR: Password must be at least 6 characters.");
            return;
          }
          
          if (typeof window !== "undefined") {
            localStorage.setItem("ls-credits", "10");
          }
          setSuccessMsg("ACCOUNT PROVISIONED! Switching to Sign In...");
          setIsSignUp(false);
          setLoading(false);
        } else {
          // Sign in mode
          if (isAdmin || isDev) {
            if (typeof window !== "undefined") {
              localStorage.setItem("ls-user", JSON.stringify({ 
                email: isAdmin ? "admin@leanscrape.dev" : "dev@leanscrape.dev", 
                role: "developer",
                name: "LeanScrape Admin",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop"
              }));
            }
            setLoading(false);
            router.push("/dashboard/developer"); // Devs go directly to Developer Console!
          } else {
            // Normal user authentication
            if (password.length >= 6) {
              if (typeof window !== "undefined") {
                localStorage.setItem("ls-user", JSON.stringify({ 
                  email, 
                  role: "user",
                  name: email.split("@")[0]
                }));
                localStorage.setItem("ls-credits", "10"); // Force credits to 10 for normal user!
              }
              setLoading(false);
              router.push("/playground");
            } else {
              setLoading(false);
              setErrorMsg("ACCESS DENIED: Password is too short.");
            }
          }
        }
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(`SYSTEM ERROR: ${err.message}`);
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
        <div className="text-center mb-8 flex flex-col items-center">
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

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded border border-red-500/20 bg-red-500/5 text-red-400 font-mono text-[10px] flex items-start gap-2 text-left leading-relaxed">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded border border-green-500/20 bg-green-500/5 text-green-400 font-mono text-[10px] flex items-start gap-2 text-left leading-relaxed">
            <ShieldCheck size={14} className="shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-sm">
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-xs">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3.5 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-elevated/40 border border-border rounded pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary font-mono"
                placeholder="username@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-400 text-xs">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3.5 text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-elevated/40 border border-border rounded pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-primary hover:shadow-glow text-white font-bold transition-all flex items-center justify-center gap-1.5 focus:outline-none text-xs"
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

        {/* Switch mode */}
        <div className="text-center mt-6 text-xs font-sans text-gray-400">
          {isSignUp ? "Already have an account? " : "New to LeanScrape? "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
              setSuccessMsg("");
              setEmail("");
              setPassword("");
            }}
            className="text-primary font-bold hover:underline font-mono text-xs ml-1"
          >
            {isSignUp ? "SIGN_IN" : "CREATE_ACCOUNT"}
          </button>
        </div>

      </div>
    </main>
  );
}
