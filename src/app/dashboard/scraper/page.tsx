"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Crosshair,
  Activity,
  Sparkles,
  BarChart3,
  Download,
  Loader2,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Globe,
  Plus
} from "lucide-react";

// Types
interface ScrapeResult {
  id: string;
  url: string;
  status: "success" | "failed";
  title?: string;
  metaDescription?: string;
  contentPreview?: string;
  hash: string;
  textLength: number;
  timestamp: string;
  aiAnalysis?: {
    category: string;
    confidence: number;
    summary: string;
  };
}

interface Target {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  lastChecked: string;
  status: "healthy" | "changed" | "unchecked";
}

interface FeedItem {
  id: string;
  targetName: string;
  timestamp: string;
  category: "pricing" | "features" | "content" | "layout" | "minor";
  confidence: number;
  summary: string;
  diff: { added: string[]; removed: string[] };
}

export default function WebScraperDashboard() {
  const [activeTab, setActiveTab] = useState("quick");
  const [stats, setStats] = useState({ totalScraped: 1248, activeTargets: 24 });
  
  // Tab 1: Quick Scrape State
  const [quickUrl, setQuickUrl] = useState("");
  const [quickLabel, setQuickLabel] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [quickResult, setQuickResult] = useState<ScrapeResult | null>(null);
  const [scrapeHistory, setScrapeHistory] = useState<ScrapeResult[]>([]);

  // Tab 2: Monitored Targets State
  const [targets, setTargets] = useState<Target[]>([]);
  const [newTarget, setNewTarget] = useState({ name: "", url: "", category: "competitor" });

  // Tab 3: Change Feed State
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  // Tab 4: AI Analysis State
  const [analyzeUrl, setAnalyzeUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);

  // Tab 5: Competitor Intel State
  const [competitors, setCompetitors] = useState([
    { id: "1", name: "Acme Corp", url: "https://acme.com", status: "scanned", textLength: 12400 },
    { id: "2", name: "Globex", url: "https://globex.com", status: "pending", textLength: 0 },
  ]);
  const [competitorUrl, setCompetitorUrl] = useState("");

  // Tab 6: Bulk State
  const [bulkUrls, setBulkUrls] = useState("");
  const [isBulkScraping, setIsBulkScraping] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ completed: 0, total: 0 });
  const [bulkResults, setBulkResults] = useState<ScrapeResult[]>([]);

  const tabs = [
    { id: "quick", label: "Quick Scrape", icon: Search },
    { id: "targets", label: "Monitored Targets", icon: Crosshair },
    { id: "feed", label: "Change Feed", icon: Activity },
    { id: "analysis", label: "AI Analysis", icon: Sparkles },
    { id: "competitors", label: "Competitor Intel", icon: BarChart3 },
    { id: "bulk", label: "Bulk & Export", icon: Download },
  ];

  useEffect(() => {
    // Load real data on mount
    fetch('/api/ai/scraper').then(r => r.json()).then(data => {
      if (data.results) {
        setScrapeHistory(data.results.map((r: any) => ({
          id: r.id || Math.random().toString(),
          url: r.url,
          status: r.status,
          title: r.title,
          metaDescription: r.meta_description,
          contentPreview: r.cleaned_text?.slice(0, 500),
          hash: r.hash?.slice(0, 16) || '',
          textLength: r.text_length || 0,
          timestamp: r.scraped_at,
          aiAnalysis: r.ai_analysis ? { category: r.ai_analysis.category, confidence: r.ai_analysis.confidence_score, summary: r.ai_analysis.summary } : undefined,
        })));
        setStats(prev => ({ ...prev, totalScraped: data.count || 0 }));
      }
    }).catch(() => {});

    fetch('/api/ai/scraper/targets').then(r => r.json()).then(data => {
      const list = Array.isArray(data) ? data : (data.targets || []);
      setTargets(list.map((t: any) => ({
        id: t.id,
        name: t.name,
        url: t.url,
        category: t.category || 'custom',
        active: t.is_active !== false,
        lastChecked: t.last_checked ? new Date(t.last_checked).toLocaleString() : 'Never',
        status: t.last_checked ? 'healthy' : 'unchecked' as const,
      })));
      setStats(prev => ({ ...prev, activeTargets: list.filter((t: any) => t.is_active !== false).length }));
    }).catch(() => {});

    fetch('/api/ai/scraper/alerts').then(r => r.json()).then(data => {
      const alerts = Array.isArray(data) ? data : (data.alerts || []);
      setFeedItems(alerts.map((a: any) => ({
        id: a.id,
        targetName: a.label || a.url,
        timestamp: a.created_at ? new Date(a.created_at).toLocaleString() : '',
        category: a.ai_analysis?.category || 'content',
        confidence: a.ai_analysis?.confidence_score || 0.5,
        summary: a.ai_analysis?.summary || 'Change detected',
        diff: {
          added: a.diff_summary?.added_lines || [],
          removed: a.diff_summary?.removed_lines || [],
        },
      })));
    }).catch(() => {});
  }, []);

  const handleQuickScrape = async () => {
    if (!quickUrl) return;
    setIsScraping(true);
    setQuickResult(null);
    try {
      const res = await fetch('/api/ai/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: quickUrl, label: quickLabel || quickUrl }),
      });
      const data = await res.json();
      const newResult: ScrapeResult = {
        id: data.id || Math.random().toString(),
        url: data.url || quickUrl,
        status: data.status || (res.ok ? 'success' : 'failed'),
        title: data.title || '',
        metaDescription: data.meta_description || '',
        contentPreview: data.cleaned_text?.slice(0, 500) || '',
        hash: data.hash?.slice(0, 16) || '',
        textLength: data.text_length || 0,
        timestamp: data.scraped_at || new Date().toISOString(),
        aiAnalysis: data.ai_analysis ? { category: data.ai_analysis.category, confidence: data.ai_analysis.confidence_score, summary: data.ai_analysis.summary } : undefined,
      };
      setQuickResult(newResult);
      setScrapeHistory(prev => [newResult, ...prev]);
      setStats(prev => ({ ...prev, totalScraped: prev.totalScraped + 1 }));
    } catch {
      setQuickResult({ id: 'err', url: quickUrl, status: 'failed', hash: '', textLength: 0, timestamp: new Date().toISOString() });
    }
    setIsScraping(false);
  };

  const handleAddTarget = async () => {
    if (!newTarget.name || !newTarget.url) return;
    try {
      const res = await fetch('/api/ai/scraper/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTarget.name, url: newTarget.url, category: newTarget.category }),
      });
      const data = await res.json();
      const added: Target = {
        id: data.id || Math.random().toString(),
        name: data.name || newTarget.name,
        url: data.url || newTarget.url,
        category: data.category || newTarget.category,
        active: true,
        lastChecked: 'Never',
        status: 'unchecked',
      };
      setTargets(prev => [added, ...prev]);
      setNewTarget({ name: '', url: '', category: 'competitor' });
      setStats(prev => ({ ...prev, activeTargets: prev.activeTargets + 1 }));
    } catch {}
  };

  const handleDeleteTarget = async (id: string) => {
    if (confirm('Delete this target?')) {
      try {
        await fetch('/api/ai/scraper/targets', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      } catch {}
      setTargets(prev => prev.filter(t => t.id !== id));
      setStats(prev => ({ ...prev, activeTargets: Math.max(0, prev.activeTargets - 1) }));
    }
  };

  const handleDeepAnalyze = async () => {
    if (!analyzeUrl) return;
    setIsAnalyzing(true);
    setAnalyzeResult(null);
    try {
      const res = await fetch('/api/ai/scraper/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: analyzeUrl }),
      });
      const data = await res.json();
      setAnalyzeResult({
        title: data.title || '',
        description: data.meta_description || '',
        url: data.url || analyzeUrl,
        productName: data.extracted_data?.product_name || '',
        price: data.extracted_data?.price || '',
        features: data.extracted_data?.features || [],
        headingsCount: data.extracted_data?.headings?.length || 0,
        linksCount: data.extracted_data?.links_count || 0,
        imagesCount: data.extracted_data?.images_count || 0,
        cleanedText: data.cleaned_text?.slice(0, 2000) || '',
      });
    } catch {
      setAnalyzeResult({ title: 'Error', description: 'Failed to analyze URL', url: analyzeUrl });
    }
    setIsAnalyzing(false);
  };

  const handleBulkScrape = async () => {
    const urls = bulkUrls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    if (urls.length === 0) return;
    setIsBulkScraping(true);
    setBulkProgress({ completed: 0, total: urls.length });
    setBulkResults([]);
    try {
      const res = await fetch('/api/ai/scraper/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      const results = (data.results || []).map((r: any, i: number) => ({
        id: r.id || `bulk-${i}`,
        url: r.url,
        status: r.status,
        textLength: r.text_length || 0,
        hash: r.hash?.slice(0, 16) || '',
        timestamp: r.scraped_at || new Date().toISOString(),
      } as ScrapeResult));
      setBulkResults(results);
      setBulkProgress({ completed: urls.length, total: urls.length });
    } catch {
      setBulkProgress({ completed: 0, total: urls.length });
    }
    setIsBulkScraping(false);
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const res = await fetch(`/api/ai/scraper/export?format=${format}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'csv' ? 'scraper-export.csv' : 'scraper-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "#f5f5f5", display: "flex", alignItems: "center", gap: 10 }}>
            <Globe size={24} color="#5B8CFF" />
            AI Web Intelligence
          </h1>
          <p style={{ color: "#a1a1aa", fontSize: 14, marginTop: 4 }}>Scrape, analyze, and monitor any website with AI-powered change detection</p>
        </div>
        <div className="flex items-center gap-4">
          <div style={{ background: "rgba(91,140,255,0.05)", border: "1px solid rgba(91,140,255,0.12)", backdropFilter: "blur(12px)", padding: "12px 16px", borderRadius: 10 }} className="flex flex-col items-end">
            <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase" }}>Total Scraped</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#f5f5f5" }}>{stats.totalScraped.toLocaleString()}</span>
          </div>
          <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)", backdropFilter: "blur(12px)", padding: "12px 16px", borderRadius: 10 }} className="flex flex-col items-end">
            <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase" }}>Active Targets</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>{stats.activeTargets}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #1c1c1f", paddingBottom: 16, overflowX: "auto" }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                background: isActive ? "#5B8CFF" : "#1e1e20",
                color: isActive ? "#000" : "#71717a",
                fontWeight: isActive ? 700 : 500,
                border: isActive ? "1px solid #5B8CFF" : "1px solid #27272A",
                fontSize: 14
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div style={{ marginTop: 24 }}>
        
        {/* Tab 1: Quick Scrape */}
        {activeTab === "quick" && (
          <div className="space-y-6">
            <div style={{ background: "#09090B", border: "1px solid #27272A", borderRadius: 14, padding: 24 }}>
              <div className="flex gap-4 items-end">
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#a1a1aa", marginBottom: 6 }}>Target URL</label>
                  <input 
                    type="url" 
                    value={quickUrl}
                    onChange={e => setQuickUrl(e.target.value)}
                    placeholder="https://example.com"
                    style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "10px 14px", color: "#f5f5f5", fontSize: 14, outline: "none" }}
                  />
                </div>
                <div style={{ width: 200 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#a1a1aa", marginBottom: 6 }}>Label (Optional)</label>
                  <input 
                    type="text" 
                    value={quickLabel}
                    onChange={e => setQuickLabel(e.target.value)}
                    placeholder="e.g. Landing Page"
                    style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "10px 14px", color: "#f5f5f5", fontSize: 14, outline: "none" }}
                  />
                </div>
                <button 
                  onClick={handleQuickScrape}
                  disabled={isScraping || !quickUrl}
                  style={{ background: "#5B8CFF", color: "#000", fontWeight: 700, borderRadius: 10, padding: "10px 24px", height: 42, border: "none", cursor: (isScraping || !quickUrl) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: (isScraping || !quickUrl) ? 0.7 : 1 }}
                >
                  {isScraping ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  {isScraping ? "Scraping..." : "Scrape"}
                </button>
              </div>
            </div>

            {quickResult && (
              <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 14, padding: 24 }} className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b" style={{ borderColor: "#1c1c1f", paddingBottom: 16 }}>
                  <div className="flex items-center gap-3">
                    {quickResult.status === "success" ? <CheckCircle2 size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
                    <div>
                      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#f5f5f5", fontSize: 18 }}>{quickResult.title || "Unknown Title"}</h3>
                      <a href={quickResult.url} target="_blank" rel="noreferrer" style={{ color: "#5B8CFF", fontSize: 13, textDecoration: "none" }}>{quickResult.url}</a>
                    </div>
                  </div>
                  <button style={{ background: "linear-gradient(135deg, #5B8CFF, #8b5cf6)", color: "#fff", fontWeight: 600, border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    <Plus size={14} /> Add to Monitoring
                  </button>
                </div>
                
                {quickResult.metaDescription && (
                  <p style={{ color: "#a1a1aa", fontSize: 14 }}>{quickResult.metaDescription}</p>
                )}

                <div style={{ background: "#050505", border: "1px solid #1c1c1f", borderRadius: 8, padding: 16, maxHeight: 200, overflowY: "auto" }}>
                  <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 12, color: "#a1a1aa", whiteSpace: "pre-wrap" }}>
                    {quickResult.contentPreview}
                  </pre>
                </div>

                <div className="flex gap-4 items-center" style={{ fontSize: 12, fontFamily: "monospace", color: "#52525b" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Crosshair size={12} /> Hash: {quickResult.hash.substring(0, 16)}</span>
                  <span>|</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Activity size={12} /> Length: {quickResult.textLength} chars</span>
                  <span>|</span>
                  <span>Time: {new Date(quickResult.timestamp).toLocaleTimeString()}</span>
                </div>

                {quickResult.aiAnalysis && (
                  <div style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, padding: 16, marginTop: 16 }}>
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles size={16} color="#8b5cf6" />
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", padding: "2px 7px", borderRadius: 4 }}>
                        {quickResult.aiAnalysis.category}
                      </span>
                      <div style={{ flex: 1, height: 4, background: "#1c1c1f", borderRadius: 2 }}>
                        <div style={{ width: `\${quickResult.aiAnalysis.confidence * 100}%`, height: "100%", background: "#8b5cf6", borderRadius: 2 }}></div>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#8b5cf6" }}>{(quickResult.aiAnalysis.confidence * 100).toFixed(0)}% Match</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#f5f5f5" }}>{quickResult.aiAnalysis.summary}</p>
                  </div>
                )}
              </div>
            )}
            
            {scrapeHistory.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Recent Scrapes</p>
                <div className="space-y-2">
                  {scrapeHistory.map(item => (
                    <div key={item.id} style={{ background: "#09090B", border: "1px solid #1c1c1f", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div className="flex items-center gap-3">
                        {item.status === "success" ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                        <span style={{ fontSize: 13, color: "#f5f5f5" }}>{item.url}</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#52525b" }}>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Monitored Targets */}
        {activeTab === "targets" && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div style={{ flex: 1, background: "#09090B", border: "1px solid #27272A", borderRadius: 14, padding: 20 }}>
                <p style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", marginBottom: 4 }}>Total Targets</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "#f5f5f5" }}>{targets.length}</p>
              </div>
              <div style={{ flex: 1, background: "#09090B", border: "1px solid #27272A", borderRadius: 14, padding: 20 }}>
                <p style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", marginBottom: 4 }}>Active Checks</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>{targets.filter(t => t.active).length}</p>
              </div>
              <div style={{ flex: 1, background: "#09090B", border: "1px solid #27272A", borderRadius: 14, padding: 20 }}>
                <p style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", marginBottom: 4 }}>Unread Alerts</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>3</p>
              </div>
            </div>

            <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 14, padding: 24 }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: "#f5f5f5", marginBottom: 16 }}>Add New Target</p>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={newTarget.name}
                  onChange={e => setNewTarget({...newTarget, name: e.target.value})}
                  placeholder="Target Name"
                  style={{ flex: 1, background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "10px 14px", color: "#f5f5f5", fontSize: 14, outline: "none" }}
                />
                <input 
                  type="url" 
                  value={newTarget.url}
                  onChange={e => setNewTarget({...newTarget, url: e.target.value})}
                  placeholder="URL to monitor"
                  style={{ flex: 2, background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "10px 14px", color: "#f5f5f5", fontSize: 14, outline: "none" }}
                />
                <select 
                  value={newTarget.category}
                  onChange={e => setNewTarget({...newTarget, category: e.target.value})}
                  style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "10px 14px", color: "#f5f5f5", fontSize: 14, outline: "none", cursor: "pointer" }}
                >
                  <option value="competitor">Competitor</option>
                  <option value="client">Client</option>
                  <option value="research">Research</option>
                  <option value="custom">Custom</option>
                </select>
                <button onClick={handleAddTarget} style={{ background: "#5B8CFF", color: "#000", fontWeight: 700, borderRadius: 10, padding: "0 24px", border: "none", cursor: "pointer" }}>
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {targets.map(target => (
                <div key={target.id} style={{ background: "#09090B", border: "1px solid #27272A", borderRadius: 14, padding: 20, transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#3f3f46"} onMouseLeave={e => e.currentTarget.style.borderColor = "#27272A"}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 style={{ fontWeight: 600, color: "#f5f5f5", fontSize: 15 }}>{target.name}</h4>
                      <p style={{ fontFamily: "monospace", fontSize: 11, color: "#71717a", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{target.url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", background: "rgba(161,161,170,0.1)", color: "#a1a1aa", padding: "2px 7px", borderRadius: 4 }}>
                        {target.category}
                      </span>
                      <button onClick={() => handleDeleteTarget(target.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between" style={{ borderTop: "1px solid #1c1c1f", paddingTop: 16 }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: target.status === "healthy" ? "#10b981" : target.status === "changed" ? "#f59e0b" : "#52525b" }} />
                      <span style={{ fontSize: 12, color: "#a1a1aa" }}>{target.active ? "Active" : "Paused"} · {target.lastChecked}</span>
                    </div>
                    <div className="flex gap-2">
                      <button style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 6, padding: "6px 10px", color: "#f5f5f5", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Scan Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Change Feed */}
        {activeTab === "feed" && (
          <div className="space-y-4">
            {feedItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#71717a" }}>
                <Activity size={48} color="#27272A" style={{ margin: "0 auto 16px" }} />
                <p style={{ fontSize: 15 }}>No changes detected yet.</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Add targets and run scans to start monitoring.</p>
              </div>
            ) : (
              feedItems.map(item => {
                const colors = {
                  pricing: "#f59e0b",
                  features: "#5B8CFF",
                  content: "#8b5cf6",
                  layout: "#06b6d4",
                  minor: "#71717a"
                };
                const color = colors[item.category];

                return (
                  <div key={item.id} style={{ background: "#111113", border: "1px solid #27272A", borderLeft: `4px solid \${color}`, borderRadius: 10, padding: 20 }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 style={{ fontWeight: 600, color: "#f5f5f5", fontSize: 15 }}>{item.targetName}</h4>
                        <p style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>{item.timestamp}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", background: `\${color}1A`, color: color, padding: "2px 7px", borderRadius: 4 }}>
                          {item.category}
                        </span>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: color, background: "#18181B", border: "1px solid #27272A", padding: "2px 6px", borderRadius: 4 }}>
                          {item.confidence * 100}% Conf
                        </span>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: 14, color: "#f5f5f5", marginBottom: 16 }}>{item.summary}</p>
                    
                    <div style={{ background: "#050505", border: "1px solid #1c1c1f", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 12 }}>
                      {item.diff.removed.map((line, i) => (
                        <div key={`rm-\${i}`} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "2px 8px", marginBottom: 2 }}>- {line}</div>
                      ))}
                      {item.diff.added.map((line, i) => (
                        <div key={`add-\${i}`} style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "2px 8px", marginBottom: 2 }}>+ {line}</div>
                      ))}
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button onClick={() => alert("Work item created")} style={{ background: "#5B8CFF", color: "#000", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Create Work Item</button>
                      <button style={{ background: "#18181B", color: "#a1a1aa", border: "1px solid #27272A", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Mark Read</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 4: AI Analysis */}
        {activeTab === "analysis" && (
          <div className="space-y-6">
            <div style={{ background: "#09090B", border: "1px solid #27272A", borderRadius: 14, padding: 24 }}>
              <div className="flex gap-4">
                <input 
                  type="url" 
                  value={analyzeUrl}
                  onChange={e => setAnalyzeUrl(e.target.value)}
                  placeholder="URL for Deep AI Analysis..."
                  style={{ flex: 1, background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "12px 16px", color: "#f5f5f5", fontSize: 15, outline: "none" }}
                />
                <button 
                  onClick={handleDeepAnalyze}
                  disabled={isAnalyzing || !analyzeUrl}
                  style={{ background: "linear-gradient(135deg, #5B8CFF, #8b5cf6)", color: "#fff", fontWeight: 700, borderRadius: 10, padding: "0 24px", border: "none", cursor: (isAnalyzing || !analyzeUrl) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: (isAnalyzing || !analyzeUrl) ? 0.7 : 1 }}
                >
                  {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Deep Analyze
                </button>
              </div>
            </div>

            {isAnalyzing && (
              <div style={{ padding: 40, textAlign: "center", color: "#a1a1aa" }}>
                <Loader2 size={32} className="animate-spin mx-auto mb-4" color="#8b5cf6" />
                <p>AI is parsing structure and extracting entities...</p>
              </div>
            )}

            {analyzeResult && !isAnalyzing && (
              <div className="grid grid-cols-2 gap-6 animate-fade-in">
                <div className="space-y-6">
                  <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 14, padding: 20 }}>
                    <h4 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", marginBottom: 12 }}>Metadata</h4>
                    <p style={{ fontWeight: 600, color: "#f5f5f5", fontSize: 16 }}>{analyzeResult.title}</p>
                    <p style={{ color: "#a1a1aa", fontSize: 13, marginTop: 4 }}>{analyzeResult.description}</p>
                    <a href={analyzeResult.url} style={{ color: "#5B8CFF", fontSize: 12, marginTop: 8, display: "inline-block", textDecoration: "none" }}>{analyzeResult.url}</a>
                  </div>

                  <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 14, padding: 20 }}>
                    <h4 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", marginBottom: 12 }}>Extracted Entities</h4>
                    <div className="space-y-3">
                      <div>
                        <span style={{ fontSize: 12, color: "#71717a" }}>Product Name: </span>
                        <span style={{ fontSize: 14, color: "#f5f5f5", fontWeight: 500 }}>{analyzeResult.productName}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 12, color: "#71717a" }}>Pricing: </span>
                        <span style={{ fontSize: 14, color: "#10b981", fontWeight: 600, background: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: 4 }}>{analyzeResult.price}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 12, color: "#71717a", display: "block", marginBottom: 4 }}>Key Features: </span>
                        <ul style={{ margin: 0, paddingLeft: 16, color: "#f5f5f5", fontSize: 13 }}>
                          {analyzeResult.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 14, padding: 20 }}>
                    <h4 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", marginBottom: 12 }}>Content Structure</h4>
                    <div className="flex gap-4">
                      <div style={{ flex: 1, background: "#050505", border: "1px solid #1c1c1f", borderRadius: 8, padding: 12, textAlign: "center" }}>
                        <p style={{ fontSize: 20, fontWeight: 700, color: "#f5f5f5" }}>{analyzeResult.headingsCount}</p>
                        <p style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase" }}>Headings</p>
                      </div>
                      <div style={{ flex: 1, background: "#050505", border: "1px solid #1c1c1f", borderRadius: 8, padding: 12, textAlign: "center" }}>
                        <p style={{ fontSize: 20, fontWeight: 700, color: "#5B8CFF" }}>{analyzeResult.linksCount}</p>
                        <p style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase" }}>Links</p>
                      </div>
                      <div style={{ flex: 1, background: "#050505", border: "1px solid #1c1c1f", borderRadius: 8, padding: 12, textAlign: "center" }}>
                        <p style={{ fontSize: 20, fontWeight: 700, color: "#8b5cf6" }}>{analyzeResult.imagesCount}</p>
                        <p style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase" }}>Images</p>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 14, padding: 20 }}>
                    <h4 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", marginBottom: 12 }}>Cleaned Text Preview</h4>
                    <div style={{ background: "#050505", border: "1px solid #1c1c1f", borderRadius: 8, padding: 12, maxHeight: 150, overflowY: "auto", fontSize: 12, color: "#a1a1aa", fontFamily: "monospace" }}>
                      {analyzeResult.cleanedText}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Competitor Intel */}
        {activeTab === "competitors" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-3 w-1/2">
                <input 
                  type="url" 
                  value={competitorUrl}
                  onChange={e => setCompetitorUrl(e.target.value)}
                  placeholder="Add custom competitor URL"
                  style={{ flex: 1, background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 14, outline: "none" }}
                />
                <button 
                  onClick={() => {
                    if (competitorUrl) {
                      setCompetitors([...competitors, { id: Math.random().toString(), name: "Custom", url: competitorUrl, status: "pending", textLength: 0 }]);
                      setCompetitorUrl("");
                    }
                  }}
                  style={{ background: "#1e1e20", color: "#f5f5f5", border: "1px solid #3f3f46", borderRadius: 8, padding: "0 16px", fontSize: 13, cursor: "pointer" }}
                >
                  Add
                </button>
              </div>
              <button style={{ background: "#5B8CFF", color: "#000", fontWeight: 700, borderRadius: 10, padding: "10px 20px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Play size={16} /> Run Competitor Scan
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {competitors.map(comp => (
                <div key={comp.id} style={{ background: "#09090B", border: "1px solid #27272A", borderRadius: 14, padding: 20 }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: "#5B8CFF" }} />
                      <div>
                        <h4 style={{ fontWeight: 600, color: "#f5f5f5", fontSize: 15 }}>{comp.name}</h4>
                        <p style={{ fontFamily: "monospace", fontSize: 11, color: "#71717a", marginTop: 2 }}>{comp.url}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", background: comp.status === "scanned" ? "rgba(16,185,129,0.1)" : "rgba(161,161,170,0.1)", color: comp.status === "scanned" ? "#10b981" : "#a1a1aa", padding: "2px 7px", borderRadius: 4 }}>
                      {comp.status}
                    </span>
                  </div>
                  {comp.status === "scanned" && (
                    <div style={{ fontSize: 12, color: "#a1a1aa", borderTop: "1px solid #1c1c1f", paddingTop: 12, marginTop: 12 }}>
                      Last scan retrieved {comp.textLength.toLocaleString()} characters.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Bulk & Export */}
        {activeTab === "bulk" && (
          <div className="space-y-6">
            <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 14, padding: 24 }}>
              <div className="flex justify-between items-center mb-4">
                <label style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5" }}>Target URLs (One per line)</label>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#71717a" }}>{bulkUrls.split("\n").filter(u => u.trim()).length} URLs detected</span>
              </div>
              <textarea 
                value={bulkUrls}
                onChange={e => setBulkUrls(e.target.value)}
                placeholder="https://example.com/page1&#10;https://example.com/page2"
                style={{ width: "100%", height: 150, background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "12px", color: "#f5f5f5", fontSize: 13, fontFamily: "monospace", outline: "none", resize: "vertical", marginBottom: 16 }}
              />
              
              <div className="flex justify-between items-center">
                {isBulkScraping ? (
                  <div className="flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin" color="#5B8CFF" />
                    <span style={{ fontSize: 13, color: "#f5f5f5" }}>Processing {bulkProgress.completed} of {bulkProgress.total}...</span>
                  </div>
                ) : (
                  <button 
                    onClick={handleBulkScrape}
                    disabled={!bulkUrls.trim()}
                    style={{ background: "#5B8CFF", color: "#000", fontWeight: 700, borderRadius: 10, padding: "10px 24px", border: "none", cursor: !bulkUrls.trim() ? "not-allowed" : "pointer", opacity: !bulkUrls.trim() ? 0.5 : 1 }}
                  >
                    Scrape All
                  </button>
                )}

                {bulkResults.length > 0 && (
                  <div className="flex gap-3">
                    <button onClick={() => exportData('csv')} style={{ background: "#1e1e20", color: "#f5f5f5", border: "1px solid #3f3f46", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <Download size={14} /> Export CSV
                    </button>
                    <button onClick={() => exportData('json')} style={{ background: "#1e1e20", color: "#f5f5f5", border: "1px solid #3f3f46", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <Download size={14} /> Export JSON
                    </button>
                  </div>
                )}
              </div>
            </div>

            {bulkResults.length > 0 && (
              <div style={{ background: "#09090B", border: "1px solid #27272A", borderRadius: 14, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead style={{ background: "#111113", borderBottom: "1px solid #1c1c1f", textAlign: "left" }}>
                    <tr>
                      <th style={{ padding: "12px 16px", color: "#a1a1aa", fontWeight: 500 }}>URL</th>
                      <th style={{ padding: "12px 16px", color: "#a1a1aa", fontWeight: 500 }}>Status</th>
                      <th style={{ padding: "12px 16px", color: "#a1a1aa", fontWeight: 500 }}>Length</th>
                      <th style={{ padding: "12px 16px", color: "#a1a1aa", fontWeight: 500 }}>Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((res, i) => (
                      <tr key={res.id} style={{ borderBottom: i === bulkResults.length - 1 ? "none" : "1px solid #1c1c1f" }}>
                        <td style={{ padding: "12px 16px", color: "#f5f5f5", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{res.url}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: res.status === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: res.status === "success" ? "#10b981" : "#ef4444", padding: "2px 6px", borderRadius: 4 }}>
                            {res.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#a1a1aa", fontFamily: "monospace" }}>{res.textLength}</td>
                        <td style={{ padding: "12px 16px", color: "#52525b", fontFamily: "monospace" }}>{res.hash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
