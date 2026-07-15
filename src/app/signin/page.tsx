"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, ShieldCheck, Terminal, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Signin() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Developer credentials visibility protection
  const [showDevKeys, setShowDevKeys] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    // Cek parameter error dari Dev Console locking simulation
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "AccountBlockedByDevConsole") {
        setErrorMsg("SECURITY ALERT: Session terminated by Developer Lock Command.");
      }
      // If dev=true is supplied in URL query, automatically show keys
      if (params.get("dev") === "true") {
        setShowDevKeys(true);
      }
    }

    // Keyboard shortcut Ctrl + Alt + D to reveal developer sandbox credentials
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "d") {
        setShowDevKeys((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setShowDevKeys((curr) => !curr);
        return 0;
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const isDevEmail = email === "admin@leanscrape.dev" || email === "dev@leanscrape.dev";

    setTimeout(() => {
      if (isSignUp) {
        // Mode registrasi simulasi
        if (isDevEmail) {
          setLoading(false);
          setErrorMsg("SECURITY RESTRICTION: Cannot register developer accounts from standard panel.");
          return;
        }
        if (password.length < 6) {
          setLoading(false);
          setErrorMsg("REGISTRATION ERROR: Password must be at least 6 characters.");
          return;
        }
        
        if (typeof window !== "undefined") {
          localStorage.setItem("ls-credits", "10"); // Force credits to 10 for new user!
        }
        setSuccessMsg("ACCOUNT PROVISIONED! Switching to Sign In...");
        setIsSignUp(false);
        setLoading(false);
      } else {
        // Mode login
        if (isDevEmail) {
          if (password === "admin" || password === "devadmin123") {
            if (typeof window !== "undefined") {
              localStorage.setItem("ls-user", JSON.stringify({ 
                email, 
                role: "developer",
                name: "LeanScrape Admin",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop"
              }));
            }
            setLoading(false);
            router.push("/dashboard/developer"); // Devs go directly to Developer Console!
          } else {
            setLoading(false);
            setErrorMsg("ACCESS DENIED: Invalid developer decryption keys.");
          }
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
          <div onClick={handleLogoClick} className="inline-flex items-center gap-2 group font-mono mb-6 cursor-pointer select-none">
            <div className="w-7 h-7 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary fill-none stroke-current stroke-2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-wider text-white">LEANSCRAPE</span>
          </div>
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
                placeholder="developer@leanscrape.dev"
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

        {/* Developer accounts info box */}
        {showDevKeys && (
          <div className="mt-6 border border-border/30 bg-bg-elevated/20 p-4 rounded text-left font-mono text-[9px] text-text-muted leading-relaxed">
            <div className="flex items-center gap-1.5 text-accent font-bold mb-1.5 uppercase tracking-wider">
              <Terminal size={10} />
              <span>Developer Sandbox Keys:</span>
            </div>
            <p>• Email: <span className="text-white select-all">admin@leanscrape.dev</span></p>
            <p>• Password: <span className="text-white select-all">admin</span></p>
            <p className="mt-1.5 text-gray-500">
              Gunakan kredensial di atas untuk memicu mode Admin Developer Console dan mengakses 20+ panel kontrol internal.
            </p>
          </div>
        )}

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
