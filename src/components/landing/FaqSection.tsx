"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  category: "general" | "api" | "billing";
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "faq-1",
    category: "general",
    question: "What is LeanScrape?",
    answer: "LeanScrape is a premium visual interface (Playground & Dashboard) built by LeanianStudio on top of the Firecrawl API. It helps developers extract web content into structured data (Markdown/JSON) optimized for application usage.",
  },
  {
    id: "faq-2",
    category: "general",
    question: "Is LeanScrape officially affiliated with Firecrawl?",
    answer: "No. LeanScrape is an independent client interface wrapper developed by LeanianStudio. We utilize the official Firecrawl API as the underlying search & extraction engine to deliver data securely.",
  },
  {
    id: "faq-3",
    category: "api",
    question: "Do I need to use my own Firecrawl API Key?",
    answer: "Yes. For security, cost-efficiency, and absolute control, users are required to input their own Firecrawl API Key in the Playground. Your key is stored securely in your browser's local storage and is never exposed to external servers.",
  },
  {
    id: "faq-4",
    category: "api",
    question: "Which data extraction formats are supported?",
    answer: "We support Markdown (LLM-ready format), cleaned HTML, unmodified Raw HTML source, external link lists, and full-page or viewport screenshots.",
  },
  {
    id: "faq-5",
    category: "api",
    question: "How does the Server-Side Request Forgery (SSRF) protection work?",
    answer: "LeanScrape features an advanced server-side SSRF protection filter. It blocks all scraping attempts targeting private IPs, localhost, intranet networks, and local domains (.local/.internal) to prevent internal data exposure.",
  },
];

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<"all" | "general" | "api" | "billing">("all");

  const filteredFaqs = FAQS.filter(
    (faq) => activeCategory === "all" || faq.category === activeCategory
  );

  return (
    <section className="py-24 bg-bg border-t border-border/30 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <HelpCircle size={32} className="text-primary mx-auto mb-4 animate-pulse-glow" />
          <h2 className="text-3xl md:text-5xl font-bold font-sans text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 font-sans text-sm max-w-lg mx-auto">
            Find answers to common questions about LeanScrape's functionality, integration patterns, and data security standards.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex justify-center gap-2 mb-10 font-mono text-xs">
          {(["all", "general", "api", "billing"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
              }}
              className={cn(
                "px-3 py-1.5 rounded border transition-colors focus:outline-none",
                activeCategory === cat
                  ? "border-primary bg-primary/10 text-white font-bold"
                  : "border-border bg-bg-elevated/40 text-text-muted hover:text-white"
              )}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Open Grid Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {filteredFaqs.map((faq) => (
            <div 
              key={faq.id} 
              className="relative p-6 rounded-lg border border-border bg-bg-elevated/20 overflow-hidden transition-all duration-300 hover:border-primary/30"
            >
              <div className="corner-brackets" />
              <h3 className="font-bold text-sm md:text-base text-white mb-3">
                {faq.question}
              </h3>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
