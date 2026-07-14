"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, HelpCircle, ArrowLeft, ArrowRight, ShieldCheck, DollarSign } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    priceMonthly: 0,
    priceAnnually: 0,
    desc: "Untuk hobi dan proyek pengujian skala kecil.",
    credits: 500,
    features: [
      "500 kredit gratis per bulan",
      "Akses Scrape & Search API",
      "Rate limit: 10 request/menit",
      "Bypass proteksi web standar",
      "Kompatibel dengan SDK",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Hobby",
    priceMonthly: 19,
    priceAnnually: 15,
    desc: "Ideal untuk pengembang independen & builder AI.",
    credits: 10000,
    features: [
      "10.000 kredit per bulan",
      "Semua fitur paket Free",
      "Akses Crawl & Map API",
      "Rate limit: 60 request/menit",
      "Prioritas bypass Cloudflare",
      "Dukungan email standar",
    ],
    cta: "Subscribe Hobby",
    popular: true,
  },
  {
    name: "Standard",
    priceMonthly: 99,
    priceAnnually: 79,
    desc: "Untuk agen AI aktif dan ekstraksi data skala bisnis.",
    credits: 80000,
    features: [
      "80.000 kredit per bulan",
      "Semua fitur paket Hobby",
      "Akses Browser Interact (Actions)",
      "Rate limit: 300 request/menit",
      "Ekstraksi paralel (10 workers)",
      "Dukungan prioritas Discord",
    ],
    cta: "Subscribe Standard",
    popular: false,
  },
];

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");

  return (
    <main className="min-h-screen bg-bg text-white font-sans flex flex-col justify-between">
      <div className="scanline opacity-10 pointer-events-none" />
      <Navbar />

      <section className="py-20 relative overflow-hidden flex-1">
        {/* Spotlights */}
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Header */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1 border border-primary/20 bg-primary/5 text-primary px-3 py-1 rounded text-xs font-mono mb-4 animate-float-slow">
              <DollarSign size={12} />
              <span>TRANSPARENT_PRICING</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-sans text-white mb-4">
              Calibrated plans
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Pilih rencana harga yang sesuai dengan volume kebutuhan scraping Anda. Hemat hingga 20% dengan paket tahunan.
            </p>
          </div>

          {/* Billing Period Selector */}
          <div className="flex justify-center items-center gap-3 mb-16 font-mono text-xs select-none">
            <span className={cn(billingPeriod === "monthly" ? "text-white font-bold" : "text-text-muted")}>Monthly</span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annually" : "monthly")}
              className="w-12 h-6 rounded-full bg-bg-elevated border border-border p-1 relative transition-colors focus:outline-none"
            >
              <div 
                className={cn(
                  "w-4 h-4 rounded-full bg-primary transition-all duration-300",
                  billingPeriod === "annually" ? "translate-x-6 bg-accent" : "translate-x-0"
                )}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={cn(billingPeriod === "annually" ? "text-white font-bold" : "text-text-muted")}>Annually</span>
              <span className="bg-accent text-bg px-1.5 py-0.5 rounded text-[9px] font-bold animate-pulse-glow">
                2 MONTHS FREE
              </span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20 text-left items-stretch">
            {PLANS.map((plan) => {
              const price = billingPeriod === "monthly" ? plan.priceMonthly : plan.priceAnnually;
              return (
                <div
                  key={plan.name}
                  className={cn(
                    "relative p-8 rounded-lg border bg-bg-elevated/20 flex flex-col justify-between transition-all duration-300",
                    plan.popular
                      ? "border-primary shadow-[0_0_30px_rgba(var(--lc-primary-rgb),0.15)]"
                      : "border-border hover:border-gray-600"
                  )}
                >
                  {/* Card corners */}
                  <div className="corner-brackets" />
                  {plan.popular && (
                    <span className="absolute top-4 right-4 bg-primary text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded">
                      POPULAR CHOICE
                    </span>
                  )}

                  <div>
                    <h3 className="text-xl font-bold font-sans text-white mb-2">{plan.name}</h3>
                    <p className="text-xs text-text-muted mb-6 leading-relaxed">{plan.desc}</p>
                    
                    {/* Price display */}
                    <div className="flex items-baseline gap-1.5 mb-6 font-mono">
                      <span className="text-3xl font-black text-white">${price}</span>
                      <span className="text-xs text-text-muted">/ month</span>
                    </div>

                    <div className="border-t border-border/40 pt-6 mb-6">
                      <p className="text-[10px] text-accent font-mono mb-4 uppercase">
                        // {plan.credits.toLocaleString()} CREDITS INCLUDED
                      </p>
                      <ul className="space-y-3 text-xs text-gray-300 font-sans">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <Check size={14} className="text-primary mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      href="/signin?view=signup"
                      className={cn(
                        "w-full inline-flex items-center justify-center py-2.5 rounded text-xs font-bold font-mono border transition-all focus:outline-none text-center",
                        plan.popular
                          ? "bg-primary border-primary text-white hover:shadow-glow"
                          : "bg-bg-elevated border-border text-gray-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {plan.cta.toUpperCase()}
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Secure disclaimer */}
          <div className="max-w-md mx-auto border border-border bg-bg-elevated/40 p-4 rounded flex items-center gap-3 font-mono text-[10px] text-text-muted text-left">
            <ShieldCheck size={20} className="text-accent shrink-0" />
            <span>Secure billing processed via Stripe. Cancel subscription anytime. Credits roll over to the next month for active packages.</span>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
