<div align="center">

# ⚡ LeanScrape

### *Premium Next.js 14 Visual Playground & Developer Dashboard for Firecrawl Stealth Web Scraping*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fleangtg123-art%2Fleanscrape)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Firecrawl API](https://img.shields.io/badge/Powered%20By-Firecrawl%20v1-orange?style=for-the-badge)](https://firecrawl.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[🌐 Live Demo](https://leanscrape.vercel.app) • [📖 Documentation](#-key-features) • [🐛 Report Bug](https://github.com/leangtg123-art/leanscrape/issues) • [⭐ Star on GitHub](https://github.com/leangtg123-art/leanscrape)

---

</div>

**LeanScrape** is an open-source, developer-first cockpit built for modern web scraping and AI LLM data extraction pipelines. Powered by Next.js 14 and Firecrawl API, it allows developers to visually test URL extractions, crawl deep sub-pages, bypass bot protection layers, and export structured LLM-ready Markdown & JSON in real time.

---

## 🌟 Key Features

- **🚀 4 Scraping Engines**:
  - `Scrape`: Convert dynamic Javascript websites into clean LLM-ready Markdown.
  - `Crawl`: Deep multi-page scanning with custom depth and URL pattern rules.
  - `Search`: Perform stealth web queries and extract high-ranking search results.
  - `Map`: Generate sitemaps and site hierarchy trees instantly.
- **🔑 Multi-Key Rotation**: Save up to 5 Firecrawl API keys with custom aliases and auto-cycle between them.
- **🔒 Enterprise Security Layer**:
  - **SSRF Guard**: Resolves hostnames server-side to block internal loopback IP rebinding (`127.0.0.1`, `localhost`, etc.).
  - **Local-First Keys**: API keys are stored exclusively in browser local storage and never logged.
- **🎨 5 Cybernetic Themes**: Neon Rose, Cyber Orange, Crimson, Mint, and Pure Red.
- **🇮🇩/🇬🇧 Dual Language Support**: Native support for English and Indonesian localization.

---

## 🏗 System Architecture

```text
  [ User Browser / Local Storage ] 
                │ (Client Keys & Theme Config)
                ▼
      [ LeanScrape Cockpit ] ─── (Next.js 14 App Router)
                │
                ├──► SSRF Guard & Domain Resolver
                │
                ▼
     [ Firecrawl Stealth Engine ] 
                │
                ▼
  [ Clean LLM Markdown / JSON Output ]
```

---

## 🛠️ Quick Start (Local Setup)

Getting started takes less than 60 seconds. No database or complex `.env` files required!

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

### 4. Open Playground
Navigate to `http://localhost:3000/playground` in your browser. Click **[MANAGE KEYS]**, enter your Firecrawl API Key, and start scraping!

---

## 🚀 One-Click Cloud Deployment

Deploy your own private instance of LeanScrape to Vercel in 1 click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fleangtg123-art%2Fleanscrape)

---

## 🛡️ Security & Privacy Disclosures

- **Zero-Server Key Logging**: Your API keys never touch our database servers.
- **SSRF Protection**: All outbound target URLs are validated to prevent Server-Side Request Forgery against private subnets.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/leangtg123-art/leanscrape/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">

Crafted with ⚡ by [leangtg123-art](https://github.com/leangtg123-art)

</div>
