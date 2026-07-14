import React from "react";
import AnnounceBar from "@/components/landing/AnnounceBar";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import LogoCloud from "@/components/landing/LogoCloud";
import MainFeatures from "@/components/landing/MainFeatures";
import PerformanceSection from "@/components/landing/PerformanceSection";
import ZeroConfigSection from "@/components/landing/ZeroConfigSection";
import UseCases from "@/components/landing/UseCases";
import Testimonials from "@/components/landing/Testimonials";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-bg text-white overflow-hidden selection:bg-primary/30 selection:text-white">
      {/* Scanline decoration overlay */}
      <div className="scanline" />
      
      {/* Top Banner */}
      <AnnounceBar />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Page */}
      <HeroSection />
      
      {/* Tech Stack Marquee */}
      <LogoCloud />
      
      {/* Feature Cards & Integration Code Switcher */}
      <MainFeatures />
      
      {/* Benchmarks & Metrics (Bar Charts, Countdown, Speed Counters) */}
      <PerformanceSection />
      
      {/* Zero Config Block (Docs, Hydration loader, cache diagram, action chips) */}
      <ZeroConfigSection />
      
      {/* Real-World Use Cases & Deep Research Logs Simulator */}
      <UseCases />
      
      {/* Testimonials Marquee */}
      <Testimonials />
      
      {/* FAQ Accordion Accordion */}
      <FaqSection />
      
      {/* Footer Branding & Links */}
      <Footer />
    </main>
  );
}
