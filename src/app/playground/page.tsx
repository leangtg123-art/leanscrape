"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Play, Terminal, Search, Globe, MapPin, MousePointer, 
  RotateCw, Copy, Check, ArrowLeft, Database, History, 
  Layers, Clock, ShieldAlert, Image as ImageIcon, Download, Eye, Settings, ShieldCheck, Cpu, Trash2
} from "lucide-react";
import { mockDb, HistoryItem } from "@/lib/supabase";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { cn } from "@/lib/utils";

type EndpointType = "scrape" | "search" | "crawl" | "map" | "clone";

interface FirecrawlKey {
  id: string;
  name: string;
  key: string;
}

const LOADING_TEXTS = [
  "Rendering webpage in serverless browser...",
  "Bypassing protections & extracting DOM...",
  "Extracting main content blocks...",
  "Stripping HTML tags and boilerplate...",
  "Converting layout to clean Markdown...",
  "Formatting JSON payload...",
];

const TRANSLATIONS = {
  en: {
    backToHome: "BACK_TO_HOME",
    playgroundTitle: "LEANSCRAPE_PLAYGROUND",
    balance: "Balance",
    selectEndpoint: "SELECT_ENDPOINT",
    requestHistory: "REQUEST_HISTORY",
    noHistory: "No previous requests found.",
    formParams: "FORM_PARAMETERS",
    targetUrl: "Target URL",
    searchQuery: "Search Query",
    outputFormats: "Output Formats",
    crawlLimit: "Crawl Page Limit",
    executeRequest: "EXECUTE API CALL",
    runningRequest: "RUNNING SCRAPER ENGINE...",
    outputResult: "OUTPUT_RESULT",
    download: "Download",
    copy: "Copy",
    copied: "Copied",
    systemReady: "Stealth Scraper is Offline",
    systemReadyDesc: "Set up your parameters, select your Firecrawl API key, and execute to scrape real-time structured data.",
    runningProgress: "SCRAPING_IN_PROGRESS",
    executionFailed: "Execution Failed",
    noMarkdown: "No markdown output found.",
    noCleanHtml: "No clean HTML output found.",
    noRawHtml: "No raw HTML output found.",
    noLinks: "No links extracted.",
    noScreenshot: "No screenshot URL found in response.",
    metricsTitle: "DEVELOPER_CONSOLE_METRICS",
    latency: "API_LATENCY",
    payloadSize: "PAYLOAD_SIZE",
    ssrfFilter: "SSRF_FILTER",
    keyStatus: "KEY_STATUS",
    systemLogs: "SYSTEM_LOGS",
    downloadMcp: "DOWNLOAD_MCP_CONFIG_JSON",
    getPrompt: "GET_AGENT_TOOL_PROMPT",
    errorApiKey: "Firecrawl API Key is required. Please add your key in the API Key Manager first.",
    errorNoCredits: "Maximum usage limit reached! You have run out of credits (0). Credits will reset to 10 every 5 hours.",
    apiKeyLabel: "Active Firecrawl API Key",
    apiKeyHint: "Add up to 5 custom Firecrawl keys. Manage, swap, or delete them anytime.",
    creditsResetAlert: "Usage Limit Reached",
    creditsResetDesc: "You have used LeanScrape 10 times. Your API credits will automatically reset to 10 every 5 hours.",
    close: "Close"
  },
  id: {
    backToHome: "KEMBALI_KE_BERANDA",
    playgroundTitle: "LEANSCRAPE_PLAYGROUND",
    balance: "Sisa Kredit",
    selectEndpoint: "PILIH_ENDPOINT",
    requestHistory: "RIWAYAT_REQUEST",
    noHistory: "Riwayat request tidak ditemukan.",
    formParams: "PARAMETER_FORM",
    targetUrl: "URL Target",
    searchQuery: "Kueri Pencarian",
    outputFormats: "Format Output",
    crawlLimit: "Batas Halaman Crawl",
    executeRequest: "JALANKAN EKSTRAKSI API",
    runningRequest: "MENJALANKAN ENGINE SCRAPER...",
    outputResult: "HASIL_OUTPUT",
    download: "Unduh",
    copy: "Salin",
    copied: "Tersalin",
    systemReady: "Stealth Scraper Offline",
    systemReadyDesc: "Siapkan parameter Anda, pilih API key Firecrawl terdaftar, dan jalankan untuk mengekstrak data terstruktur.",
    runningProgress: "PROSES_SCRAPING_BERJALAN",
    executionFailed: "Eksekusi Gagal",
    noMarkdown: "Data markdown tidak ditemukan.",
    noCleanHtml: "Data HTML bersih tidak ditemukan.",
    noRawHtml: "Data HTML mentah tidak ditemukan.",
    noLinks: "Tidak ada tautan yang diekstraksi.",
    noScreenshot: "URL screenshot tidak ditemukan dalam respon.",
    metricsTitle: "METRIK_KONSOL_DEVELOPER",
    latency: "LATENSI_API",
    payloadSize: "UKURAN_DATA",
    ssrfFilter: "FILTER_SSRF",
    keyStatus: "STATUS_KUNCI",
    systemLogs: "LOG_SISTEM",
    downloadMcp: "UNDUH_KONFIG_MCP_JSON",
    getPrompt: "DAPATKAN_PROMPT_ALAT_AGEN",
    errorApiKey: "API Key Firecrawl wajib diisi. Harap tambahkan API key Anda pada Pengelola API Key terlebih dahulu.",
    errorNoCredits: "Batas penggunaan maksimum tercapai! Kredit Anda telah habis (0). Kredit akan di-reset menjadi 10 setiap 5 jam.",
    apiKeyLabel: "API Key Firecrawl Aktif",
    apiKeyHint: "Daftarkan hingga 5 API key Firecrawl kustom. Kelola, tukar, atau hapus kapan saja.",
    creditsResetAlert: "Batas Penggunaan Tercapai",
    creditsResetDesc: "Anda telah menggunakan LeanScrape sebanyak 10 kali. Kredit API Anda akan di-reset otomatis menjadi 10 setiap 5 jam sekali.",
    close: "Tutup"
  }
};

function injectBaseHref(html: string, baseUrl: string) {
  if (!html || !baseUrl) return html;
  let cleanUrl = baseUrl.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = "https://" + cleanUrl;
  }
  const baseTag = `<base href="${cleanUrl}">`;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/(<head[^>]*>)/i, `$1${baseTag}`);
  } else if (/<html[^>]*>/i.test(html)) {
    return html.replace(/(<html[^>]*>)/i, `$1<head>${baseTag}</head>`);
  }
  return baseTag + html;
}

