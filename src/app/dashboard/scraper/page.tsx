"use client";
import { useState } from "react";
import { Globe, Search, Scan, RefreshCw, CheckCircle2, XCircle, ExternalLink, Clock, Sparkles, BarChart3, Plus, Trash2, Loader2 } from "lucide-react";

const DEFAULT_COMPETITORS = [
  { name: "Linear", url: "https://linear.app", checked: true },
  { name: "Height", url: "https://height.app", checked: true },
  { name: "ClickUp", url: "https://clickup.com", checked: true },
  { name: "Notion", url: "https://notion.so", checked: true },
  { name: "Jira", url: "https://www.atlassian.com/software/jira", checked: true },
  { name: "Asana", url: "https://asana.com", checked: false },
];

export default function ScraperPage() {
  const [tab, setTab] = useState<"single" | "competitors">("single");
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState(DEFAULT_COMPETITORS);
  const [competitorResults, setCompetitorResults] = useState<any[]>([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const scrapeUrl = async () => {
    if (!url) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/ai/scraper", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, label: label || url }) });
      const data = await res.json();
      setResult(data);
      setHistory(prev => [data, ...prev]);
    } catch { setResult({ status: "failed", error: "Network error" }); }
    setLoading(false);
  };

  const runCompetitorScan = async () => {
    setScanLoading(true); setCompetitorResults([]);
    const urls = competitors.filter(c => c.checked).map(c => c.url);
    try {
      const res = await fetch("/api/ai/scraper/competitors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls }) });
      const data = await res.json();
      setCompetitorResults(data.results || []);
    } catch { setCompetitorResults([]); }
    setScanLoading(false);
  };

  const addCustom = () => {
    if (!customUrl) return;
    try {
      const hostname = new URL(customUrl).hostname;
      setCompetitors(prev => [...prev, { name: hostname, url: customUrl, checked: true }]);
      setCustomUrl("");
    } catch {}
  };

  const tabStyle = (active: boolean) => ({
    padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700 as const,
    background: active ? "#5B8CFF" : "#1e1e20", color: active ? "#000" : "#71717a",
    border: active ? "none" : "1px solid #27272A", cursor: "pointer" as const,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>AI Web Intelligence</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>Scrape, analyze, and monitor competitor project management tools</p>
        </div>
        <div style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(91,140,255,0.08)", border: "1px solid rgba(91,140,255,0.15)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#5B8CFF", fontFamily: "monospace" }}>{history.length} scraped</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("single")} style={tabStyle(tab === "single")}><Globe size={12} style={{ marginRight: 4, display: "inline" }} />Single URL</button>
        <button onClick={() => setTab("competitors")} style={tabStyle(tab === "competitors")}><BarChart3 size={12} style={{ marginRight: 4, display: "inline" }} />Competitor Analysis</button>
      </div>

      {tab === "single" && (
        <div className="space-y-4">
          <div style={{ borderRadius: 14, padding: "24px", background: "#111113", border: "1px solid #27272A" }}>
            <div className="flex gap-3" style={{ marginBottom: 16 }}>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" style={{ flex: 2, background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "10px 14px", color: "#f5f5f5", fontSize: 13, outline: "none" }} />
              <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (optional)" style={{ flex: 1, background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "10px 14px", color: "#f5f5f5", fontSize: 13, outline: "none" }} />
              <button onClick={scrapeUrl} disabled={loading || !url} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: loading ? "#3f3f46" : "#5B8CFF", border: "none", borderRadius: 10, cursor: loading ? "default" : "pointer", fontSize: 12, fontWeight: 700, color: "#000" }}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} {loading ? "Scraping..." : "Scrape"}
              </button>
            </div>

            {result && (
              <div style={{ borderRadius: 10, padding: "16px 20px", background: "#09090B", border: `1px solid ${result.status === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                  {result.status === "success" ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5" }}>{result.label || result.url}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, background: result.status === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: result.status === "success" ? "#10b981" : "#ef4444" }}>{result.status}</span>
                  {result.changed && <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>CHANGED</span>}
                </div>
                {result.status === "success" && (
                  <>
                    <div className="flex gap-4" style={{ fontSize: 11, color: "#52525b", fontFamily: "monospace", marginBottom: 8 }}>
                      <span>Hash: {result.hash}</span>
                      <span>Length: {result.text_length?.toLocaleString()} chars</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{new Date(result.scraped_at).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ maxHeight: 160, overflow: "auto", borderRadius: 8, padding: 12, background: "#111113", border: "1px solid #1c1c1f", fontSize: 11, fontFamily: "monospace", color: "#a1a1aa", lineHeight: 1.6, whiteSpace: "pre-wrap" as const }}>
                      {result.cleaned_text}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div>
              <h2 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 12 }}>Scrape History ({history.length})</h2>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} style={{ borderRadius: 10, padding: "12px 20px", background: "#09090B", border: "1px solid #1c1c1f", display: "flex", alignItems: "center", gap: 12 }}>
                    {h.status === "success" ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                    <span style={{ fontSize: 12, color: "#a1a1aa", flex: 1 }}>{h.label || h.url}</span>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#3f3f46" }}>{h.text_length?.toLocaleString()} chars</span>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#3f3f46" }}>{new Date(h.scraped_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "competitors" && (
        <div className="space-y-4">
          <div style={{ borderRadius: 14, padding: "24px", background: "#111113", border: "1px solid #27272A" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5", marginBottom: 16 }}>Select Competitors to Scan</h3>
            <div className="space-y-2" style={{ marginBottom: 16 }}>
              {competitors.map((c, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: c.checked ? "rgba(91,140,255,0.05)" : "transparent", cursor: "pointer" }}>
                  <input type="checkbox" checked={c.checked} onChange={() => setCompetitors(prev => prev.map((p, j) => j === i ? { ...p, checked: !p.checked } : p))} style={{ accentColor: "#5B8CFF" }} />
                  <span style={{ fontSize: 13, color: c.checked ? "#f5f5f5" : "#52525b", fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "#3f3f46" }}>{c.url}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2" style={{ marginBottom: 16 }}>
              <input value={customUrl} onChange={e => setCustomUrl(e.target.value)} placeholder="Add custom URL..." style={{ flex: 1, background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 12, outline: "none" }} />
              <button onClick={addCustom} style={{ padding: "8px 14px", background: "#1e1e20", border: "1px solid #27272A", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#a1a1aa" }}><Plus size={12} /></button>
            </div>
            <button onClick={runCompetitorScan} disabled={scanLoading} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 24px", background: scanLoading ? "#3f3f46" : "linear-gradient(135deg, #5B8CFF, #8b5cf6)", border: "none", borderRadius: 10, cursor: scanLoading ? "default" : "pointer", fontSize: 13, fontWeight: 700, color: "#fff", width: "100%", justifyContent: "center" }}>
              {scanLoading ? <Loader2 size={14} className="animate-spin" /> : <Scan size={14} />} {scanLoading ? "Scanning competitors..." : "Run Competitor Scan"}
            </button>
          </div>

          {competitorResults.length > 0 && (
            <div>
              <h2 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 12 }}>Scan Results ({competitorResults.length})</h2>
              <div className="space-y-3">
                {competitorResults.map((r: any, i: number) => (
                  <div key={i} style={{ borderRadius: 14, padding: "18px 24px", background: "#111113", border: `1px solid ${r.status === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"}` }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                      {r.status === "success" ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#f5f5f5" }}>{r.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, background: r.status === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: r.status === "success" ? "#10b981" : "#ef4444" }}>{r.status}</span>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "#3f3f46", marginLeft: "auto" }}>{r.text_length?.toLocaleString()} chars</span>
                    </div>
                    {r.status === "success" && (
                      <div style={{ maxHeight: 100, overflow: "auto", borderRadius: 8, padding: 12, background: "#09090B", border: "1px solid #1c1c1f", fontSize: 11, fontFamily: "monospace", color: "#71717a", lineHeight: 1.5, whiteSpace: "pre-wrap" as const }}>
                        {r.preview}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
