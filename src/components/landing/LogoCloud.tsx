"use client";

import React from "react";
import { Cpu, Globe, Database, Code2, CpuIcon } from "lucide-react";

const STACKS_LINE_1 = [
  "Node.js", "Python", "cURL", "LangChain", "OpenAI", "Claude", "LlamaIndex"
];

const STACKS_LINE_2 = [
  "CrewAI", "AutoGen", "Supabase", "Vercel", "Next.js", "TypeScript", "LangGraph"
];

export default function LogoCloud() {
  return (
    <section className="py-12 border-y border-border/40 bg-bg-elevated/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-xs text-text-muted font-mono uppercase tracking-widest">
          // COMPATIBLE WITH THE MODERN AI STACK
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {/* Baris 1: Geser Kiri */}
        <div className="relative w-full overflow-hidden flex select-none">
          <div className="flex gap-8 py-2 animate-marquee-left whitespace-nowrap min-w-full">
            {/* Duplikasi 3x agar mulus tanpa jeda */}
            {[...STACKS_LINE_1, ...STACKS_LINE_1, ...STACKS_LINE_1].map((tech, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 px-5 py-2 rounded border border-border/30 bg-bg-elevated/40 text-gray-300 font-mono text-sm hover:border-primary/50 transition-colors cursor-default"
              >
                <Code2 size={14} className="text-primary" />
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Baris 2: Geser Kanan */}
        <div className="relative w-full overflow-hidden flex select-none">
          <div className="flex gap-8 py-2 animate-marquee-right whitespace-nowrap min-w-full">
            {/* Duplikasi 3x agar mulus tanpa jeda */}
            {[...STACKS_LINE_2, ...STACKS_LINE_2, ...STACKS_LINE_2].map((tech, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 px-5 py-2 rounded border border-border/30 bg-bg-elevated/40 text-gray-300 font-mono text-sm hover:border-accent/50 transition-colors cursor-default"
              >
                <Cpu size={14} className="text-accent" />
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