export default function Playground() {
  const router = useRouter();

  // Language state (en / id)
  const [lang, setLang] = useState<"en" | "id">("en");
  const [showLangToast, setShowLangToast] = useState(false);

  // Navigation & Layout states
  const [activeTab, setActiveTab] = useState<EndpointType>("scrape");
  const [mobileView, setMobileView] = useState<"form" | "result">("form");
  const [credits, setCredits] = useState(10);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Form Inputs
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [searchQuery, setSearchQuery] = useState("nextjs 14 speeds");
  const [crawlLimit, setCrawlLimit] = useState(10);
  const [outputFormats, setOutputFormats] = useState<string[]>(["markdown"]);
  const [onlyMainContent, setOnlyMainContent] = useState<boolean>(true);
  const [waitForDelay, setWaitForDelay] = useState<number>(0);
  const [mobileEmulation, setMobileEmulation] = useState<boolean>(false);
  const [userRole, setUserRole] = useState("user");
  const [crawlOptions, setCrawlOptions] = useState({ allowExternalLinks: false, ignoreSitemap: false, onlyMainContent: false });
  const [mapOptions, setMapOptions] = useState({ includeSubdomains: false, search: "", ignoreSitemap: false });
  const [searchLimit, setSearchLimit] = useState(10);
  const [cloneOptions, setCloneOptions] = useState({ depth: 2, forceTool: "auto" });

  // API Key Manager States
  const [savedApiKeys, setSavedApiKeys] = useState<FirecrawlKey[]>([]);
  const [activeApiKey, setActiveApiKey] = useState("");
  const [showKeyManager, setShowKeyManager] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyVal, setNewKeyVal] = useState("");

  // Advanced states
  const [htmlPreviewMode, setHtmlPreviewMode] = useState<"code" | "preview">("code");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [responseSize, setResponseSize] = useState<string | null>(null);
  const [devLogs, setDevLogs] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Executing States
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [statusTextIdx, setStatusTextIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [resultData, setResultData] = useState<any>(null);
  const [resultTab, setResultTab] = useState<"markdown" | "html" | "rawHtml" | "links" | "json" | "screenshot">("markdown");
  const [copied, setCopied] = useState(false);

  const t = TRANSLATIONS[lang];

  // Auth Guard: Harus login untuk memakai web
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("ls-user");
      if (!user) {
        router.push("/signin");
      } else {
        const parsed = JSON.parse(user);
        setUserRole(parsed.role || "user");
      }
    }
  }, [router]);

  // Load initial settings & API Keys & Lang
  useEffect(() => {
    setCredits(mockDb.getCredits());
    setHistory(mockDb.getHistory());
    if (typeof window !== "undefined") {
      // Load Language
      const savedLang = localStorage.getItem("ls-lang") as "en" | "id";
      if (savedLang) setLang(savedLang);

      // Load API Keys
      const keys = JSON.parse(localStorage.getItem("ls-user-firecrawl-keys") || "[]") as FirecrawlKey[];
      setSavedApiKeys(keys);
      
      const active = localStorage.getItem("ls-active-firecrawl-key") || "";
      if (active) {
        setActiveApiKey(active);
      } else if (keys.length > 0) {
        setActiveApiKey(keys[0].key);
        localStorage.setItem("ls-active-firecrawl-key", keys[0].key);
      }
    }
    addDevLog("Playground initialized. SSRF Protection: ACTIVE.");
  }, []);

  // Sync credits polling
  useEffect(() => {
    const handleStorageChange = () => {
      setCredits(mockDb.getCredits());
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Loop text loading ketika berjalan
  useEffect(() => {
    if (status !== "running") return;
    const interval = setInterval(() => {
      setStatusTextIdx((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Progress Bar Simulation
  useEffect(() => {
    if (status !== "running") {
      setProgressPercent(0);
      return;
    }
    setProgressPercent(10);
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 60) return prev + 15;
        if (prev < 85) return prev + 5;
        if (prev < 95) return prev + 1;
        return prev;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [status]);

  const addDevLog = (msg: string) => {
    setDevLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-10));
  };

  const handleAddApiKey = () => {
    if (!newKeyVal.trim()) return;
    
    if (savedApiKeys.length >= 5) {
      alert(lang === "en" 
        ? "Maximum limit of 5 API keys reached. You must delete an existing key to add a new one." 
        : "Batas maksimum 5 API key tercapai. Anda harus menghapus salah satu API key lama untuk menambahkan yang baru.");
      addDevLog("[WARN] Cannot add key: Max limit (5) reached.");
      return;
    }

    const name = newKeyName.trim() || `Key #${savedApiKeys.length + 1}`;
    const newKeyItem: FirecrawlKey = {
      id: "fc-key-" + Math.random().toString(36).substring(2, 9),
      name,
      key: newKeyVal.trim()
    };

    const updated = [...savedApiKeys, newKeyItem];
    setSavedApiKeys(updated);
    localStorage.setItem("ls-user-firecrawl-keys", JSON.stringify(updated));

    // Set as active
    setActiveApiKey(newKeyItem.key);
    localStorage.setItem("ls-active-firecrawl-key", newKeyItem.key);

    // Reset inputs
    setNewKeyName("");
    setNewKeyVal("");
    addDevLog(`[SYSTEM] Added new API Key: ${name}`);
  };

  const handleDeleteApiKey = (id: string) => {
    const updated = savedApiKeys.filter(k => k.id !== id);
    setSavedApiKeys(updated);
    localStorage.setItem("ls-user-firecrawl-keys", JSON.stringify(updated));

    if (updated.length > 0) {
      setActiveApiKey(updated[0].key);
      localStorage.setItem("ls-active-firecrawl-key", updated[0].key);
    } else {
      setActiveApiKey("");
      localStorage.removeItem("ls-active-firecrawl-key");
    }
    addDevLog("[SYSTEM] API key deleted.");
  };

  const handleSelectApiKey = (keyVal: string) => {
    setActiveApiKey(keyVal);
    localStorage.setItem("ls-active-firecrawl-key", keyVal);
    addDevLog("[SYSTEM] Switched active Firecrawl API key.");
  };

  const handleRun = async () => {
    if (status === "running") return;

    // Check credit limits
    const currentCredits = mockDb.getCredits();
    if (currentCredits <= 0) {
      setStatus("error");
      setErrorMsg(t.errorNoCredits);
      setShowLimitModal(true);
      addDevLog("[WARN] Request blocked: Out of credits (Max 10 uses reached).");
      return;
    }

    if (!activeApiKey) {
      setStatus("error");
      setErrorMsg(t.errorApiKey);
      addDevLog("[ERROR] API Execution aborted: Missing active Firecrawl API Key.");
      return;
    }
    
    setStatus("running");
    setErrorMsg("");
    setResultData(null);
    setStatusTextIdx(0);
    setLatencyMs(null);
    setResponseSize(null);
    addDevLog(`[SYSTEM] Starting active request to endpoint /api/leanscrape/${activeTab}...`);

    let bodyPayload: any = {};
    let endpointUrl = `/api/leanscrape/${activeTab}`;

    if (activeTab === "scrape") {
      bodyPayload = { 
        url: targetUrl, 
        formats: outputFormats,
        options: {
          onlyMainContent,
          ...(waitForDelay > 0 ? { waitFor: waitForDelay } : {}),
          mobile: mobileEmulation
        }
      };
    } else if (activeTab === "search") {
      bodyPayload = { query: searchQuery, limit: searchLimit };
    } else if (activeTab === "crawl") {
      bodyPayload = { 
        url: targetUrl, 
        limit: crawlLimit,
        onlyMainContent: crawlOptions.onlyMainContent,
        allowExternalLinks: crawlOptions.allowExternalLinks,
        ignoreSitemap: crawlOptions.ignoreSitemap,
      };
    } else if (activeTab === "map") {
      bodyPayload = { 
        url: targetUrl,
        includeSubdomains: mapOptions.includeSubdomains,
        ignoreSitemap: mapOptions.ignoreSitemap,
        ...(mapOptions.search ? { search: mapOptions.search } : {}),
      };
    } else if (activeTab === "clone") {
      bodyPayload = {
        url: targetUrl,
        options: {
          depth: cloneOptions.depth,
          force_tool: cloneOptions.forceTool,
          include_assets: true
        }
      };
    }

    const startTime = Date.now();

    try {
      addDevLog(`[SECURITY] Executing smart SSRF check on target host...`);
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-firecrawl-api-key": activeApiKey,
        },
        body: JSON.stringify(bodyPayload),
      });

      const json = await response.json();
      const endTime = Date.now();
      const duration = endTime - startTime;
      setLatencyMs(duration);

      if (!response.ok || !json.success) {
        throw new Error(json.error || `HTTP error! status: ${response.status}`);
      }

      if (activeTab === "clone") {
        const jobId = json.data.project_id;
        addDevLog(`[CLONE] Job #${jobId} queued. Starting status polling...`);
        setProgressPercent(10);
        
        const pollInterval = setInterval(async () => {
          try {
            const pollRes = await fetch(`/api/leanscrape/clone-status?jobId=${jobId}`);
            if (pollRes.ok) {
              const pollJson = await pollRes.json();
              if (pollJson.success) {
                const statusData = pollJson.data;
                setProgressPercent(statusData.progress_percent || 10);
                addDevLog(`[CLONE] Stage: ${statusData.current_stage || "running"} (${statusData.progress_percent}%)`);
                
                if (statusData.status === "completed") {
                  clearInterval(pollInterval);
                  const resultRes = await fetch(`/api/leanscrape/clone-result?jobId=${jobId}`);
                  if (resultRes.ok) {
                    const resultJson = await resultRes.json();
                    if (resultJson.success) {
                      setResultData(resultJson.data);
                      setStatus("success");
                      addDevLog(`[SUCCESS] Cloned website successfully.`);
                      
                      // Deduct credits
                      const nextCredits = mockDb.deductCredits(json.creditsDeducted);
                      setCredits(nextCredits);
                      if (nextCredits <= 0) {
                        setShowLimitModal(true);
                      }
                      
                      // Log history
                      mockDb.addHistory(
                        "CLONE",
                        targetUrl,
                        "200 OK",
                        json.creditsDeducted,
                        JSON.stringify(resultJson.data)
                      );
                      setHistory(mockDb.getHistory());
                    }
                  }
                } else if (statusData.status === "failed") {
                  clearInterval(pollInterval);
                  setStatus("error");
                  setErrorMsg("Kloning gagal karena error internal di decant engine.");
                  addDevLog(`[ERROR] Cloner failed.`);
                }
              }
            }
          } catch (pollErr: any) {
            console.error("Polling error:", pollErr);
          }
        }, 1500);

        setResultTab("markdown");
        setMobileView("result");
        return;
      }

      // Hitung ukuran payload
      const responseStr = JSON.stringify(json.data);
      const sizeInKb = (responseStr.length / 1024).toFixed(2);
      setResponseSize(`${sizeInKb} KB`);

      // Berhasil
      setResultData(json.data);
      setStatus("success");
      addDevLog(`[SUCCESS] Extracted ${sizeInKb} KB payload in ${duration}ms.`);
      
      // Update sisa kredit
      const nextCredits = mockDb.deductCredits(json.creditsDeducted);
      setCredits(nextCredits);
      if (nextCredits <= 0) {
        setShowLimitModal(true);
      }

      // Log ke riwayat
      const urlText = activeTab === "search" ? `query: '${searchQuery}'` : targetUrl;
      const newHistoryItem = mockDb.addHistory(
        activeTab.toUpperCase(),
        urlText,
        "200 OK",
        json.creditsDeducted,
        responseStr.length > 500 ? responseStr.substring(0, 500) + "..." : responseStr
      );
      setHistory(mockDb.getHistory());

      // Pindahkan view hasil ke markdown / json / html tergantung apa yg ada
      if (activeTab === "search" || activeTab === "map" || activeTab === "crawl") {
        setResultTab("json");
      } else if (outputFormats.includes("markdown")) {
        setResultTab("markdown");
      } else if (outputFormats.includes("rawHtml")) {
        setResultTab("rawHtml");
      } else if (outputFormats.includes("html")) {
        setResultTab("html");
      } else if (outputFormats.includes("links")) {
        setResultTab("links");
      } else {
        setResultTab("json");
      }

      // Di mobile, auto-switch ke panel hasil
      setMobileView("result");

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Gagal memanggil API. Harap periksa koneksi internet Anda.");
      addDevLog(`[ERROR] API Call failed: ${err.message}`);
      
      // Log riwayat gagal
      const urlText = activeTab === "search" ? `query: '${searchQuery}'` : targetUrl;
      mockDb.addHistory(activeTab.toUpperCase(), urlText, "500 Error", 0, err.message);
      setHistory(mockDb.getHistory());
      setMobileView("result");
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    const endType = item.endpoint.toLowerCase() as EndpointType;
    if (endType !== "scrape" && endType !== "search" && endType !== "crawl" && endType !== "map") {
      setActiveTab("scrape"); // Fallback
    } else {
      setActiveTab(endType);
    }
    if (item.endpoint === "SEARCH") {
      setSearchQuery(item.targetUrl.replace("query: '", "").replace("'", ""));
    } else {
      setTargetUrl(item.targetUrl);
    }
    
    // Tampilkan data riwayat jika ada
    if (item.responsePreview) {
      try {
        const cleanedText = item.responsePreview.endsWith("...") 
          ? item.responsePreview.substring(0, item.responsePreview.length - 3) 
          : item.responsePreview;
        setResultData(JSON.parse(cleanedText));
        setStatus("success");
      } catch (e) {
        setResultData({ preview: item.responsePreview });
        setStatus("success");
      }
    } else {
      setResultData(null);
      setStatus("idle");
    }
    setMobileView("form");
    addDevLog(`[HISTORY] Loaded previous request parameters for ${item.endpoint}.`);
  };

  // HTML Formatter Function (Pretty Print)
  const formatHtml = (htmlStr: string): string => {
    if (!htmlStr) return "";
    try {
      let formatted = "";
      let reg = /(>)(<)(\/*)/g;
      let tempHtml = htmlStr.replace(reg, "$1\r\n$2$3");
      let pad = 0;
      tempHtml.split("\r\n").forEach((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (node.match(/^<\/\w/)) {
          if (pad !== 0) pad -= 1;
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
          indent = 1;
        } else {
          indent = 0;
        }
        let padding = "";
        for (let i = 0; i < pad; i++) padding += "  ";
        formatted += padding + node + "\n";
        pad += indent;
      });
      return formatted.trim();
    } catch {
      return htmlStr;
    }
  };

  const handleCopyResult = () => {
    let textToCopy = "";
    if (resultTab === "markdown") {
      textToCopy = resultData?.data?.markdown || resultData?.markdown || "";
    } else if (resultTab === "html") {
      textToCopy = formatHtml(resultData?.data?.html || resultData?.html || "");
    } else if (resultTab === "rawHtml") {
      textToCopy = formatHtml(resultData?.data?.rawHtml || resultData?.rawHtml || "");
    } else if (resultTab === "links") {
      textToCopy = (resultData?.data?.links || resultData?.links || []).join("\n");
    } else {
      textToCopy = JSON.stringify(resultData, null, 2);
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addDevLog(`[SYSTEM] Copied output buffer of ${resultTab} to clipboard.`);
  };

  const handleDownloadResult = () => {
    let content = "";
    let filename = `leanscrape_${activeTab}`;
    let mimeType = "text/plain";

    if (resultTab === "markdown") {
      content = resultData?.data?.markdown || resultData?.markdown || "";
      filename += ".md";
      mimeType = "text/markdown";
    } else if (resultTab === "html") {
      content = formatHtml(resultData?.data?.html || resultData?.html || "");
      filename += "_clean.html";
      mimeType = "text/html";
    } else if (resultTab === "rawHtml") {
      content = formatHtml(resultData?.data?.rawHtml || resultData?.rawHtml || "");
      filename += "_raw.html";
      mimeType = "text/html";
    } else if (resultTab === "links") {
      content = (resultData?.data?.links || resultData?.links || []).join("\n");
      filename += "_links.txt";
      mimeType = "text/plain";
    } else if (resultTab === "json") {
      content = JSON.stringify(resultData, null, 2);
      filename += ".json";
      mimeType = "application/json";
    } else if (resultTab === "screenshot") {
      const screenshotUrl = resultData?.data?.screenshot || resultData?.screenshot;
      if (screenshotUrl) {
        window.open(screenshotUrl, "_blank");
        return;
      }
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addDevLog(`[SYSTEM] File downloaded: ${filename}`);
  };

  const handleDownloadMcpConfig = () => {
    const config = {
      mcpServers: {
        leanscrape: {
          command: "node",
          args: ["-e", "console.log('LeanScrape MCP Server placeholder')"],
          env: {
            LEANSCRAPE_API_KEY: activeApiKey || "YOUR_KEY_HERE"
          }
        }
      }
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "leanscrape_mcp_config.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addDevLog("[SYSTEM] Downloaded MCP server configuration JSON.");
  };

  const handleDownloadAgentPrompt = () => {
    const prompt = `System Tool: LeanScrape Scraper
To use LeanScrape to fetch web context, make a POST request to:
https://leanscrape.dev/api/leanscrape/scrape
Headers:
- Content-Type: application/json
- x-firecrawl-api-key: ${activeApiKey || "<YOUR_FIRECRAWL_KEY>"}
Body:
{
  "url": "<TARGET_URL>",
  "formats": ["markdown", "rawHtml", "links"]
}
`;
    const blob = new Blob([prompt], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "leanscrape_agent_prompt.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addDevLog("[SYSTEM] Downloaded Agentic Integration Prompt instructions.");
  };

  const formatOptionsToggle = (format: string) => {
    if (outputFormats.includes(format)) {
      if (outputFormats.length > 1) {
        setOutputFormats(outputFormats.filter(f => f !== format));
      }
    } else {
      setOutputFormats([...outputFormats, format]);
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "id" : "en";
    setLang(nextLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("ls-lang", nextLang);
    }
    addDevLog(`[SYSTEM] Language switched to: ${nextLang.toUpperCase()}`);
    
    // Show toast
    setShowLangToast(true);
    setTimeout(() => setShowLangToast(false), 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addDevLog("[SYSTEM] Copied API Key value to clipboard.");
    alert(lang === "en" ? "Copied key to clipboard!" : "Kunci berhasil disalin ke clipboard!");
  };

  return (
    <main className="min-h-screen bg-bg text-white font-sans flex flex-col relative">
      <div className="scanline opacity-10" />

      {/* Language Saved Toast Banner */}
      {showLangToast && (
        <div className="fixed top-6 right-6 z-50 p-3 rounded border border-green-500 bg-[#070b08] text-green-400 font-mono text-[10px] flex items-center gap-2 shadow-glow animate-fade-in-down">
          <ShieldCheck size={14} />
          <span>{lang === "en" ? "LANGUAGE SETTINGS SAVED!" : "PENGATURAN BAHASA DISIMPAN!"}</span>
        </div>
      )}

      {/* Credit Limit Alert Modal (Bilingual) */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-lg border border-red-500 bg-[#0d0a0d] p-6 relative font-mono text-center space-y-4">
            <div className="corner-brackets" />
            <ShieldAlert size={36} className="text-red-500 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">{t.creditsResetAlert}</h3>
            <p className="text-xs text-gray-300 leading-normal">{t.creditsResetDesc}</p>
            <button
              onClick={() => setShowLimitModal(false)}
              className="w-full py-2 bg-red-500/20 border border-red-500 hover:bg-red-500 hover:text-bg text-red-400 text-xs font-bold transition-all focus:outline-none"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Custom API Key Manager Modal (Max 5 Keys) */}
      {showKeyManager && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-[#0d0c11] p-6 relative font-mono space-y-5">
            <div className="corner-brackets" />
            
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                <Settings size={14} className="text-primary animate-pulse" />
                <span>Firecrawl API Key Manager ({savedApiKeys.length}/5)</span>
              </h3>
              <button 
                onClick={() => setShowKeyManager(false)} 
                className="text-text-muted hover:text-white text-xs"
              >
                [X]
              </button>
            </div>

            {/* List of Keys */}
            <div className="space-y-2">
              <span className="text-[9px] text-text-muted">// REGISTERED_KEYS</span>
              {savedApiKeys.length === 0 ? (
                <p className="text-[10px] text-gray-500 italic p-3 border border-dashed border-border/30 rounded text-center">
                  {lang === "en" ? "No API keys saved. Add one below." : "Belum ada API key tersimpan. Tambah di bawah."}
                </p>
              ) : (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {savedApiKeys.map((item) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "p-2.5 rounded border text-[10px] flex items-center justify-between transition-colors",
                        activeApiKey === item.key 
                          ? "bg-primary/10 border-primary" 
                          : "bg-bg-elevated/20 border-border/30"
                      )}
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white truncate block">{item.name}</span>
                          {activeApiKey === item.key && (
                            <span className="bg-primary/20 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded">ACTIVE</span>
                          )}
                        </div>
                        <span className="text-text-muted font-sans select-all truncate block mt-0.5">{item.key.substring(0, 12)}••••••••</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSelectApiKey(item.key)}
                          className="px-2 py-1 rounded bg-[#09070a] border border-border hover:border-primary text-text-muted hover:text-primary transition-colors text-[9px]"
                        >
                          {lang === "en" ? "Select" : "Pilih"}
                        </button>
                        <button
                          onClick={() => copyToClipboard(item.key)}
                          className="p-1 rounded bg-[#09070a] border border-border hover:border-accent text-text-muted hover:text-accent transition-colors"
                          title="Copy Key"
                        >
                          <Copy size={11} />
                        </button>
                        <button
                          onClick={() => handleDeleteApiKey(item.id)}
                          className="p-1 rounded bg-red-500/10 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-red-500 transition-colors"
                          title="Delete Key"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Key Form */}
            {savedApiKeys.length < 5 ? (
              <div className="space-y-3 pt-3 border-t border-border/20">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-text-muted">// REGISTER_NEW_KEY</span>
                  <a
                    href="https://firecrawl.dev/app/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-primary underline flex items-center gap-0.5 hover:text-white"
                  >
                    {lang === "en" ? "Get Firecrawl Key" : "Dapatkan Kunci"} <Globe size={8} />
                  </a>
                </div>
                <div className="space-y-2 text-[10px]">
                  <input
                    type="text"
                    placeholder={lang === "en" ? "Alias (e.g. My Prod Key)" : "Nama alias (misal: Kunci Prod)"}
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-[#08070A] border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                  <input
                    type="password"
                    placeholder="fc-xxxx..."
                    value={newKeyVal}
                    onChange={(e) => setNewKeyVal(e.target.value)}
                    className="w-full bg-[#08070A] border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleAddApiKey}
                    className="w-full py-2 bg-primary text-white font-bold rounded hover:shadow-glow text-[10px] uppercase transition-all focus:outline-none"
                  >
                    + {lang === "en" ? "Add Key" : "Tambah Kunci"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-500/5 border border-red-500/20 rounded text-[9px] text-red-400 text-center font-sans">
                {lang === "en"
                  ? "Maximum limit of 5 API keys reached. You must delete an existing key to register a new one."
                  : "Batas maksimum 5 API key tercapai. Hapus salah satu API key lama untuk menambahkan kunci baru."}
              </div>
            )}

            <button
              onClick={() => setShowKeyManager(false)}
              className="w-full py-2 bg-[#09070a] border border-border hover:bg-white/5 text-white text-[10px] uppercase font-bold transition-all focus:outline-none"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Header Playground */}
      <header className="border-b border-border bg-bg-elevated/40 backdrop-blur-md px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-text-muted hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline font-mono text-xs">{t.backToHome}</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm font-bold font-mono tracking-wider flex items-center gap-1.5">
            <Terminal size={14} className="text-primary animate-pulse" />
            <span>{t.playgroundTitle}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded border border-border bg-bg-elevated/35 hover:text-white text-text-muted font-mono text-[10px] uppercase font-bold focus:outline-none flex items-center gap-1"
            title="Switch Language / Ubah Bahasa (Saved)"
          >
            {lang === "en" ? "EN | ID" : "ID | EN"}
          </button>

          {/* Credit balance display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-bg-elevated/50 text-[11px] font-mono">
            <Database size={12} className="text-accent" />
            <span className="text-text-muted">{t.balance}:</span>
            <span className="text-white font-bold">{credits} Cr</span>
          </div>

          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* 1. Sidebar Kiri: Pilihan Endpoint & Riwayat */}
        <div className="lg:col-span-3 border-r border-border bg-bg-elevated/10 p-5 flex flex-col justify-between overflow-y-auto max-h-[30vh] lg:max-h-none shrink-0">
            <p className="text-[10px] text-accent font-mono uppercase mb-4 tracking-widest flex items-center gap-1.5">
              <Layers size={11} className="animate-spin text-accent" />
              <span>{t.selectEndpoint} (CLICK TO SWITCH ENGINE)</span>
            </p>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 font-mono">
              
              {/* Button Scrape */}
              <button
                onClick={() => { setActiveTab("scrape"); setMobileView("form"); }}
                className={cn(
                  "w-full flex flex-col gap-1.5 px-4 py-3 rounded text-left border transition-all shrink-0 lg:shrink select-none",
                  activeTab === "scrape"
                    ? "border-primary bg-primary/10 text-white shadow-glow"
                    : "border-border/30 text-text-muted bg-black/20 hover:bg-white/5 hover:text-white hover:border-border/60"
                )}
              >
                <div className="flex items-center gap-2">
                  <Globe size={14} className={activeTab === "scrape" ? "text-primary animate-pulse" : ""} />
                  <span className="text-xs font-bold font-mono tracking-wide">POST /v2/scrape</span>
                </div>
                <span className="hidden lg:block text-[9px] text-gray-500 font-sans leading-relaxed">
                  Single URL extraction. Get Markdown, screenshots, clean HTML & backlinks.
                </span>
              </button>

              {/* Button Search */}
              <button
                onClick={() => { setActiveTab("search"); setMobileView("form"); }}
                className={cn(
                  "w-full flex flex-col gap-1.5 px-4 py-3 rounded text-left border transition-all shrink-0 lg:shrink select-none",
                  activeTab === "search"
                    ? "border-primary bg-primary/10 text-white shadow-glow"
                    : "border-border/30 text-text-muted bg-black/20 hover:bg-white/5 hover:text-white hover:border-border/60"
                )}
              >
                <div className="flex items-center gap-2">
                  <Search size={14} className={activeTab === "search" ? "text-primary animate-pulse" : ""} />
                  <span className="text-xs font-bold font-mono tracking-wide">POST /v2/search</span>
                </div>
                <span className="hidden lg:block text-[9px] text-gray-500 font-sans leading-relaxed">
                  Query web intelligence. Search the web and return top markdown results.
                </span>
              </button>

              {/* Button Crawl */}
              <button
                onClick={() => { setActiveTab("crawl"); setMobileView("form"); }}
                className={cn(
                  "w-full flex flex-col gap-1.5 px-4 py-3 rounded text-left border transition-all shrink-0 lg:shrink select-none",
                  activeTab === "crawl"
                    ? "border-primary bg-primary/10 text-white shadow-glow"
                    : "border-border/30 text-text-muted bg-black/20 hover:bg-white/5 hover:text-white hover:border-border/60"
                )}
              >
                <div className="flex items-center gap-2">
                  <RotateCw size={14} className={activeTab === "crawl" ? "text-primary animate-pulse" : ""} />
                  <span className="text-xs font-bold font-mono tracking-wide">POST /v2/crawl</span>
                </div>
                <span className="hidden lg:block text-[9px] text-gray-500 font-sans leading-relaxed">
                  Deep recursive engine. Map and scrape subpages up to custom limits.
                </span>
              </button>

              {/* Button Map */}
              <button
                onClick={() => { setActiveTab("map"); setMobileView("form"); }}
                className={cn(
                  "w-full flex flex-col gap-1.5 px-4 py-3 rounded text-left border transition-all shrink-0 lg:shrink select-none",
                  activeTab === "map"
                    ? "border-primary bg-primary/10 text-white shadow-glow"
                    : "border-border/30 text-text-muted bg-black/20 hover:bg-white/5 hover:text-white hover:border-border/60"
                )}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={14} className={activeTab === "map" ? "text-primary animate-pulse" : ""} />
                  <span className="text-xs font-bold font-mono tracking-wide">POST /v2/map</span>
                </div>
                <span className="hidden lg:block text-[9px] text-gray-500 font-sans leading-relaxed">
                  Sitemap discovery. Extract link list hierarchical structure of domains.
                </span>
              </button>

              {/* Button Clone */}
              <button
                onClick={() => { setActiveTab("clone"); setMobileView("form"); }}
                className={cn(
                  "w-full flex flex-col gap-1.5 px-4 py-3 rounded text-left border transition-all shrink-0 lg:shrink select-none",
                  activeTab === "clone"
                    ? "border-primary bg-primary/10 text-white shadow-glow"
                    : "border-border/30 text-text-muted bg-black/20 hover:bg-white/5 hover:text-white hover:border-border/60"
                )}
              >
                <div className="flex items-center gap-2">
                  <Database size={14} className={activeTab === "clone" ? "text-primary animate-pulse" : ""} />
                  <span className="text-xs font-bold font-mono tracking-wide">POST /v2/clone</span>
                </div>
                <span className="hidden lg:block text-[9px] text-gray-500 font-sans leading-relaxed">
                  Stealth cloner engine. Clone assets, offline preview, ZIP files & AI orchestration.
                </span>
              </button>
            </div>          </div>
          </div>

          {/* Sidebar Riwayat (Tampil di desktop) */}
          <div className="hidden lg:block border-t border-border/40 pt-6 mt-6">
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono uppercase mb-3">
              <History size={12} />
              <span>{t.requestHistory}</span>
            </div>
            {history.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic font-sans">{t.noHistory}</p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-left p-2 rounded border border-border/30 bg-bg-elevated/20 hover:bg-white/5 transition-colors font-mono text-[9px] flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "px-1 py-0.5 rounded text-[8px] font-bold",
                        item.status.includes("OK") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {item.endpoint}
                      </span>
                      <span className="text-[8px] text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <span className="text-white truncate block">{item.targetUrl}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile View selector (Form vs Hasil) */}
        <div className="lg:hidden flex border-b border-border font-mono text-xs shrink-0">
          <button
            onClick={() => setMobileView("form")}
            className={cn("flex-1 py-3 text-center border-b-2", mobileView === "form" ? "border-primary text-white font-bold" : "border-transparent text-text-muted")}
          >
            Form Params
          </button>
          <button
            onClick={() => setMobileView("result")}
            className={cn("flex-1 py-3 text-center border-b-2", mobileView === "result" ? "border-primary text-white font-bold" : "border-transparent text-text-muted")}
          >
            Output Result
          </button>
        </div>

        {/* 2. Main Content Stack: Form & Output Stacked Vertically */}
        <div className="lg:col-span-9 flex flex-col gap-6 p-6 overflow-y-auto">
          
          {/* Top Panel: Form Params */}
          <div className={cn(
            "rounded-lg border border-border bg-bg-elevated/20 p-6 relative flex flex-col justify-between",
            mobileView === "form" ? "block" : "hidden lg:block"
          )}>
            <div className="corner-brackets" />
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border/30 pb-3">
                <h2 className="text-sm font-bold font-mono text-white flex items-center gap-1.5 uppercase">
                  <Layers size={14} className="text-accent animate-pulse" />
                  <span>{t.formParams}</span>
                </h2>
                <div className="corner-brackets-top-right !top-2 !right-2" />
              </div>

              {/* Firecrawl API Key Input (Wajib menggunakan Key Sendiri dengan Maks 5 Keys) */}
              <div className="space-y-2 p-3.5 border border-primary/20 bg-primary/5 rounded relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-mono text-primary font-bold flex items-center gap-1">
                    <Settings size={12} />
                    <span>{t.apiKeyLabel}</span>
                  </label>
                  <button
                    onClick={() => setShowKeyManager(true)}
                    className="text-[10px] text-accent underline flex items-center gap-1 hover:text-white font-mono focus:outline-none"
                  >
                    <span>[ {lang === "en" ? "MANAGE KEYS" : "KELOLA KUNCI"} ({savedApiKeys.length}/5) ]</span>
                  </button>
                </div>

                {savedApiKeys.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] text-red-400 font-mono italic">
                      {lang === "en" ? "No Firecrawl keys registered. Click below to add." : "Belum ada kunci Firecrawl terdaftar. Klik di bawah."}
                    </p>
                    <button
                      onClick={() => setShowKeyManager(true)}
                      className="w-full py-1.5 rounded border border-accent bg-accent/10 hover:bg-accent/20 text-accent text-[10px] font-bold font-mono transition-colors focus:outline-none"
                    >
                      + ADD FIRECRAWL API KEY
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={activeApiKey}
                      onChange={(e) => handleSelectApiKey(e.target.value)}
                      className="flex-1 text-xs font-mono bg-[#08070A] border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
                    >
                      {savedApiKeys.map((k) => (
                        <option key={k.id} value={k.key}>
                          {k.name} ({k.key.substring(0, 8)}...)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <p className="text-[9px] text-text-muted font-sans mt-1">{t.apiKeyHint}</p>
                <div className="mt-2.5">
                  <a
                    href="https://firecrawl.dev/app/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 rounded border border-accent/30 bg-accent/5 hover:bg-accent/15 text-accent text-[9px] font-bold font-mono transition-colors flex items-center justify-center gap-1 focus:outline-none"
                  >
                    <Globe size={10} />
                    <span>{lang === "en" ? "OBTAIN FIRECRAWL API KEY" : "AMBIL API KEY FIRECRAWL"}</span>
                  </a>
                </div>
              </div>

              {/* Target URL Input (Digunakan untuk semua kecuali search) */}
              {activeTab !== "search" && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-400">{t.targetUrl}</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full text-sm font-mono bg-[#08070A] border border-border rounded px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      placeholder="example.com"
                    />
                  </div>
                </div>
              )}

              {/* Search Query (Hanya untuk search) */}
              {activeTab === "search" && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-400">{t.searchQuery}</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm font-mono bg-[#08070A] border border-border rounded px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    placeholder="nextjs 14 speeds"
                  />
                </div>
              )}

              {/* Scrape Output formats checkboxes - Horizontal Scrollable on Mobile */}
              {activeTab === "scrape" && (
                <div className="space-y-3">
                  <label className="block text-xs font-mono text-gray-400">{t.outputFormats}</label>
                  
                  {/* Container scrollable horizontal */}
                  <div className="flex flex-row overflow-x-auto whitespace-nowrap gap-4 pb-2 font-mono text-xs scrollbar-none border-b border-border/10">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={outputFormats.includes("markdown")}
                        onChange={() => formatOptionsToggle("markdown")}
                        className="accent-primary"
                      />
                      <span>markdown</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={outputFormats.includes("html")}
                        onChange={() => formatOptionsToggle("html")}
                        className="accent-primary"
                      />
                      <span>html (clean)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={outputFormats.includes("rawHtml")}
                        onChange={() => formatOptionsToggle("rawHtml")}
                        className="accent-primary"
                      />
                      <span className="text-accent font-semibold">rawHtml</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={outputFormats.includes("links")}
                        onChange={() => formatOptionsToggle("links")}
                        className="accent-primary"
                      />
                      <span>links</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={outputFormats.includes("screenshot")}
                        onChange={() => formatOptionsToggle("screenshot")}
                        className="accent-primary"
                      />
                      <span>screenshot</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={outputFormats.includes("screenshot@fullPage")}
                        onChange={() => formatOptionsToggle("screenshot@fullPage")}
                        className="accent-primary"
                      />
                      <span>screenshot@fullPage</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Advanced Scrape Settings */}
              {activeTab === "scrape" && (
                <div className="border border-border/20 bg-bg-elevated/10 p-3 rounded space-y-3 font-sans text-xs">
                  <div className="text-[10px] font-mono text-accent uppercase tracking-wider">// ADVANCED SETTINGS</div>
                  
                  {/* onlyMainContent Toggle */}
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-gray-300">
                      {lang === "en" ? "Extract Only Main Content" : "Ekstrak Hanya Konten Utama"}
                    </span>
                    <input
                      type="checkbox"
                      checked={onlyMainContent}
                      onChange={(e) => setOnlyMainContent(e.target.checked)}
                      className="accent-primary w-4 h-4 cursor-pointer"
                    />
                  </label>
                  
                  {/* mobileEmulation Toggle */}
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-gray-300">
                      {lang === "en" ? "Mobile Device Emulation" : "Emulasi Perangkat Seluler"}
                    </span>
                    <input
                      type="checkbox"
                      checked={mobileEmulation}
                      onChange={(e) => setMobileEmulation(e.target.checked)}
                      className="accent-primary w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* waitFor Input */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-300">
                      {lang === "en" ? "Wait For Dynamic Load (ms)" : "Jeda Pemuatan Halaman (ms)"}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="15000"
                      step="500"
                      value={waitForDelay}
                      onChange={(e) => setWaitForDelay(Number(e.target.value))}
                      className="w-20 text-center font-mono bg-[#08070A] border border-border rounded px-2 py-1 text-white focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Crawl Options */}
              {activeTab === "crawl" && (
                <div className="border border-border/20 bg-bg-elevated/10 p-3 rounded space-y-3 font-sans text-xs">
                  <div className="text-[10px] font-mono text-accent uppercase tracking-wider">// CRAWL OPTIONS</div>
                  <div className="space-y-1">
                    <label className="block text-gray-400 text-[10px] font-mono">{t.crawlLimit}</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={crawlLimit}
                      onChange={(e) => setCrawlLimit(Number(e.target.value))}
                      className="w-full text-xs font-mono bg-[#08070A] border border-border rounded px-2.5 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-gray-300">Allow External Links</span>
                    <input 
                      type="checkbox" 
                      checked={crawlOptions.allowExternalLinks} 
                      onChange={(e) => setCrawlOptions(p => ({...p, allowExternalLinks: e.target.checked}))} 
                      className="accent-primary w-4 h-4" 
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-gray-300">Ignore Sitemap</span>
                    <input 
                      type="checkbox" 
                      checked={crawlOptions.ignoreSitemap} 
                      onChange={(e) => setCrawlOptions(p => ({...p, ignoreSitemap: e.target.checked}))} 
                      className="accent-primary w-4 h-4" 
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-gray-300">Only Main Content</span>
                    <input 
                      type="checkbox" 
                      checked={crawlOptions.onlyMainContent} 
                      onChange={(e) => setCrawlOptions(p => ({...p, onlyMainContent: e.target.checked}))} 
                      className="accent-primary w-4 h-4" 
                    />
                  </label>
                </div>
              )}

              {/* Map Options */}
              {activeTab === "map" && (
                <div className="border border-border/20 bg-bg-elevated/10 p-3 rounded space-y-3 font-sans text-xs">
                  <div className="text-[10px] font-mono text-accent uppercase tracking-wider">// MAP OPTIONS</div>
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-gray-300">Include Subdomains</span>
                    <input 
                      type="checkbox" 
                      checked={mapOptions.includeSubdomains} 
                      onChange={(e) => setMapOptions(p => ({...p, includeSubdomains: e.target.checked}))} 
                      className="accent-primary w-4 h-4" 
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-gray-300">Ignore Sitemap</span>
                    <input 
                      type="checkbox" 
                      checked={mapOptions.ignoreSitemap} 
                      onChange={(e) => setMapOptions(p => ({...p, ignoreSitemap: e.target.checked}))} 
                      className="accent-primary w-4 h-4" 
                    />
                  </label>
                  <div className="space-y-1">
                    <label className="block text-gray-400 text-[10px] font-mono">Filter by Keyword (optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. pricing, blog" 
                      value={mapOptions.search} 
                      onChange={(e) => setMapOptions(p => ({...p, search: e.target.value}))}
                      className="w-full font-mono bg-[#08070A] border border-border rounded px-2.5 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-xs" 
                    />
                  </div>
                </div>
              )}

              {/* Clone Options */}
              {activeTab === "clone" && (
                <div className="border border-border/20 bg-bg-elevated/10 p-3 rounded space-y-3 font-sans text-xs">
                  <div className="text-[10px] font-mono text-accent uppercase tracking-wider">// CLONE OPTIONS</div>
                  <div className="space-y-1">
                    <label className="block text-gray-400 text-[10px] font-mono">Max Depth (levels)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={cloneOptions.depth} 
                      onChange={(e) => setCloneOptions(p => ({...p, depth: Number(e.target.value)}))}
                      className="w-full text-xs font-mono bg-[#08070A] border border-border rounded px-2.5 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-400 text-[10px] font-mono">Engine Tool</label>
                    <div className="flex gap-1 font-mono">
                      {["auto", "decant", "site-cloner"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCloneOptions(p => ({...p, forceTool: t}))}
                          className={cn(
                            "flex-1 py-1 rounded border text-[9px] font-bold text-center transition-all",
                            cloneOptions.forceTool === t 
                              ? "border-primary bg-primary/10 text-white" 
                              : "border-border/30 bg-black/20 text-text-muted hover:border-border/60 hover:text-white"
                          )}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Options */}
              {activeTab === "search" && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-400">Result Limit (max 10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(Number(e.target.value))}
                    className="w-full text-sm font-mono bg-[#08070A] border border-border rounded px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
              )}

            </div>

            {/* Run Button */}
            <div className="pt-6 border-t border-border/30 mt-6">
              <button
                onClick={handleRun}
                disabled={status === "running"}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded text-xs font-bold font-mono text-white transition-all focus:outline-none",
                  status === "running"
                    ? "bg-primary/20 border border-primary/40 cursor-not-allowed"
                    : "bg-primary hover:shadow-glow hover:scale-[1.01] border border-primary"
                )}
              >
                {status === "running" ? (
                  <>
                    <RotateCw size={14} className="animate-spin text-accent" />
                    <span>{t.runningRequest}</span>
                  </>
                ) : (
                  <>
                    <Play size={14} fill="currentColor" />
                    <span>{t.executeRequest}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Panel: Output Result */}
          <div className={cn(
            "rounded-lg border border-border bg-[#070609] p-6 relative flex flex-col min-h-[450px]",
            mobileView === "result" ? "block" : "hidden lg:block"
          )}>
            <div className="corner-brackets" />

            {/* Simulated Progress Bar */}
            {status === "running" && (
              <div className="absolute top-0 left-0 w-full h-1 bg-border/20 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            <div className="flex-1 flex flex-col h-full">
              {/* Tab view selector & utilities */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-3 mb-4 gap-3">
                
                {/* Horizontal Scrollable Tabs on Mobile */}
                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-1 sm:pb-0">
                  {status === "success" && resultData && (
                    <>
                      {/* Search/Map/Crawl Custom Visual Tabs */}
                      {(activeTab === "search" || activeTab === "map" || activeTab === "crawl" || activeTab === "clone") && (
                        <button
                          onClick={() => setResultTab("markdown")}
                          className={cn(
                            "px-2.5 py-1.5 rounded text-xs font-mono transition-colors",
                            resultTab !== "json" ? "bg-accent/25 text-white font-bold" : "text-text-muted hover:text-white"
                          )}
                        >
                          [ VISUAL REPORT ]
                        </button>
                      )}

                      {/* Markdown tab */}
                      {activeTab !== "search" && activeTab !== "map" && activeTab !== "crawl" && activeTab !== "clone" && (resultData?.data?.markdown || resultData?.markdown) && (
                        <button
                          onClick={() => setResultTab("markdown")}
                          className={cn(
                            "px-2.5 py-1.5 rounded text-xs font-mono transition-colors",
                            resultTab === "markdown" ? "bg-accent/25 text-white" : "text-text-muted hover:text-white"
                          )}
                        >
                          [ MARKDOWN ]
                        </button>
                      )}

                      {/* Cleaned HTML tab */}
                      {activeTab !== "search" && activeTab !== "map" && activeTab !== "crawl" && activeTab !== "clone" && (resultData?.data?.html || resultData?.html) && (
                        <button
                          onClick={() => setResultTab("html")}
                          className={cn(
                            "px-2.5 py-1.5 rounded text-xs font-mono transition-colors",
                            resultTab === "html" ? "bg-accent/25 text-white" : "text-text-muted hover:text-white"
                          )}
                        >
                          [ CLEAN HTML ]
                        </button>
                      )}

                      {/* Raw HTML tab */}
                      {activeTab !== "search" && activeTab !== "map" && activeTab !== "crawl" && activeTab !== "clone" && (resultData?.data?.rawHtml || resultData?.rawHtml) && (
                        <button
                          onClick={() => setResultTab("rawHtml")}
                          className={cn(
                            "px-2.5 py-1.5 rounded text-xs font-mono transition-colors",
                            resultTab === "rawHtml" ? "bg-accent/25 text-white" : "text-text-muted hover:text-white"
                          )}
                        >
                          [ RAW HTML ]
                        </button>
                      )}

                      {/* Links tab */}
                      {activeTab !== "search" && activeTab !== "map" && activeTab !== "crawl" && activeTab !== "clone" && (resultData?.data?.links || resultData?.links) && (
                        <button
                          onClick={() => setResultTab("links")}
                          className={cn(
                            "px-2.5 py-1.5 rounded text-xs font-mono transition-colors",
                            resultTab === "links" ? "bg-accent/25 text-white" : "text-text-muted hover:text-white"
                          )}
                        >
                          [ LINKS ]
                        </button>
                      )}
                      
                      <button
                        onClick={() => setResultTab("json")}
                        className={cn(
                          "px-2.5 py-1.5 rounded text-xs font-mono transition-colors",
                          resultTab === "json" ? "bg-accent/25 text-white font-bold" : "text-text-muted hover:text-white"
                        )}
                      >
                        [ RAW JSON ]
                      </button>

                      {/* Screenshot tab */}
                      {activeTab !== "search" && activeTab !== "map" && activeTab !== "crawl" && activeTab !== "clone" && (resultData?.data?.screenshot || resultData?.screenshot) && (
                        <button
                          onClick={() => setResultTab("screenshot")}
                          className={cn(
                            "px-2.5 py-1.5 rounded text-xs font-mono transition-colors",
                            resultTab === "screenshot" ? "bg-accent/25 text-white" : "text-text-muted hover:text-white"
                          )}
                        >
                          [ SCREENSHOT ]
                        </button>
                      )}
                    </>
                  )}
                  {status !== "success" && (
                    <h2 className="text-sm font-bold font-mono text-white flex items-center gap-1.5 uppercase">
                      <Layers size={14} className="text-accent animate-pulse" />
                      <span>{t.outputResult}</span>
                    </h2>
                  )}
                </div>

                {/* Utilities: Copy, Preview & Download */}
                <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
                  
                  {/* HTML Preview Mode Toggle */}
                  {status === "success" && (resultTab === "html" || resultTab === "rawHtml") && (
                    <div className="flex items-center border border-border/40 rounded overflow-hidden">
                      <button
                        onClick={() => setHtmlPreviewMode("code")}
                        className={cn(
                          "px-2 py-1 flex items-center gap-1 text-[10px]",
                          htmlPreviewMode === "code" ? "bg-primary/20 text-white font-bold" : "text-text-muted hover:text-white"
                        )}
                      >
                        <Terminal size={10} /> Code
                      </button>
                      <button
                        onClick={() => setHtmlPreviewMode("preview")}
                        className={cn(
                          "px-2 py-1 flex items-center gap-1 text-[10px]",
                          htmlPreviewMode === "preview" ? "bg-primary/20 text-white font-bold" : "text-text-muted hover:text-white"
                        )}
                      >
                        <Eye size={10} /> Preview
                      </button>
                    </div>
                  )}

                  {status === "success" && resultData && (
                    <>
                      {/* Download Button */}
                      <button
                        onClick={handleDownloadResult}
                        className="text-text-muted hover:text-white flex items-center gap-1 transition-colors focus:outline-none"
                        title="Download Output File"
                      >
                        <Download size={12} />
                        <span>{t.download}</span>
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={handleCopyResult}
                        className="text-text-muted hover:text-white flex items-center gap-1 transition-colors focus:outline-none"
                      >
                        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        <span>{copied ? t.copied : t.copy}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Display Body depending on status */}
              <div className="flex-1 relative flex flex-col justify-center min-h-[300px]">
                
                {/* 1. IDLE STATE */}
                {status === "idle" && (
                  <div className="text-center font-mono space-y-3 p-6 border border-border/20 rounded bg-bg-elevated/5 max-w-sm mx-auto">
                    <Terminal size={24} className="text-primary mx-auto animate-pulse" />
                    <p className="text-xs text-white font-bold font-sans">{t.systemReady}</p>
                    <p className="text-[10px] text-text-muted leading-relaxed font-sans">
                      {t.systemReadyDesc}
                    </p>
                  </div>
                )}

                {/* 2. RUNNING STATE */}
                {status === "running" && (
                  <div className="text-center font-mono space-y-4 max-w-sm mx-auto">
                    <div className="relative w-12 h-12 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-white uppercase font-bold tracking-widest">{t.runningProgress}</p>
                      <p className="text-[10px] text-accent animate-pulse">{LOADING_TEXTS[statusTextIdx]}</p>
                    </div>
                  </div>
                )}

                {/* 3. ERROR STATE */}
                {status === "error" && (
                  <div className="text-center font-mono space-y-3 p-6 border border-red-500/20 rounded bg-red-500/5 max-w-sm mx-auto">
                    <ShieldAlert size={24} className="text-red-400 mx-auto" />
                    <p className="text-xs font-bold text-red-400">{t.executionFailed}</p>
                    <p className="text-[10px] text-gray-400 leading-normal select-all">
                      {errorMsg}
                    </p>
                  </div>
                )}

                {/* 4. SUCCESS STATE */}
                {status === "success" && resultData && (
                  <div className="h-full flex-1 flex flex-col font-mono text-[11px] text-gray-300 leading-relaxed overflow-hidden select-text text-left">
                    
                    {/* Search Results Visual Renderer */}
                    {activeTab === "search" && resultTab !== "json" && (
                      <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4 pr-1 text-left">
                        <div className="text-[10px] text-accent font-mono border-b border-border/20 pb-2 flex justify-between">
                          <span>SEARCH_RESULTS</span>
                          <span>{((resultData?.data || resultData) && Array.isArray(resultData?.data || resultData) ? (resultData?.data || resultData) : []).length} results found</span>
                        </div>
                        {((resultData?.data || resultData) && Array.isArray(resultData?.data || resultData) ? (resultData?.data || resultData) : []).map((item: any, idx: number) => (
                          <div key={idx} className="border border-border/30 bg-bg-elevated/10 rounded p-4 space-y-2.5 hover:border-primary/40 transition-colors">
                            <div className="flex items-start gap-2">
                              <span className="text-[10px] text-accent font-mono mt-0.5">[{idx + 1}]</span>
                              <a href={item.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-bold text-primary hover:underline flex-1 leading-snug">
                                {item.title || item.url}
                              </a>
                            </div>
                            <a href={item.url} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-green-400 hover:underline font-mono truncate block">
                              {item.url}
                            </a>
                            {item.description && (
                              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{item.description}</p>
                            )}
                            {item.markdown && (
                              <details className="mt-1 border border-border/20 rounded bg-black/10 overflow-hidden">
                                <summary className="text-[9px] text-accent cursor-pointer font-mono px-3 py-1.5 hover:bg-white/5 select-none">[ VIEW CONTENT EXCERPT ]</summary>
                                <div className="text-[10px] text-gray-300 font-sans whitespace-pre-wrap max-h-40 overflow-y-auto p-3 border-t border-border/10">
                                  {item.markdown.substring(0, 1500)}{item.markdown.length > 1500 ? '...' : ''}
                                </div>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Map Results Visual Renderer */}
                    {activeTab === "map" && resultTab !== "json" && (
                      <div className="flex-1 overflow-y-auto max-h-[500px] space-y-3 pr-1 text-left">
                        <div className="text-[10px] text-accent font-mono border-b border-border/20 pb-2 flex justify-between">
                          <span>SITEMAP_DISCOVERY</span>
                          <span>{(resultData?.links || resultData?.urls || resultData?.data?.links || []).length} URLs discovered</span>
                        </div>
                        <div className="space-y-1">
                          {(resultData?.links || resultData?.urls || resultData?.data?.links || []).map((url: string, idx: number) => {
                            const urlObj = (() => { try { return new URL(url); } catch { return null; } })();
                            const path = urlObj ? urlObj.pathname + urlObj.search : url;
                            const depth = (url.match(/\//g) || []).length - 2;
                            return (
                              <div key={idx} className="flex items-center gap-2 hover:bg-white/5 rounded px-3 py-2 group transition-colors border border-border/10 bg-bg-elevated/5">
                                <span className="text-[9px] text-text-muted font-mono w-8 shrink-0">{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <a href={url} target="_blank" rel="noopener noreferrer"
                                    className="text-[11px] text-primary hover:underline font-mono truncate block group-hover:text-white transition-colors">
                                    {path || url}
                                  </a>
                                  <span className="text-[9px] text-text-muted block truncate mt-0.5">Depth: {depth} · {url}</span>
                                </div>
                                <a href={url} target="_blank" rel="noopener noreferrer"
                                  className="text-[10px] text-accent opacity-0 group-hover:opacity-100 transition-opacity font-mono shrink-0 px-2 py-0.5 rounded border border-accent/20 bg-accent/5">
                                  OPEN ↗
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Crawl Results Visual Renderer */}
                    {activeTab === "crawl" && resultTab !== "json" && (
                      <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4 pr-1 text-left">
                        <div className="text-[10px] text-accent font-mono border-b border-border/20 pb-2 flex flex-wrap gap-x-4 gap-y-1">
                          <span>CRAWL_RESULTS</span>
                          <span className="text-green-400">Status: {resultData?.status || "completed"}</span>
                          <span>{(resultData?.data || []).length} pages crawled</span>
                        </div>
                        {(resultData?.data || []).map((page: any, idx: number) => (
                          <div key={idx} className="border border-border/30 bg-bg-elevated/10 rounded p-4 space-y-3 hover:border-primary/40 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-[10px] text-accent font-mono mt-0.5 shrink-0">[PAGE {idx + 1}]</span>
                              <a href={page.metadata?.sourceURL || page.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-bold text-primary hover:underline truncate">
                                {page.metadata?.title || page.metadata?.sourceURL || page.url}
                              </a>
                            </div>
                            {page.metadata?.sourceURL && (
                              <a href={page.metadata.sourceURL} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-green-400 font-mono hover:underline truncate block">
                                {page.metadata.sourceURL}
                              </a>
                            )}
                            {page.metadata?.description && (
                              <p className="text-[11px] text-gray-400 font-sans leading-relaxed">{page.metadata.description}</p>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-text-muted font-mono border-t border-border/10 pt-2">
                              {page.metadata?.statusCode && <span>HTTP: {page.metadata.statusCode}</span>}
                              {page.links && <span>Links Discovered: {page.links.length}</span>}
                              {page.markdown && <span>Content: {page.markdown.length} chars</span>}
                            </div>
                            {page.markdown && (
                              <details className="border border-border/20 rounded bg-black/10 overflow-hidden">
                                <summary className="text-[9px] text-accent cursor-pointer font-mono px-3 py-1.5 hover:bg-white/5 select-none">[ VIEW EXTRACTED CONTENT ]</summary>
                                <div className="text-[10px] text-gray-300 font-sans whitespace-pre-wrap max-h-48 overflow-y-auto p-3 border-t border-border/10">
                                  {page.markdown.substring(0, 3000)}{page.markdown.length > 3000 ? '...' : ''}
                                </div>
                              </details>
                            )}
                            {page.links && page.links.length > 0 && (
                              <details className="border border-border/20 rounded bg-black/10 overflow-hidden">
                                <summary className="text-[9px] text-blue-400 cursor-pointer font-mono px-3 py-1.5 hover:bg-white/5 select-none">[ VIEW {page.links.length} DISCOVERED LINKS ]</summary>
                                <div className="space-y-1 max-h-36 overflow-y-auto p-3 border-t border-border/10 font-mono text-[9px] text-gray-400 bg-[#08070A]">
                                  {page.links.map((l: string, li: number) => (
                                    <div key={li} className="truncate">
                                      <span className="text-gray-600 mr-1.5">{(li + 1).toString().padStart(2, '0')}.</span>
                                      <a href={l} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline">{l}</a>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        ))}
                        {(resultData?.data || []).length === 0 && (
                          <div className="text-center text-text-muted text-xs py-10">No pages were crawled. Status: {resultData?.status || "failed"}</div>
                        )}
                      </div>
                    )}

                    {/* Clone Results Visual Renderer */}
                    {activeTab === "clone" && resultTab !== "json" && resultData && (
                      <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4 pr-1 text-left">
                        <div className="text-[10px] text-accent font-mono border-b border-border/20 pb-2 flex items-center justify-between">
                          <span>CLONE_METRICS_REPORT</span>
                          <span className="text-green-400">Status: COMPLETED</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                          <div className="border border-border/30 bg-bg-elevated/10 p-3 rounded">
                            <span className="text-[9px] text-text-muted block">SIMILARITY</span>
                            <span className="text-sm font-bold text-green-400">
                              {((resultData.similarity_score || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="border border-border/30 bg-bg-elevated/10 p-3 rounded">
                            <span className="text-[9px] text-text-muted block">ZIP SIZE</span>
                            <span className="text-sm font-bold text-white">{resultData.file_size_mb || "0.00"} MB</span>
                          </div>
                          <div className="border border-border/30 bg-bg-elevated/10 p-3 rounded">
                            <span className="text-[9px] text-text-muted block">PAGES</span>
                            <span className="text-sm font-bold text-white">{resultData.total_pages || "0"}</span>
                          </div>
                          <div className="border border-border/30 bg-bg-elevated/10 p-3 rounded">
                            <span className="text-[9px] text-text-muted block">BROKEN</span>
                            <span className={cn("text-sm font-bold", (resultData.broken_assets_count || 0) > 0 ? "text-red-400" : "text-white")}>
                              {resultData.broken_assets_count || 0}
                            </span>
                          </div>
                        </div>

                        <div className="border border-border/20 bg-[#08070A]/50 p-4 rounded font-mono text-xs space-y-2">
                          <span className="text-[10px] text-accent block font-bold">// CLONE_METADATA</span>
                          <div className="flex justify-between border-b border-border/10 pb-1.5 text-[10px]">
                            <span className="text-gray-400">Engine Cloner:</span>
                            <span className="text-white font-bold">{resultData.tool_used?.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between border-b border-border/10 pb-1.5 text-[10px]">
                            <span className="text-gray-400">Detected Stack:</span>
                            <span className="text-white font-bold">{resultData.site_type?.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-400">Internal Project ID:</span>
                            <span className="text-white font-bold">#{resultData.project_id}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2 font-mono">
                          <a
                            href={`${process.env.NEXT_PUBLIC_CLONER_API_URL || "http://localhost:8080"}/download/${resultData.project_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 rounded bg-primary text-white font-bold text-xs hover:shadow-glow flex items-center justify-center gap-1.5 text-center"
                          >
                            <Download size={12} />
                            <span>DOWNLOAD ZIP ARCHIVE</span>
                          </a>
                          <a
                            href={`${process.env.NEXT_PUBLIC_CLONER_API_URL || "http://localhost:8080"}/preview/${resultData.project_id}/index.html`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 rounded border border-border bg-bg-elevated hover:bg-white/5 text-white font-bold text-xs flex items-center justify-center gap-1.5 text-center"
                          >
                            <Eye size={12} />
                            <span>OFFLINE PREVIEW ↗</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {resultTab === "markdown" && activeTab !== "search" && activeTab !== "map" && activeTab !== "crawl" && activeTab !== "clone" && (
                      <div className="flex-1 overflow-y-auto max-h-[500px] border border-border/20 rounded p-4 bg-[#08070A] whitespace-pre-wrap select-all font-sans text-xs">
                        {resultData?.data?.markdown || resultData?.markdown || t.noMarkdown}
                      </div>
                    )}

                    {resultTab === "html" && (
                      htmlPreviewMode === "code" ? (
                        <pre className="flex-1 overflow-y-auto max-h-[500px] border border-border/20 rounded p-4 bg-[#08070A] whitespace-pre select-all text-[10px] text-emerald-400">
                          {formatHtml(resultData?.data?.html || resultData?.html || "")}
                        </pre>
                      ) : (
                        <div className="flex-1 border border-border/20 rounded bg-white max-h-[500px] h-[500px] overflow-hidden">
                          <iframe 
                            srcDoc={injectBaseHref(resultData?.data?.html || resultData?.html || "", targetUrl)}
                            className="w-full h-full border-none"
                            title="Clean HTML Preview"
                            sandbox="allow-same-origin"
                          />
                        </div>
                      )
                    )}

                    {resultTab === "rawHtml" && (
                      htmlPreviewMode === "code" ? (
                        <pre className="flex-1 overflow-y-auto max-h-[500px] border border-border/20 rounded p-4 bg-[#08070A] whitespace-pre select-all text-[10px] text-cyan-400">
                          {formatHtml(resultData?.data?.rawHtml || resultData?.rawHtml || "")}
                        </pre>
                      ) : (
                        <div className="flex-1 border border-border/20 rounded bg-white max-h-[500px] h-[500px] overflow-hidden">
                          <iframe 
                            srcDoc={injectBaseHref(resultData?.data?.rawHtml || resultData?.rawHtml || "", targetUrl)}
                            className="w-full h-full border-none"
                            title="Raw HTML Preview"
                            sandbox="allow-same-origin"
                          />
                        </div>
                      )
                    )}

                    {resultTab === "links" && (
                      <div className="flex-1 overflow-y-auto max-h-[500px] border border-border/20 rounded p-4 bg-[#08070A] select-all">
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-accent border-b border-border/20 pb-1.5 mb-2 flex justify-between">
                            <span>EXTRACTED_HYPERLINKS</span>
                            <span>Total: {(resultData?.data?.links || resultData?.links || []).length}</span>
                          </div>
                          {(resultData?.data?.links || resultData?.links || []).map((link: string, idx: number) => (
                            <div key={idx} className="truncate hover:text-white transition-colors">
                              <span className="text-text-muted mr-2">[{idx + 1}]</span>
                              <a href={link} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">{link}</a>
                            </div>
                          ))}
                          {(resultData?.data?.links || resultData?.links || []).length === 0 && (
                            <span className="text-text-muted italic">{t.noLinks}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {resultTab === "json" && (
                      <pre className="flex-1 overflow-y-auto max-h-[500px] border border-border/20 rounded p-4 bg-[#08070A] whitespace-pre select-all text-[10px]">
                        {JSON.stringify(resultData, null, 2)}
                      </pre>
                    )}

                    {resultTab === "screenshot" && (
                      <div className="flex-1 overflow-y-auto max-h-[500px] border border-border/20 rounded p-4 bg-[#08070A] flex flex-col items-center justify-center">
                        {resultData?.data?.screenshot || resultData?.screenshot ? (
                          <img 
                            src={resultData?.data?.screenshot || resultData?.screenshot} 
                            alt="Scraped Web Screenshot"
                            className="max-w-full rounded border border-border shadow-2xl"
                          />
                        ) : (
                          <div className="text-center text-text-muted">
                            <ImageIcon size={24} className="mx-auto mb-2" />
                            <span>{t.noScreenshot}</span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Developer Features / Dev Drawer Panel */}
          <div className="rounded-lg border border-border/40 bg-[#0c0b0f] p-5 relative font-mono text-[10px] space-y-4">
            <div className="corner-brackets" />
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <span className="font-bold text-accent flex items-center gap-1">
                <Cpu size={12} />
                <span>{t.metricsTitle}</span>
              </span>
              <span className="text-green-400 animate-pulse">[ SECURE_SESSION ]</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="space-y-1">
                <span className="text-text-muted block">{t.latency}</span>
                <span className="text-white font-bold text-xs">{latencyMs !== null ? `${latencyMs}ms` : "N/A"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-text-muted block">{t.payloadSize}</span>
                <span className="text-white font-bold text-xs">{responseSize || "N/A"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-text-muted block">{t.ssrfFilter}</span>
                <span className="text-green-400 font-bold text-xs">ENFORCED</span>
              </div>
              <div className="space-y-1">
                <span className="text-text-muted block">{t.keyStatus}</span>
                <span className={cn("font-bold text-xs", activeApiKey ? "text-green-400" : "text-red-400")}>
                  {activeApiKey ? "KEYS_LOADED" : "NO_KEY_FOUND"}
                </span>
              </div>
            </div>

            <div className="space-y-1 border-t border-border/20 pt-3">
              <span className="text-text-muted block font-bold mb-1.5">// {t.systemLogs}</span>
              <div className="space-y-1 max-h-[80px] overflow-y-auto text-[9px] text-gray-400">
                {devLogs.map((log, idx) => (
                  <div key={idx} className="truncate">
                    <span className="text-text-muted mr-1.5">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agentic Tools configurations download */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-border/20">
              <button
                onClick={handleDownloadMcpConfig}
                className="px-3 py-1.5 rounded border border-accent bg-accent/10 hover:bg-accent/20 transition-colors text-[9px] font-bold text-accent font-mono flex items-center gap-1 focus:outline-none"
              >
                <Cpu size={10} />
                <span>{t.downloadMcp}</span>
              </button>
              <button
                onClick={handleDownloadAgentPrompt}
                className="px-3 py-1.5 rounded border border-primary bg-primary/10 hover:bg-primary/20 transition-colors text-[9px] font-bold text-primary font-mono flex items-center gap-1 focus:outline-none"
              >
                <Terminal size={10} />
                <span>{t.getPrompt}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Floating Developer Console Access Button */}
      {userRole === "developer" && (
        <div className="fixed bottom-6 right-6 z-50 animate-pulse bg-black rounded-full shadow-2xl border border-accent">
          <button
            onClick={() => router.push("/dashboard/developer")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-accent hover:bg-accent hover:text-black transition-all text-xs font-mono font-bold focus:outline-none"
          >
            <Terminal size={14} className="text-accent" />
            <span>DEV CONSOLE ACTIVE</span>
          </button>
        </div>
      )}
    </main>
  );
}
