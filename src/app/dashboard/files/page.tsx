"use client";
import { useState } from "react";
import { Folder, FileText, FileCode, Image, FileJson, ChevronRight, ChevronDown, Search, Plus, Download, Trash2, Eye } from "lucide-react";

const FILE_TREE = [
  { id: "1", name: "src", type: "folder", children: [
    { id: "1a", name: "app", type: "folder", children: [
      { id: "1a1", name: "dashboard", type: "folder", children: [
        { id: "1a1a", name: "page.tsx", type: "file", size: "8.2 KB", lang: "tsx", modified: "2 hrs ago" },
        { id: "1a1b", name: "layout.tsx", type: "file", size: "4.1 KB", lang: "tsx", modified: "1 day ago" },
        { id: "1a1c", name: "agents", type: "folder", children: [{ id: "1a1c1", name: "page.tsx", type: "file", size: "3.8 KB", lang: "tsx", modified: "3 hrs ago" }] },
        { id: "1a1d", name: "views", type: "folder", children: [{ id: "1a1d1", name: "page.tsx", type: "file", size: "48.2 KB", lang: "tsx", modified: "5 hrs ago" }] },
      ]},
      { id: "1a2", name: "api", type: "folder", children: [
        { id: "1a2a", name: "projects", type: "folder", children: [{ id: "1a2a1", name: "route.ts", type: "file", size: "0.4 KB", lang: "ts", modified: "6 hrs ago" }] },
        { id: "1a2b", name: "tasks", type: "folder", children: [{ id: "1a2b1", name: "route.ts", type: "file", size: "0.5 KB", lang: "ts", modified: "6 hrs ago" }] },
        { id: "1a2c", name: "ai", type: "folder", children: [
          { id: "1a2c1", name: "agents", type: "folder", children: [{ id: "1a2c1a", name: "route.ts", type: "file", size: "0.2 KB", lang: "ts", modified: "6 hrs ago" }] },
          { id: "1a2c2", name: "memory", type: "folder", children: [{ id: "1a2c2a", name: "route.ts", type: "file", size: "0.5 KB", lang: "ts", modified: "6 hrs ago" }] },
        ]},
      ]},
    ]},
    { id: "1b", name: "components", type: "folder", children: [
      { id: "1b1", name: "Sidebar.tsx", type: "file", size: "6.4 KB", lang: "tsx", modified: "1 day ago" },
      { id: "1b2", name: "CalendarView.tsx", type: "file", size: "3.2 KB", lang: "tsx", modified: "2 days ago" },
      { id: "1b3", name: "DashboardAnalytics.tsx", type: "file", size: "3.1 KB", lang: "tsx", modified: "6 hrs ago" },
    ]},
    { id: "1c", name: "lib", type: "folder", children: [
      { id: "1c1", name: "data.ts", type: "file", size: "26.3 KB", lang: "ts", modified: "6 hrs ago" },
      { id: "1c2", name: "roles.ts", type: "file", size: "0.8 KB", lang: "ts", modified: "6 hrs ago" },
      { id: "1c3", name: "store.ts", type: "file", size: "1.2 KB", lang: "ts", modified: "1 day ago" },
    ]},
  ]},
  { id: "2", name: "public", type: "folder", children: [
    { id: "2a", name: "favicon.ico", type: "file", size: "1.1 KB", lang: "ico", modified: "1 week ago" },
    { id: "2b", name: "logo.svg", type: "file", size: "2.4 KB", lang: "svg", modified: "3 days ago" },
  ]},
  { id: "3", name: "package.json", type: "file", size: "2.1 KB", lang: "json", modified: "1 day ago" },
  { id: "4", name: "tsconfig.json", type: "file", size: "0.8 KB", lang: "json", modified: "1 week ago" },
  { id: "5", name: "next.config.ts", type: "file", size: "0.3 KB", lang: "ts", modified: "2 days ago" },
  { id: "6", name: "README.md", type: "file", size: "1.4 KB", lang: "md", modified: "3 days ago" },
];

const LANG_COLORS: Record<string, string> = { tsx: "#5B8CFF", ts: "#5B8CFF", json: "#f59e0b", md: "#8b5cf6", svg: "#10b981", ico: "#71717a" };

function FileNode({ node, depth = 0, search }: { node: any; depth?: number; search: string }) {
  const [open, setOpen] = useState(depth < 2);
  const isFolder = node.type === "folder";
  const matchesSearch = !search || node.name.toLowerCase().includes(search.toLowerCase());
  const hasMatchingChildren = isFolder && node.children?.some((c: any) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.children && c.children.some((cc: any) => cc.name.toLowerCase().includes(search.toLowerCase()))));
  
  if (search && !matchesSearch && !hasMatchingChildren) return null;

  return (
    <div>
      <button onClick={() => isFolder && setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", paddingLeft: depth * 20 + 8, background: "none", border: "none", cursor: isFolder ? "pointer" : "default", borderRadius: 6, color: "#f5f5f5" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#1e1e20")} onMouseLeave={e => (e.currentTarget.style.background = "none")}>
        {isFolder ? (open ? <ChevronDown size={12} color="#52525b" /> : <ChevronRight size={12} color="#52525b" />) : <div style={{ width: 12 }} />}
        {isFolder ? <Folder size={14} color="#f59e0b" /> : <FileCode size={14} color={LANG_COLORS[node.lang] || "#71717a"} />}
        <span style={{ fontSize: 12, fontWeight: isFolder ? 600 : 400, flex: 1, textAlign: "left" }}>{node.name}</span>
        {!isFolder && <span style={{ fontSize: 9, color: "#3f3f46", fontFamily: "monospace" }}>{node.size}</span>}
        {!isFolder && <span style={{ fontSize: 9, color: "#3f3f46", fontFamily: "monospace" }}>{node.modified}</span>}
      </button>
      {isFolder && open && node.children?.map((child: any) => (
        <FileNode key={child.id} node={child} depth={depth + 1} search={search} />
      ))}
    </div>
  );
}

export default function FilesPage() {
  const [search, setSearch] = useState("");
  const totalFiles = JSON.stringify(FILE_TREE).split('"file"').length - 1;
  const totalFolders = JSON.stringify(FILE_TREE).split('"folder"').length - 1;

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Files</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>{totalFiles} files in {totalFolders} folders</p>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <Search size={14} color="#3f3f46" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." style={{ width: "100%", background: "#111113", border: "1px solid #27272A", borderRadius: 10, padding: "9px 12px 9px 34px", color: "#f5f5f5", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ borderRadius: 14, background: "#111113", border: "1px solid #27272A", padding: "8px 4px" }}>
        {FILE_TREE.map(node => <FileNode key={node.id} node={node} search={search} />)}
      </div>
    </div>
  );
}
