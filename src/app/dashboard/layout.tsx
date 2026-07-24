"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, GanttChartSquare, Gift, Compass, Cpu,
  GitPullRequest, Network, BarChart3, ShieldAlert, Brain, Link2,
  Activity, Video, History, Webhook, Layers, Folder, LayoutGrid,
  Inbox, Sliders, Sparkles, Search, Bell, Plus, ChevronDown, Settings, LogOut, UsersRound, X, Globe
} from "lucide-react";
import { useState } from "react";

const navGroups = [
  {
    label: "Home",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ]
  },
  {
    label: "Work & Planning",
    items: [
      { href: "/dashboard/views", label: "Workspace Views", icon: LayoutGrid, badge: "12" },
      { href: "/dashboard/triage", label: "Triage Intake", icon: Inbox },
      { href: "/dashboard/work-items", label: "Work Items", icon: Sliders },
      { href: "/dashboard/team", label: "Team Intelligence", icon: UsersRound, tag: "AI" },
      { href: "/dashboard/calendar", label: "Calendar Hub", icon: Calendar, badge: "3" },
      { href: "/dashboard/gantt", label: "Roadmaps", icon: GanttChartSquare },
      { href: "/dashboard/wrapped", label: "Project Wrapped", icon: Gift },
    ]
  },
  {
    label: "Knowledge & AI",
    items: [
      { href: "/dashboard/timeline", label: "AI Timeline", icon: Compass },
      { href: "/dashboard/agents", label: "AI Agents", icon: Cpu },
      { href: "/dashboard/adr", label: "ADR Log", icon: GitPullRequest },
      { href: "/dashboard/graph", label: "Knowledge Graph", icon: Network },
      { href: "/dashboard/memory", label: "Eng Memory", icon: Brain, tag: "AI" },
      { href: "/dashboard/decompose", label: "Task Decompose", icon: Sparkles, tag: "NEW" },
      { href: "/dashboard/scraper", label: "Web Intelligence", icon: Globe, tag: "AI" },
    ]
  },
  {
    label: "Automation",
    items: [
      { href: "/dashboard/observability", label: "Observability", icon: BarChart3 },
      { href: "/dashboard/guardrails", label: "AI Guardrails", icon: ShieldAlert },
      { href: "/dashboard/integrations", label: "Integrations", icon: Link2 },
      { href: "/dashboard/automation", label: "Automation", icon: Activity },
      { href: "/dashboard/meetings", label: "Meetings", icon: Video },
      { href: "/dashboard/workflows", label: "Workflows", icon: History, badge: "8" },
      { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
      { href: "/dashboard/deployments", label: "Deployments", icon: Layers },
      { href: "/dashboard/files", label: "Files", icon: Folder, tag: "NEW" },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState("");

  // Global Ctrl+K handler
  useState(() => {
    if (typeof window !== "undefined") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          setCommandOpen(open => !open);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  });

  const allNavItems = navGroups.flatMap(g => g.items);
  const filteredCmdItems = allNavItems.filter(item => 
    item.label.toLowerCase().includes(cmdSearch.toLowerCase()) ||
    item.href.toLowerCase().includes(cmdSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#050505", color: "#f5f5f5" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, borderRight: "1px solid #1c1c1f", background: "#09090B", flexShrink: 0 }} className="flex flex-col">
        {/* Brand */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #1c1c1f" }}>
          <div className="flex items-center gap-2.5 mb-4 font-bold">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #5B8CFF, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: "#f5f5f5" }}>Pulse</span>
          </div>
 
          {/* Workspace pill */}
          <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 10, padding: "8px 12px" }} className="flex items-center justify-between cursor-pointer">
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#f5f5f5" }}>Acme Corp</p>
              <p style={{ fontSize: 10, color: "#52525b", fontFamily: "monospace" }}>Enterprise · 12 Members</p>
            </div>
            <ChevronDown size={12} color="#52525b" />
          </div>
        </div>
 
        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 8px", marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, marginBottom: 1,
                      background: active ? "rgba(91,140,255,0.08)" : "transparent",
                      color: active ? "#5B8CFF" : "#a1a1aa",
                      fontSize: 13, fontWeight: 500, textDecoration: "none",
                      transition: "all 0.12s",
                      borderLeft: active ? "2px solid #5B8CFF" : "2px solid transparent",
                    }}
                  >
                    <Icon size={15} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(91,140,255,0.12)", color: "#5B8CFF", padding: "1px 6px", borderRadius: 6, fontFamily: "monospace" }}>
                        {item.badge}
                      </span>
                    )}
                    {"tag" in item && item.tag && (
                      <span style={{ fontSize: 9, fontWeight: 700, background: item.tag === "NEW" ? "rgba(16,185,129,0.1)" : "rgba(139,92,246,0.1)", color: item.tag === "NEW" ? "#10b981" : "#8b5cf6", padding: "1px 5px", borderRadius: 4, textTransform: "uppercase" }}>
                        {item.tag}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
 
        {/* User card */}
        <div style={{ borderTop: "1px solid #1c1c1f", padding: "12px 16px" }} className="flex items-center gap-3">
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #5B8CFF, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
            AS
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#f5f5f5" }}>Aneeque Shahid</p>
            <p style={{ fontSize: 10, color: "#52525b" }}>Lead Architect</p>
          </div>
          <Link href="/dashboard/settings" style={{ color: "#52525b" }}>
            <Settings size={14} />
          </Link>
        </div>
      </aside>
 
      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
        {/* TopBar */}
        <header style={{ height: 56, borderBottom: "1px solid #1c1c1f", background: "rgba(9,9,11,0.8)", backdropFilter: "blur(12px)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
          {/* Left: breadcrumb */}
          <div className="flex items-center gap-2" style={{ flex: 1 }}>
            <span style={{ fontSize: 12, color: "#52525b", fontFamily: "monospace" }}>Acme Corp</span>
            <span style={{ color: "#27272A" }}>/</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#f5f5f5", textTransform: "capitalize", fontFamily: "'Space Grotesk', sans-serif" }}>
              {pathname === "/dashboard" ? "Dashboard" : pathname.split("/").pop()}
            </span>
          </div>
 
          {/* Right: actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCommandOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#111113", border: "1px solid #27272A", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#52525b" }}
            >
              <Search size={12} />
              <span>Search...</span>
              <kbd style={{ fontSize: 9, fontFamily: "monospace", background: "#1e1e20", border: "1px solid #3f3f46", borderRadius: 4, padding: "1px 4px", color: "#a1a1aa" }}>⌘K</kbd>
            </button>
            <button onClick={() => router.push("/dashboard/views?createTask=1")} style={{ background: "#5B8CFF", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#000", display: "flex", alignItems: "center", gap: 4 }}>
              <Plus size={12} /> Create
            </button>
            <button onClick={() => router.push("/dashboard/triage")} style={{ width: 32, height: 32, borderRadius: 8, background: "#111113", border: "1px solid #27272A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={14} color="#a1a1aa" />
            </button>
          </div>
        </header>
 
        {/* Content */}
        <main style={{ padding: "24px", flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Command Palette Overlay */}
      {commandOpen && (
        <div 
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 100, display: "flex", alignItems: "start", justifyContent: "center", paddingTop: "10vh" }}
          onClick={() => setCommandOpen(false)}
        >
          <div 
            style={{ width: "100%", maxWidth: 540, background: "#111113", border: "1px solid #27272A", borderRadius: 14, overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #1c1c1f" }}>
              <Search size={16} color="#71717a" style={{ marginRight: 12 }} />
              <input 
                type="text" 
                value={cmdSearch}
                onChange={e => setCmdSearch(e.target.value)}
                placeholder="Search command center or type a page name..." 
                autoFocus
                style={{ flex: 1, background: "none", border: "none", color: "#f5f5f5", fontSize: 14, outline: "none" }}
              />
              <button 
                onClick={() => setCommandOpen(false)}
                style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto", padding: "8px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 12px" }}>
                Pages & Navigation
              </p>
              {filteredCmdItems.length === 0 ? (
                <p style={{ padding: "12px", textAlign: "center", color: "#52525b", fontSize: 12 }}>No matching pages found</p>
              ) : (
                filteredCmdItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button 
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setCommandOpen(false);
                      }}
                      style={{ 
                        width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, 
                        background: "none", border: "none", cursor: "pointer", color: "#a1a1aa", textAlign: "left"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(91,140,255,0.08)";
                        e.currentTarget.style.color = "#5B8CFF";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.color = "#a1a1aa";
                      }}
                    >
                      <Icon size={14} />
                      <span style={{ fontSize: 13, flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: 10, fontFamily: "monospace", opacity: 0.5 }}>{item.href}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

