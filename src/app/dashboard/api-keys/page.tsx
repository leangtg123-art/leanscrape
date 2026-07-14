"use client";

import React, { useEffect, useState } from "react";
import { KeyRound, Plus, Trash2, Copy, Check, Eye, EyeOff, ShieldAlert, X } from "lucide-react";
import { mockDb, ApiKeyItem } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<string[]>([]); // Menyimpan ID kunci yang di-reveal

  useEffect(() => {
    setKeys(mockDb.getApiKeys());
  }, []);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const generated = mockDb.createApiKey(newKeyName.trim());
    setKeys(mockDb.getApiKeys());
    setNewKeyName("");
    setModalOpen(false);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm("Are you sure you want to revoke this API key? Projects using this key will immediately fail to authenticate.")) {
      mockDb.deleteApiKey(id);
      setKeys(mockDb.getApiKeys());
    }
  };

  const handleCopy = (id: string, keyValue: string) => {
    navigator.clipboard.writeText(keyValue);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((curr) => 
      curr.includes(id) ? curr.filter(kId => kId !== id) : [...curr, id]
    );
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">API Key Management</h1>
          <p className="text-xs text-text-muted mt-1 font-mono">// MANAGE_SYSTEM_ACCESS_TOKENS</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-primary bg-primary text-white rounded text-xs font-bold font-mono hover:shadow-glow transition-all"
        >
          <Plus size={14} />
          <span>GENERATE NEW KEY</span>
        </button>
      </div>

      {/* Security alert box */}
      <div className="border border-accent/20 bg-accent/5 p-4 rounded-lg flex gap-3 font-mono text-[10px] text-gray-300">
        <ShieldAlert size={18} className="text-accent shrink-0" />
        <div>
          <span className="font-bold text-accent">SECURITY NOTE:</span> Kunci API Anda memberikan hak akses penuh ke kredit pemakaian akun Anda. Jaga kerahasiaan kunci dan jangan pernah menyematkannya langsung di repositori publik (*client-side codebase*). Gunakan *backend proxy* untuk memproteksi key Anda.
        </div>
      </div>

      {/* Table grid keys list */}
      <div className="rounded-lg border border-border bg-[#0B0A0E] overflow-hidden">
        <div className="corner-brackets" />
        
        {keys.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 font-mono">
            No API Keys available. Generate one above to access the API.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead>
                <tr className="border-b border-border/40 bg-bg-elevated/20 text-text-muted uppercase text-[9px] tracking-widest">
                  <th className="p-4">Key Name</th>
                  <th className="p-4">API Token Value</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {keys.map((item) => {
                  const isRevealed = revealedKeys.includes(item.id);
                  const isCopied = copiedKeyId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors text-gray-300">
                      <td className="p-4 font-bold text-white">{item.name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-bg/60 border border-border/20 px-2.5 py-1 rounded text-xs select-all text-accent">
                            {isRevealed ? item.key : `${item.key.substring(0, 12)}••••••••••••••••`}
                          </code>
                          <button
                            onClick={() => toggleReveal(item.id)}
                            className="text-text-muted hover:text-white transition-colors"
                            title={isRevealed ? "Hide token" : "Reveal token"}
                          >
                            {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => handleCopy(item.id, item.key)}
                            className="text-text-muted hover:text-white transition-colors"
                            title="Copy key"
                          >
                            {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteKey(item.id)}
                          className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/5 rounded transition-colors"
                          title="Revoke key"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create new API key */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 font-sans">
          <div className="relative max-w-sm w-full border border-border bg-[#0B0A0E] rounded-lg p-6 shadow-2xl space-y-4 text-left">
            {/* Corner Decor */}
            <div className="corner-brackets" />

            {/* Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-1.5 uppercase">
                <KeyRound size={14} className="text-primary animate-pulse" />
                <span>GENERATE_NEW_TOKEN</span>
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateKey} className="space-y-4 font-mono text-xs">
              <div className="space-y-2">
                <label className="block text-gray-400">Key Identifier Name</label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-bg-elevated/40 border border-border rounded px-3 py-2.5 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. Telegram Scraper Bot"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-border bg-bg-elevated text-text-muted hover:text-white rounded"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded font-bold hover:shadow-glow"
                >
                  GENERATE
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
