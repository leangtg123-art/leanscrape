"use client";

import React from "react";
import { MessageSquare, Quote } from "lucide-react";

const TESTIMONIALS_1 = [
  {
    name: "Alex Rivera",
    handle: "@alexr_dev",
    quote: "LeanScrape makes web data extraction so clean. My LLM context is 10x smaller now.",
  },
  {
    name: "Devi Lestari",
    handle: "@devi_ai",
    quote: "The Actions API is extremely robust. Easiest way to bypass form logins programmatically.",
  },
  {
    name: "Sanjay Kumar",
    handle: "@sanj_dev",
    quote: "Perfect API wrapper. Very professional documentation and clean Next.js architecture.",
  },
];

const TESTIMONIALS_2 = [
  {
    name: "Elena Rostova",
    handle: "@elena_code",
    quote: "Setup took 5 seconds. MCP integration works out of the box with Claude Desktop.",
  },
  {
    name: "Kenji Sato",
    handle: "@kenji_s",
    quote: "LeanianStudio did an amazing job on the UI and animations. Very smooth theme transition.",
  },
  {
    name: "Sarah Miller",
    handle: "@sarahm_ai",
    quote: "Reliability is insane. Works even on websites that block normal cURL requests completely.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 relative z-10">
        <div className="inline-block px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-xs font-mono rounded mb-4">
          06 / 06 · DEVELOPER FEEDBACK
        </div>
        <h2 className="text-3xl md:text-5xl font-bold font-sans text-white mb-4">
          Loved by builders
        </h2>
        <p className="text-gray-400 font-sans max-w-xl mx-auto text-sm">
          Apa kata para pengembang dan pembuat sistem AI tentang fungsionalitas dan performa LeanScrape.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full relative">
        {/* Row 1: Left sliding marquee */}
        <div className="relative w-full overflow-hidden flex select-none">
          <div className="flex gap-6 py-2 animate-marquee-left whitespace-nowrap min-w-full">
            {[...TESTIMONIALS_1, ...TESTIMONIALS_1, ...TESTIMONIALS_1].map((item, idx) => (
              <div
                key={idx}
                className="shrink-0 w-80 p-5 rounded-lg border border-border bg-bg-elevated/40 text-left relative overflow-hidden font-sans hover:border-primary/40 transition-colors"
              >
                <div className="corner-brackets" />
                <Quote size={24} className="absolute -right-2 -bottom-2 text-primary/5 select-none" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono font-bold text-white uppercase">
                    {item.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none">{item.name}</h4>
                    <span className="text-[10px] text-text-muted font-mono">{item.handle}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 whitespace-normal leading-relaxed">
                  "{item.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Right sliding marquee */}
        <div className="relative w-full overflow-hidden flex select-none">
          <div className="flex gap-6 py-2 animate-marquee-right whitespace-nowrap min-w-full">
            {[...TESTIMONIALS_2, ...TESTIMONIALS_2, ...TESTIMONIALS_2].map((item, idx) => (
              <div
                key={idx}
                className="shrink-0 w-80 p-5 rounded-lg border border-border bg-bg-elevated/40 text-left relative overflow-hidden font-sans hover:border-accent/40 transition-colors"
              >
                <div className="corner-brackets" />
                <Quote size={24} className="absolute -right-2 -bottom-2 text-accent/5 select-none" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-mono font-bold text-white uppercase">
                    {item.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none">{item.name}</h4>
                    <span className="text-[10px] text-text-muted font-mono">{item.handle}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 whitespace-normal leading-relaxed">
                  "{item.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
