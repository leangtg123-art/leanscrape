# ⚡ LeanScrape

> **A high-performance visual playground and developer dashboard for Firecrawl scraping engine.**

LeanScrape provides a developer-first interface to search, scrape, crawl, and map web data into clean, LLM-ready formats. Engineered with terminal-inspired aesthetics, local-first key management, and a proxy safety layer, it acts as the ultimate developer cockpit for data extraction.

[![CI Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#)
[![Powered by](https://img.shields.io/badge/Engine-Firecrawl%20API-orange.svg)](https://firecrawl.dev)
[![Developer](https://img.shields.io/badge/Developer-leangtg123--art-crimson.svg)](https://github.com/leangtg123-art)

---

## 🔒 Security Disclosures
* **Zero-Leak Design**: Key logic is encrypted to prevent reverse-engineering of proxy configurations.
* **SSRF Guard Protection**: Server-side resolution DNS lookup resolves hostnames to underlying IPs, filtering out loopbacks and private subnets (`127.0.0.1`, `localhost`, etc.) to block DNS Rebinding attacks.
* **Local-First Keys**: API keys are saved exclusively in your browser's local storage and passed securely via headers.

---

## 🌟 Key Features
* **Multi-Key API Manager**: Save and cycle between up to **5 Firecrawl API Keys** with names/aliases.
* **Scrape, Crawl, Search, Map**: 4 engines fully configured with visual progress bars and iframe website previews.
* **5 Color Themes**: Neon Rose, Orange, Crimson, Mint, and Pure Red persistent themes.
* **Bilingual UI**: Toggle between English and Indonesian with visual saved confirmations.

---

## 🛠️ Super Easy Installation

You do NOT need to configure complex database credentials or `.env` files to get started!

### 1. Clone the repository
```bash
git clone https://github.com/leangtg123-art/leanscrape.git
cd leanscrape
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

### 4. Setup Key
Open [http://localhost:3000/playground](http://localhost:3000/playground) in your browser. Click **[MANAGE KEYS]** and add your Firecrawl API Key to start scraping!

---

*Crafted with ⚡ by [leangtg123-art](https://github.com/leangtg123-art).*
