"use client";
import { useState, useEffect } from "react";
import { Brain, Search, Plus, Tag, Clock, Zap, TrendingUp, Database, ExternalLink, RefreshCw } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  architecture: "#5B8CFF",
  optimization: "#10b981",
  analytics: "#8b5cf6",
  design: "#f59e0b",
  devops: "#00e5ff",
  ai: "#ec4899",
};

export default function MemoryPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch("/api/ai/memory")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const res = await fetch("/api/ai/memory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
    if (res.ok) {
      const result = await res.json();
      setSearchResults(result.results || []);
    }
    setSearching(false);
  };

  const nodes = data?.nodes || [];
  const displayNodes = searchResults.length > 0 ? searchResults : nodes;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Engineering Memory</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>AI-indexed knowledge graph of your codebase and decisions</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#111113", border: "1px solid #27272A", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#a1a1aa" }}>
          <RefreshCw size={13} /> Re-index
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Indexed Nodes", value: data?.total || nodes.length, color: "#5B8CFF", icon: Brain },
          { label: "Total Docs", value: data?.indexed_docs || "6,242", color: "#8b5cf6", icon: Database },
          { label: "Vector Status", value: data?.vector_status || "ready", color: "#10b981", icon: Zap, isText: true },
          { label: "Avg Relevance", value: "91%", color: "#f59e0b", icon: TrendingUp },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ borderRadius: 12, padding: "16px 20px", background: "#111113", border: "1px solid #27272A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1, textTransform: s.isText ? "capitalize" : "none" }}>{s.value}</p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={s.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ position: "relative" }}>
        <Search size={16} color="#3f3f46" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); if (!e.target.value) setSearchResults([]); }}
          placeholder="Search engineering memory... (e.g. 'auth OAuth flow', 'database indexes')"
          style={{ width: "100%", background: "#111113", border: "1px solid #27272A", borderRadius: 12, padding: "12px 14px 12px 40px", color: "#f5f5f5", fontSize: 13, outline: "none", boxSizing: "border-box" }}
        />
        <button type="submit" disabled={searching} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", padding: "6px 14px", background: "#8b5cf6", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          {searching ? "Searching..." : "Search"}
        </button>
      </form>
      {searchResults.length > 0 && (
        <p style={{ fontSize: 11, color: "#52525b" }}>Showing {searchResults.length} semantic matches for &quot;{query}&quot;</p>
      )}

      {/* Memory nodes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {displayNodes.map((node: any) => {
          const color = TYPE_COLORS[node.type] || "#5B8CFF";
          return (
            <div key={node.id} style={{ borderRadius: 12, padding: "18px 20px", background: "#111113", border: `1px solid ${color}22` }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", background: `${color}15`, color, padding: "2px 7px", borderRadius: 4 }}>{node.type}</span>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b" }}>Updated {node.updated}</span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5", lineHeight: 1.3 }}>{node.title}</h3>
                </div>
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <p style={{ fontSize: 11, color: "#52525b" }}>Relevance</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif" }}>{Math.round(node.relevance * 100)}%</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.5, marginBottom: 12 }}>{node.summary}</p>
              <div className="flex flex-wrap gap-1">
                {(node.tags || []).map((tag: string) => (
                  <span key={tag} style={{ fontSize: 9, fontFamily: "monospace", background: "#1e1e20", color: "#52525b", padding: "2px 6px", borderRadius: 4 }}>#{tag}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
