"use client";

import React, { useState, useEffect } from "react";
import { 
  Play, RotateCw, Download, Eye, Layers, ShieldAlert, Cpu, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";

// API Endpoint configuration for Vercel deploys
const API_BASE_URL = process.env.NEXT_PUBLIC_CLONER_API_URL || "http://localhost:8080";

export default function ClonePage() {
  const [url, setUrl] = useState("https://example.com");
  const [depth, setDepth] = useState(2);
  const [forceTool, setForceTool] = useState("auto");
  
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("idle"); // idle, running, success, error
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Polling status
  useEffect(() => {
    if (!activeJobId || status !== "running") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/status/${activeJobId}`);
        if (res.ok) {
          const data = await res.json();
          setProgressPercent(data.progress_percent);
          setCurrentStage(data.current_stage);

          if (data.status === "completed") {
            clearInterval(interval);
            // Fetch result details
            const resultRes = await fetch(`${API_BASE_URL}/result/${activeJobId}`);
            if (resultRes.ok) {
              const resultData = await resultRes.json();
              setResult(resultData);
              setStatus("success");
            }
          } else if (data.status === "failed") {
            clearInterval(interval);
            setStatus("error");
            setErrorMsg("Kloning gagal karena error internal di decant engine.");
          }
        }
      } catch (e) {
        console.error("Gagal melakukan polling status:", e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJobId, status]);

  const handleStartClone = async () => {
    if (!url.trim()) return;

    setStatus("running");
    setProgressPercent(5);
    setCurrentStage("menginisialisasi...");
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          options: {
            depth,
            force_tool: forceTool,
            include_assets: true
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setActiveJobId(data.project_id);
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message || `Gagal terhubung ke Clone API Server di ${API_BASE_URL}. Pastikan server backend berjalan.`);
    }
  };

  const handleDownload = () => {
    if (!activeJobId) return;
    window.open(`${API_BASE_URL}/download/${activeJobId}`);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-wider text-white">// CLONE_ENGINE</h1>
        <p className="text-xs text-text-muted mt-1">One Click. Full Website Clone. Zero Workstation Requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Kolom Kiri: Config */}
        <div className="lg:col-span-5 rounded-lg border border-border bg-[#0B0A0E] p-6 relative">
          <div className="corner-brackets" />
          <h2 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">// CONFIGURE_JOB</h2>

          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-gray-400 font-mono">TARGET URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#08070A] border border-border rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-primary text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-gray-400 font-mono">MAX DEPTH (LEVELS)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full bg-[#08070A] border border-border rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-primary text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-gray-400 font-mono">CLONER ENGINE</label>
              <div className="flex gap-2">
                {["auto", "decant", "site-cloner"].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setForceTool(tool)}
                    className={cn(
                      "flex-1 py-1.5 rounded border text-[10px] font-mono transition-all",
                      forceTool === tool 
                        ? "border-primary bg-primary/10 text-white font-bold" 
                        : "border-border/30 bg-[#08070A] text-text-muted hover:border-border/60 hover:text-white"
                    )}
                  >
                    {tool.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartClone}
              disabled={status === "running"}
              className={cn(
                "w-full py-2.5 rounded font-mono text-xs font-bold text-white transition-all flex items-center justify-center gap-2 mt-4",
                status === "running"
                  ? "bg-primary/20 border border-primary/40 cursor-not-allowed text-primary"
                  : "bg-primary hover:shadow-glow border border-primary"
              )}
            >
              {status === "running" ? (
                <>
                  <RotateCw size={12} className="animate-spin" />
                  <span>RUNNING PIPELINE...</span>
                </>
              ) : (
                <>
                  <Play size={12} fill="currentColor" />
                  <span>START CLONE JOB ↗</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Output Progress & Hasil */}
        <div className="lg:col-span-7 rounded-lg border border-border bg-[#0B0A0E] p-6 relative min-h-[300px] flex flex-col">
          <div className="corner-brackets" />
          <h2 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">// ENGINE_OUTPUT</h2>

          <div className="flex-1 flex flex-col justify-center">
            
            {/* Idle state */}
            {status === "idle" && (
              <div className="text-center space-y-3 p-6 border border-border/20 rounded bg-bg-elevated/5 max-w-sm mx-auto">
                <Cpu size={24} className="text-primary mx-auto animate-pulse" />
                <p className="text-xs text-white font-bold">Stealth Cloner Offline</p>
                <p className="text-[10px] text-text-muted leading-relaxed font-sans">
                  Masukkan target URL di kolom konfigurasi sebelah kiri dan luncurkan engine untuk memulai kloning visual penuh.
                </p>
              </div>
            )}

            {/* Running state */}
            {status === "running" && (
              <div className="space-y-4 max-w-md mx-auto w-full text-center">
                <RotateCw size={32} className="text-primary animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider">PROCESS_CLONING_RUNNING</p>
                  <p className="text-[10px] text-accent animate-pulse">STAGE: {currentStage.toUpperCase()}</p>
                </div>

                <div className="w-full h-1.5 bg-border/20 rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-muted">{progressPercent}% Completed</span>
              </div>
            )}

            {/* Error state */}
            {status === "error" && (
              <div className="text-center space-y-3 p-6 border border-red-500/20 rounded bg-red-500/5 max-w-sm mx-auto">
                <ShieldAlert size={24} className="text-red-400 mx-auto" />
                <p className="text-xs font-bold text-red-400">Execution Failed</p>
                <p className="text-[10px] text-gray-400 leading-normal select-all font-sans">
                  {errorMsg}
                </p>
              </div>
            )}

            {/* Success state */}
            {status === "success" && result && (
              <div className="space-y-5 text-left w-full">
                <div className="flex items-center gap-2 border-b border-border/20 pb-3 mb-2">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span className="text-xs font-bold text-green-400">CLONE JOB SUCCESSFULLY COMPLETED</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="border border-border bg-black/25 p-3 rounded text-left">
                    <span className="text-[9px] text-text-muted block">SIMILARITY</span>
                    <span className="text-base font-bold text-green-400">{(result.similarity_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="border border-border bg-black/25 p-3 rounded text-left">
                    <span className="text-[9px] text-text-muted block">ZIP SIZE</span>
                    <span className="text-base font-bold text-white">{result.file_size_mb} MB</span>
                  </div>
                  <div className="border border-border bg-black/25 p-3 rounded text-left">
                    <span className="text-[9px] text-text-muted block">PAGES</span>
                    <span className="text-base font-bold text-white">{result.total_pages}</span>
                  </div>
                  <div className="border border-border bg-black/25 p-3 rounded text-left">
                    <span className="text-[9px] text-text-muted block">BROKEN</span>
                    <span className="text-base font-bold text-red-400">{result.broken_assets_count}</span>
                  </div>
                </div>

                <div className="border border-border/40 bg-bg-elevated/5 p-4 rounded text-xs space-y-2">
                  <span className="text-[10px] text-text-muted block font-bold">// CLONE_METADATA</span>
                  <div className="flex justify-between border-b border-border/10 pb-1.5 text-[10px]">
                    <span className="text-gray-400">Engine Cloner:</span>
                    <span className="text-white font-bold">{result.tool_used.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1.5 text-[10px]">
                    <span className="text-gray-400">Detected Stack:</span>
                    <span className="text-white font-bold">{result.site_type.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Internal Project ID:</span>
                    <span className="text-white font-bold">#{result.project_id}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-2.5 rounded bg-primary text-white font-bold text-xs hover:shadow-glow flex items-center justify-center gap-1.5"
                  >
                    <Download size={12} />
                    <span>DOWNLOAD ZIP ARCHIVE</span>
                  </button>
                  <a
                    href={`${API_BASE_URL}/preview/${activeJobId}/index.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded border border-border bg-bg-elevated hover:bg-white/5 text-white font-bold text-xs flex items-center justify-center gap-1.5 text-center"
                  >
                    <Eye size={12} />
                    <span>OFFLINE PREVIEW ↗</span>
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
