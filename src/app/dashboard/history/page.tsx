"use client";

import React, { useEffect, useState } from "react";
import { History, Search, Terminal, Eye, X, Copy, Check } from "lucide-react";
import { mockDb, HistoryItem } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    setHistory(mockDb.getHistory());
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredHistory = history.filter(
    (item) => 
      item.targetUrl.toLowerCase().includes(searchFilter.toLowerCase()) || 
      item.endpoint.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Request History</h1>
          <p className="text-xs text-text-muted mt-1 font-mono">// HISTORY_LOG_AUDIT_TRAIL</p>
        </div>

        {/* Search filter bar */}
        <div className="relative w-full sm:w-64 font-mono text-xs">
          <Search size={14} className="absolute left-3 top-3 text-text-muted" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-[#0B0A0E] border border-border rounded pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-primary"
            placeholder="FILTER BY URL/ENDPOINT"
          />
        </div>
      </div>

      {/* History Table Grid */}
      <div className="rounded-lg border border-border bg-[#0B0A0E] overflow-hidden">
        <div className="corner-brackets" />
        
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 font-mono">
            No requests matched your filter. Execute more scraping calls.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead>
                <tr className="border-b border-border/40 bg-bg-elevated/20 text-text-muted uppercase text-[9px] tracking-widest">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Endpoint</th>
                  <th className="p-4">Target URL / Query</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Credits</th>
                  <th className="p-4 text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors text-gray-300">
                    <td className="p-4 text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border border-primary/20 bg-primary/5 text-primary">
                        {item.endpoint}
                      </span>
                    </td>
                    <td className="p-4 max-w-[200px] truncate font-bold text-white" title={item.targetUrl}>
                      {item.targetUrl}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "text-[10px] font-bold",
                        item.status.includes("OK") ? "text-green-400" : "text-red-400"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-accent font-bold">
                      -{item.credits} Cr
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 rounded transition-colors"
                        title="View payload"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Response JSON Preview */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 font-sans">
          <div className="relative max-w-2xl w-full border border-border bg-[#0B0A0E] rounded-lg p-6 shadow-2xl flex flex-col h-[80vh]">
            <div className="corner-brackets" />
            
            {/* Title Bar */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4 shrink-0">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-1.5 uppercase">
                <Terminal size={14} className="text-primary animate-pulse" />
                <span>PAYLOAD_PREVIEW: {selectedItem.endpoint}</span>
              </h3>
              
              <div className="flex items-center gap-3">
                {selectedItem.responsePreview && (
                  <button
                    onClick={() => handleCopy(selectedItem.responsePreview || "")}
                    className="text-text-muted hover:text-white flex items-center gap-1 text-[10px] font-mono transition-colors focus:outline-none"
                  >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                )}
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="text-text-muted hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto bg-[#070609] border border-border/20 rounded p-4 font-mono text-[10px] text-gray-300 leading-normal select-all">
              {selectedItem.responsePreview ? (
                <pre>{selectedItem.responsePreview}</pre>
              ) : (
                <span className="text-gray-500 italic">No response preview stored.</span>
              )}
            </div>

            {/* Footer metadata */}
            <div className="mt-4 pt-3 border-t border-border/40 font-mono text-[9px] text-text-muted flex justify-between shrink-0">
              <span>TARGET: {selectedItem.targetUrl}</span>
              <span>CREDITS: -{selectedItem.credits} Cr</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
