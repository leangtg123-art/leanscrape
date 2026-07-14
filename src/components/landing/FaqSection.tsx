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
    question: "Apa itu LeanScrape?",
    answer: "LeanScrape adalah antarmuka visual (Playground & Dashboard) premium yang dibangun oleh LeanianStudio di atas Firecrawl API. Membantu developer mengekstrak konten web menjadi data terstruktur (Markdown/JSON) yang ramah LLM.",
  },
  {
    id: "faq-2",
    category: "general",
    question: "Apakah LeanScrape terafiliasi dengan Firecrawl?",
    answer: "Tidak. LeanScrape adalah wrapper/client independen yang dikembangkan oleh LeanianStudio. Kami menggunakan Firecrawl API resmi sebagai mesin pencari & scraping dasar untuk menyajikan data secara aman.",
  },
  {
    id: "faq-3",
    category: "api",
    question: "Apakah saya harus menggunakan API Key sendiri?",
    answer: "Ya. Untuk alasan keamanan, efisiensi biaya, dan kendali penuh, setiap pengguna wajib memasukkan API Key Firecrawl milik mereka sendiri di antarmuka Playground. Kunci ini disimpan secara lokal di browser Anda dan tidak pernah terekspos ke server eksternal.",
  },
  {
    id: "faq-4",
    category: "api",
    question: "Format ekstraksi data apa saja yang didukung?",
    answer: "Kami mendukung format Markdown (LLM-ready), HTML bersih, Raw HTML asli (unmodified DOM source), daftar tautan eksternal (links), serta tangkapan layar viewport atau scroll penuh (screenshot@fullPage).",
  },
  {
    id: "faq-5",
    category: "api",
    question: "Bagaimana sistem proteksi SSRF bekerja?",
    answer: "LeanScrape dilengkapi dengan filter keamanan SSRF tingkat lanjut di sisi server. Sistem ini memblokir semua upaya scraping ke IP privat, localhost, intranet, dan domain lokal (.local/.internal) untuk mencegah kebocoran data internal.",
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
            Semua jawaban atas pertanyaan umum terkait fungsionalitas, integrasi, dan keamanan data di LeanScrape.
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
