"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Database, Shield, Cpu, RefreshCw, Trash2, 
  Play, Download, Upload, AlertOctagon, Terminal,
  Settings, Wifi, RefreshCcw, Eye, ShieldAlert,
  Server, HardDrive, ToggleLeft, ToggleRight, Radio,
  ArrowRight
} from "lucide-react";
import { mockDb } from "@/lib/supabase";

export default function DevConsole() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // 1. Credits & Account States
  const [credits, setCredits] = useState(0);
  const [inputCredits, setInputCredits] = useState(100);

  // 2. Toggles & Sliders States
  const [bypassSsrf, setBypassSsrf] = useState(false);
  const [simulateLatency, setSimulateLatency] = useState(0);
  const [rateLimitRpm, setRateLimitRpm] = useState(60);
  const [cfBypass, setCfBypass] = useState(true);
  const [rawLogging, setRawLogging] = useState(false);
  const [dbLag, setDbLag] = useState(0);
  const [errorVerbosity, setErrorVerbosity] = useState(true);

  // 3. Dropdowns
  const [apiKeyStatus, setApiKeyStatus] = useState("Active");
  const [geoProxy, setGeoProxy] = useState("SG - Singapore");

  // 4. Interactive textareas
  const [sandboxScript, setSandboxScript] = useState("// Tulis Javascript test injection di sini...\nconsole.log('Testing script injection sandbox...');");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[DEV] Developer console initialized successfully.",
    "[SYSTEM] Security role authenticated: DEVELOPER.",
    "[SYS] SSRF protection active on 127.0.0.1, localhost."
  ]);

  // 5. Canvas References for monitors
  const cpuCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const memCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Add a helper log function
  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    // Check developer authentication
    const userStr = localStorage.getItem("ls-user");
    if (!userStr) {
      router.push("/signin");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "developer") {
      router.push("/dashboard");
      return;
    }

    setMounted(true);
    setCredits(mockDb.getCredits());

    // Restore developer settings from localStorage if exist
    const savedBypass = localStorage.getItem("dev-bypass-ssrf") === "true";
    setBypassSsrf(savedBypass);
    const savedLatency = Number(localStorage.getItem("dev-latency") || "0");
    setSimulateLatency(savedLatency);
    const savedGeo = localStorage.getItem("dev-geo") || "SG - Singapore";
    setGeoProxy(savedGeo);

    addLog(`Developer authenticated: ${user.email}`);
  }, [router]);

  // 6. Draw CPU & Memory Graphs
  useEffect(() => {
    if (!mounted) return;

    // CPU Monitor animation
    const cpuCtx = cpuCanvasRef.current?.getContext("2d");
    let cpuHistory: number[] = Array(30).fill(15);
    
    // Memory Monitor animation
    const memCtx = memCanvasRef.current?.getContext("2d");
    let memHistory: number[] = Array(30).fill(40);

    const interval = setInterval(() => {
      // Generate realistic fluctuations
      const nextCpu = Math.max(5, Math.min(95, cpuHistory[cpuHistory.length - 1] + (Math.random() - 0.5) * 20));
      cpuHistory = [...cpuHistory.slice(1), nextCpu];

      const nextMem = Math.max(30, Math.min(85, memHistory[memHistory.length - 1] + (Math.random() - 0.5) * 8));
      memHistory = [...memHistory.slice(1), nextMem];

      // Draw CPU Graph
      if (cpuCtx && cpuCanvasRef.current) {
        const { width, height } = cpuCanvasRef.current;
        cpuCtx.clearRect(0, 0, width, height);
        cpuCtx.strokeStyle = "#C81E3A";
        cpuCtx.lineWidth = 1.5;
        cpuCtx.beginPath();
        cpuHistory.forEach((val, idx) => {
          const x = (idx / (cpuHistory.length - 1)) * width;
          const y = height - (val / 100) * height;
          if (idx === 0) cpuCtx.moveTo(x, y);
          else cpuCtx.lineTo(x, y);
        });
        cpuCtx.stroke();
      }

      // Draw Memory Graph
      if (memCtx && memCanvasRef.current) {
        const { width, height } = memCanvasRef.current;
        memCtx.clearRect(0, 0, width, height);
        memCtx.strokeStyle = "#D4AF37";
        memCtx.lineWidth = 1.5;
        memCtx.beginPath();
        memHistory.forEach((val, idx) => {
          const x = (idx / (memHistory.length - 1)) * width;
          const y = height - (val / 100) * height;
          if (idx === 0) memCtx.moveTo(x, y);
          else memCtx.lineTo(x, y);
        });
        memCtx.stroke();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) return null;

  // Feature Handlers:
  // 1. Reset Credits
  const handleResetCredits = () => {
    mockDb.setCredits(10);
    setCredits(10);
    window.dispatchEvent(new Event("storage"));
    addLog("SUCCESS: Credits reset to base level of 10.");
  };

  // 2. Add Credits
  const handleAddCredits = () => {
    const newCreds = Math.max(0, credits + inputCredits);
    mockDb.setCredits(newCreds);
    setCredits(newCreds);
    window.dispatchEvent(new Event("storage"));
    addLog(`SUCCESS: Added ${inputCredits} credits. New balance: ${newCreds} Cr.`);
  };

  // 3. Toggle Bypass SSRF
  const handleBypassSsrfToggle = (val: boolean) => {
    setBypassSsrf(val);
    localStorage.setItem("dev-bypass-ssrf", String(val));
    addLog(`CONFIG: SSRF Security protection bypassed: ${val}.`);
  };

  // 4. Set Latency
  const handleLatencyChange = (val: number) => {
    setSimulateLatency(val);
    localStorage.setItem("dev-latency", String(val));
    addLog(`LATENCY: Proxy latency set to ${val}ms.`);
  };

  // 5. Generate Mock History
  const handleGenerateMockHistory = () => {
    const mockEndpoints = ["/v1/scrape", "/v1/search", "/v1/crawl", "/v1/map"];
    const mockTargets = ["google.com", "github.com", "news.ycombinator.com", "medium.com/engineering"];
    const mockStatus = ["success", "success", "success", "error"];
    
    // Add 10 random entries
    for (let i = 0; i < 10; i++) {
      const randomIdx = Math.floor(Math.random() * 4);
      mockDb.addHistory(
        mockEndpoints[randomIdx],
        mockTargets[randomIdx],
        mockStatus[Math.floor(Math.random() * 4)],
        Math.floor(Math.random() * 5) + 1,
        `{"success":true,"scraped_length":${Math.floor(Math.random() * 20000) + 1000}}`
      );
    }
    
    // Dispatch storage event to notify other layout balances
    window.dispatchEvent(new Event("storage"));
    addLog("DATABASE: Generated 10 mock request history entries.");
  };

  // 6. Clear Local Storage
  const handleWipeAll = () => {
    localStorage.clear();
    addLog("SYSTEM: Local cache purged. Logging out...");
    setTimeout(() => {
      router.push("/signin");
    }, 1000);
  };

  // 7. Run Script Sandbox
  const handleRunSandbox = () => {
    addLog("SANDBOX: Executing test script injection...");
    try {
      // Safe simulation eval
      const result = new Function(sandboxScript)();
      addLog(`SANDBOX SUCCESS: Returns: ${result !== undefined ? result : "void"}`);
    } catch (e: any) {
      addLog(`SANDBOX EXCEPTION: ${e.message}`);
    }
  };

  // 8. Export Session State
  const handleExportState = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "leanscrape-session-state.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog("EXPORT: Downloaded current local session JSON state.");
  };

  // 9. Account Lock Simulation
  const handleLockAccount = () => {
    addLog("ALERT: Simulating Banned Account. Self-destruction imminent.");
    setTimeout(() => {
      localStorage.removeItem("ls-user");
      router.push("/signin?error=AccountBlockedByDevConsole");
    }, 1500);
  };

  // 10. Self-Destruct Simulation
  const handleSelfDestruct = () => {
    if (confirm("WARNING: Are you sure you want to execute SELF-DESTRUCT? This will reset all credits, clear API keys, wipe logs, and sign you out!")) {
      addLog("!!! CRITICAL SYSTEM SHUTDOWN INITIATED !!!");
      let count = 3;
      const countdown = setInterval(() => {
        if (count > 0) {
          addLog(`DESTRUCTION COUNTDOWN: ${count}...`);
          count--;
        } else {
          clearInterval(countdown);
          localStorage.clear();
          router.push("/");
        }
      }, 800);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6 rounded-lg relative overflow-hidden">
        <div className="corner-brackets" />
        <div className="absolute top-0 right-0 p-1 border-b border-l border-[#D4AF37]/30 bg-[#D4AF37]/10 font-mono text-[8px] text-[#D4AF37] tracking-widest">
          SECURITY LEVEL: MAXIMUM
        </div>
        
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              DEVELOPER CONTROL CONSOLE
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Cockpit pengontrol internal LeanianStudio. Modifikasi memori runtime, bypass sistem keamanan SSRF, atur latency simulasi, dan debug modul scraping.
            </p>
          </div>
        </div>

        <button 
          onClick={handleSelfDestruct}
          className="mt-4 md:mt-0 w-full md:w-auto px-4 py-2 border border-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all text-xs font-mono font-bold text-red-500 rounded flex items-center justify-center gap-1.5"
        >
          <AlertOctagon size={12} />
          <span>SELF-DESTRUCT</span>
        </button>
      </div>

      {/* Grid of Console Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Column 1: System Variables & Memory */}
        <div className="space-y-6">
          
          {/* Feature 1 & 2: Credits Manager */}
          <div className="border border-border bg-[#0B0A0E] rounded p-5 relative space-y-4">
            <div className="corner-brackets" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Database size={12} className="text-accent" /> // CREDITS OVERRIDE
            </h3>
            
            <div className="flex items-center justify-between border border-border bg-bg/50 px-3 py-2 rounded text-xs font-mono">
              <span className="text-text-muted">Current Balance:</span>
              <span className="font-bold text-white">{credits} Cr</span>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-gray-400">Add Custom Amount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputCredits}
                  onChange={(e) => setInputCredits(Number(e.target.value))}
                  className="flex-1 bg-bg border border-border rounded px-2.5 py-1 text-xs text-white font-mono"
                />
                <button
                  onClick={handleAddCredits}
                  className="px-3 py-1 bg-accent/20 hover:bg-accent text-accent hover:text-black transition-all rounded text-xs font-bold font-mono border border-accent/40"
                >
                  ADD
                </button>
              </div>
            </div>

            <button
              onClick={handleResetCredits}
              className="w-full py-1.5 border border-border hover:bg-white/5 transition-colors text-xs font-mono font-semibold rounded"
            >
              RESET TO BASE (10 Cr)
            </button>
          </div>

          {/* Monitors: Live Charts (Features 19 & 20) */}
          <div className="border border-border bg-[#0B0A0E] rounded p-5 relative space-y-4">
            <div className="corner-brackets" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Cpu size={12} className="text-primary" /> // RUNTIME MONITORS
            </h3>
            
            {/* CPU UTILIZATION */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>CPU UTILIZATION (MOCK)</span>
                <span className="text-primary font-bold">ACTIVE</span>
              </div>
              <div className="h-16 border border-border/40 bg-bg/40 rounded p-1">
                <canvas ref={cpuCanvasRef} className="w-full h-full" width="280" height="60" />
              </div>
            </div>

            {/* SYSTEM MEMORY */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>MEMORY POOL (MOCK)</span>
                <span className="text-accent font-bold">4.2GB / 8GB</span>
              </div>
              <div className="h-16 border border-border/40 bg-bg/40 rounded p-1">
                <canvas ref={memCanvasRef} className="w-full h-full" width="280" height="60" />
              </div>
            </div>
          </div>

          {/* Quick Actions (Features 7, 8, 15) */}
          <div className="border border-border bg-[#0B0A0E] rounded p-5 relative space-y-3 font-mono text-xs">
            <div className="corner-brackets" />
            <h3 className="text-[10px] font-bold text-accent uppercase tracking-wider">// HARDWARE UTILITIES</h3>
            
            <button
              onClick={handleExportState}
              className="w-full flex items-center justify-between px-3 py-2 border border-border bg-bg/20 hover:bg-white/5 rounded text-left"
            >
              <span>Export Session JSON</span>
              <Download size={12} />
            </button>

            <button
              onClick={handleGenerateMockHistory}
              className="w-full flex items-center justify-between px-3 py-2 border border-border bg-bg/20 hover:bg-white/5 rounded text-left"
            >
              <span>Inject Mock Logs</span>
              <RefreshCw size={12} />
            </button>

            <button
              onClick={handleWipeAll}
              className="w-full flex items-center justify-between px-3 py-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 rounded text-left text-red-400"
            >
              <span>Wipe Local Storage</span>
              <Trash2 size={12} />
            </button>
          </div>

        </div>

        {/* Column 2: Proxy, Geo, & Latency Controls */}
        <div className="space-y-6">
          
          {/* Feature 4: SSRF Security Bypass */}
          <div className="border border-border bg-[#0B0A0E] rounded p-5 relative space-y-4">
            <div className="corner-brackets" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Shield size={12} className="text-green-400" /> // SECURITY CONFIG
            </h3>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-gray-300">Bypass SSRF Validation:</span>
              <button 
                onClick={() => handleBypassSsrfToggle(!bypassSsrf)}
                className="focus:outline-none"
              >
                {bypassSsrf ? (
                  <ToggleRight size={28} className="text-red-500" />
                ) : (
                  <ToggleLeft size={28} className="text-green-500" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed">
              Memungkinkan scraping terhadap host internal seperti <code>localhost</code> atau <code>127.0.0.1</code> untuk keperluan pengetesan lokal.
            </p>
          </div>

          {/* Features 5, 9, 13: Latency & Rate Limit Sliders */}
          <div className="border border-border bg-[#0B0A0E] rounded p-5 relative space-y-4 font-mono text-xs">
            <div className="corner-brackets" />
            <h3 className="text-[10px] font-bold text-accent uppercase tracking-wider">// DYNAMIC LAG & LIMITS</h3>
            
            {/* Proxy Network Latency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span>Simulate Latency:</span>
                <span className="text-accent">{simulateLatency} ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="500"
                value={simulateLatency}
                onChange={(e) => handleLatencyChange(Number(e.target.value))}
                className="w-full accent-accent bg-bg-elevated h-1 rounded"
              />
            </div>

            {/* Database Sync Delay */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span>Database Delay:</span>
                <span className="text-primary">{dbLag} ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="100"
                value={dbLag}
                onChange={(e) => setDbLag(Number(e.target.value))}
                className="w-full accent-primary bg-bg-elevated h-1 rounded"
              />
            </div>

            {/* Requests Per Minute */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span>Rate Limiter RPM:</span>
                <span className="text-green-400">{rateLimitRpm} RPM</span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={rateLimitRpm}
                onChange={(e) => setRateLimitRpm(Number(e.target.value))}
                className="w-full accent-green-400 bg-bg-elevated h-1 rounded"
              />
            </div>
          </div>

          {/* Features 10, 11: Proxy Location & Cloudflare */}
          <div className="border border-border bg-[#0B0A0E] rounded p-5 relative space-y-4 font-mono text-xs">
            <div className="corner-brackets" />
            <h3 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">// PROXY SINKRONISASI</h3>

            <div className="space-y-2">
              <label className="block text-[10px] text-gray-400">Geo-Proxy Geolocation</label>
              <select
                value={geoProxy}
                onChange={(e) => {
                  setGeoProxy(e.target.value);
                  localStorage.setItem("dev-geo", e.target.value);
                  addLog(`PROXY: Geolocation proxy shifted to ${e.target.value}.`);
                }}
                className="w-full bg-bg border border-border rounded px-2 py-1.5 text-xs text-white"
              >
                <option>SG - Singapore</option>
                <option>US - North Virginia</option>
                <option>JP - Tokyo</option>
                <option>DE - Frankfurt</option>
                <option>UK - London</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span>Bypass Cloudflare WAF:</span>
              <button 
                onClick={() => {
                  setCfBypass(!cfBypass);
                  addLog(`CONFIG: Cloudflare bypass automation: ${!cfBypass}.`);
                }}
                className="focus:outline-none"
              >
                {cfBypass ? (
                  <ToggleRight size={24} className="text-accent" />
                ) : (
                  <ToggleLeft size={24} className="text-text-muted" />
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Column 3: Mock Settings & Script Injection */}
        <div className="space-y-6">
          
          {/* Features 3, 12, 18: API Key Status & Error Logs */}
          <div className="border border-border bg-[#0B0A0E] rounded p-5 relative space-y-4 font-mono text-xs">
            <div className="corner-brackets" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Server size={12} className="text-accent" /> // API EXHAUSTION TEST
            </h3>

            <div className="space-y-2">
              <label className="block text-[10px] text-gray-400">Simulate Key Response</label>
              <select
                value={apiKeyStatus}
                onChange={(e) => {
                  setApiKeyStatus(e.target.value);
                  addLog(`MOCK: Global Firecrawl key status mocked as: ${e.target.value}.`);
                }}
                className="w-full bg-bg border border-border rounded px-2 py-1.5 text-xs text-white"
              >
                <option>Active</option>
                <option>Rate Limited (429)</option>
                <option>Expired (401)</option>
                <option>Key Revoked (403)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span>Console Raw Logging:</span>
              <button 
                onClick={() => setRawLogging(!rawLogging)}
                className="focus:outline-none"
              >
                {rawLogging ? (
                  <ToggleRight size={24} className="text-accent" />
                ) : (
                  <ToggleLeft size={24} className="text-text-muted" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span>Stack Trace Error Verbosity:</span>
              <button 
                onClick={() => setErrorVerbosity(!errorVerbosity)}
                className="focus:outline-none"
              >
                {errorVerbosity ? (
                  <ToggleRight size={24} className="text-accent" />
                ) : (
                  <ToggleLeft size={24} className="text-text-muted" />
                )}
              </button>
            </div>
          </div>

          {/* Features 14 & 16: Sandbox Code Execution */}
          <div className="border border-border bg-[#0B0A0E] rounded p-5 relative space-y-4">
            <div className="corner-brackets" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Terminal size={12} className="text-primary" /> // JS SANDBOX EXECUTION
            </h3>
            
            <textarea
              rows={3}
              value={sandboxScript}
              onChange={(e) => setSandboxScript(e.target.value)}
              className="w-full text-[10px] font-mono bg-bg border border-border rounded p-2 text-white focus:outline-none focus:border-primary leading-normal"
            />

            <button
              onClick={handleRunSandbox}
              className="w-full py-1.5 bg-primary hover:shadow-glow text-white font-bold transition-all text-xs font-mono rounded flex items-center justify-center gap-1.5"
            >
              <Play size={10} fill="currentColor" />
              <span>RUN SANDBOX TESTING</span>
            </button>
          </div>

          {/* Banned Simulation Testing (Feature 16) */}
          <div className="border border-red-500/20 bg-red-500/5 rounded p-5 relative space-y-4">
            <div className="corner-brackets" />
            <h3 className="text-xs font-bold text-red-400 uppercase font-mono tracking-wider flex items-center gap-2">
              <ShieldAlert size={12} className="text-red-400" /> // ACCOUNT SECURITY LOCK
            </h3>

            <p className="text-[10px] text-gray-400 leading-normal font-mono">
              Simulasikan deteksi pelanggaran hak akses API. Sistem akan mematikan session di localStorage dan mengunci dasbor.
            </p>

            <button
              onClick={handleLockAccount}
              className="w-full py-1.5 border border-red-500/40 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all text-xs font-mono font-bold text-red-400 rounded"
            >
              SIMULATE ACCOUNT LOCK (BAN)
            </button>
          </div>

        </div>

      </div>

      {/* Terminal Output Logs (Feature 18) */}
      <div className="border border-border bg-[#070609] rounded-lg overflow-hidden flex flex-col h-[200px]">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-bg-elevated/40">
          <div className="text-[10px] text-text-muted font-mono flex items-center gap-1.5">
            <Radio size={12} className="text-red-500 animate-pulse" />
            <span>DEVELOPER_SYSTEM_CONSOLE_LOGS</span>
          </div>
          <button 
            onClick={() => setConsoleLogs([`[DEV] Log wiped at ${new Date().toLocaleTimeString()}`])}
            className="text-[9px] font-mono text-[#D4AF37] hover:underline focus:outline-none"
          >
            CLEAR LOGS
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] text-emerald-400 space-y-1.5 select-text text-left bg-black">
          {consoleLogs.map((log, idx) => (
            <div key={idx} className="whitespace-pre-wrap leading-normal font-mono">
              {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
