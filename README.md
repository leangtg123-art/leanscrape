# ⚡ LeanScrape

> **A high-performance visual playground and developer dashboard for Firecrawl scraping engine.**

LeanScrape provides a developer-first interface to search, scrape, crawl, and map web data into clean, LLM-ready formats. Engineered with terminal-inspired aesthetics, local-first key management, and a proxy safety layer, it acts as the ultimate developer cockpit for data extraction.

[![CI Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Powered by](https://img.shields.io/badge/Engine-Firecrawl%20API-orange.svg)](https://firecrawl.dev)
[![Developer](https://img.shields.io/badge/Developer-leangtg123--art-crimson.svg)](https://github.com/leangtg123-art)

---

## 🔒 SSRF & Security Disclosures

* **SSRF Guard Protection**: Built-in server-side validation filters out loopbacks, local networks, and private intranets (`localhost`, `127.0.0.1`, `192.168.x.x`, `.local`, `.internal`) to secure internal resources.
* **Smart URL Prepending**: Automatically resolves hostname formats (e.g. `example.com` -> `https://example.com`) prior to processing to avoid false SSRF blocks.
* **Local-First Key Storage**: Your Firecrawl API keys are managed entirely on the client-side (`localStorage`) and passed via custom request headers. They are never logged or stored on our servers.

---

## 🌟 Features

* **Multi-Key API Key Manager**: Register, select, copy, and manage up to **5 Firecrawl API Keys** simultaneously. Names/aliases can be assigned to each key.
* **Four Core API Engines**:
  * **Scrape**: Turn URLs into LLM-optimized Markdown, cleaned HTML, Raw HTML source, links list, and viewport or fullpage screenshots.
  * **Search**: Perform live web searches to fetch content directly into your LLM contexts.
  * **Crawl**: Recursively crawl entire domains and build rich markdown datasets.
  * **Map**: Generate structured sitemaps of any URL instantly.
* **Vertical Stacked Output Panel**: Compact mobile-friendly layouts, featuring horizontal-scroll parameter lists, code tabs, and interactive iframe HTML previews.
* **Developer Metrics Console**: Real-time measurement of API latency (ms) and payload sizes (KB), alongside active operation log feeds.
* **Simulated Billing & Usage Logs**: Track credits (limited to 10 requests with an automatic 5-hour reset interval) and audit extraction histories.
* **Dynamic Theme Engines**: Toggle between 5 custom styles (Crimson, Orange, Mint, Neon Rose, Pure Red) instantly with persistence.
* **Bilingual Switcher (EN / ID)**: Adapt interface instructions, logs, and notifications with a bilingual toggle saved in local settings.

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 14 (App Router) + React 18 + TypeScript
* **Styling**: Tailwind CSS + Vanilla CSS variables for theme hydration
* **Icons & UI**: Lucide React + Tailwind utilities
* **Authentication**: Simulated local accounts with optional GitHub OAuth redirection
* **Database & Fallback**: LocalStorage-powered mock database module

---

## 💻 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/leangtg123-art/leanscrape.git
cd leanscrape
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Install Dependencies & Launch
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Directory Structure
```
leanscrape/
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── api/leanscrape/     # Backend proxy handler & SSRF guard
│   │   ├── playground/         # Bilingual vertical stacked playground
│   │   ├── dashboard/          # Billing and credits control panels
│   │   └── page.tsx            # Product Landing Page
│   ├── components/
│   │   ├── landing/            # Core landing layout sections
│   │   └── theme/              # Theme switcher & global providers
│   └── lib/
│       ├── firecrawl.ts        # Firecrawl client wrapper
│       └── supabase.ts         # Mock database helper & history logger
└── README.md
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.

*Crafted by [leangtg123-art](https://github.com/leangtg123-art).*
