"use client";
import { useState, useEffect, useRef } from "react";
import { Brain, ZoomIn, ZoomOut, Maximize2, RefreshCw } from "lucide-react";

const NODES = [
  { id: "n1", label: "Auth Module", group: "architecture", x: 400, y: 200, size: 42 },
  { id: "n2", label: "OAuth Flow", group: "architecture", x: 250, y: 120, size: 32 },
  { id: "n3", label: "SAML SSO", group: "architecture", x: 280, y: 300, size: 30 },
  { id: "n4", label: "Token Refresh", group: "optimization", x: 150, y: 220, size: 28 },
  { id: "n5", label: "Database Indexes", group: "optimization", x: 550, y: 150, size: 36 },
  { id: "n6", label: "Sprint Velocity", group: "analytics", x: 600, y: 300, size: 34 },
  { id: "n7", label: "Recharts", group: "design", x: 700, y: 220, size: 26 },
  { id: "n8", label: "Modal System", group: "design", x: 480, y: 380, size: 30 },
  { id: "n9", label: "Vercel Deploy", group: "devops", x: 350, y: 420, size: 32 },
  { id: "n10", label: "Agent Protocol", group: "ai", x: 550, y: 450, size: 38 },
  { id: "n11", label: "Vector Store", group: "ai", x: 700, y: 400, size: 28 },
  { id: "n12", label: "Next.js Router", group: "architecture", x: 180, y: 380, size: 30 },
  { id: "n13", label: "Zustand Store", group: "architecture", x: 100, y: 320, size: 26 },
  { id: "n14", label: "Tailwind CSS", group: "design", x: 650, y: 100, size: 24 },
  { id: "n15", label: "Supabase", group: "devops", x: 450, y: 80, size: 34 },
];

const EDGES = [
  ["n1", "n2"], ["n1", "n3"], ["n1", "n4"], ["n2", "n4"], ["n5", "n6"], ["n6", "n7"],
  ["n8", "n7"], ["n9", "n8"], ["n10", "n11"], ["n10", "n6"], ["n1", "n12"], ["n12", "n13"],
  ["n7", "n14"], ["n5", "n15"], ["n1", "n15"], ["n3", "n15"], ["n10", "n15"], ["n9", "n12"],
];

const GROUP_COLORS: Record<string, string> = {
  architecture: "#5B8CFF", optimization: "#10b981", analytics: "#8b5cf6",
  design: "#f59e0b", devops: "#00e5ff", ai: "#ec4899",
};

export default function GraphPage() {
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const selectedNode = NODES.find(n => n.id === selected);
  const connectedIds = selected ? EDGES.filter(e => e.includes(selected)).flat().filter(id => id !== selected) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Knowledge Graph</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>{NODES.length} nodes · {EDGES.length} connections</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} style={{ width: 32, height: 32, borderRadius: 8, background: "#111113", border: "1px solid #27272A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><ZoomIn size={14} color="#a1a1aa" /></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))} style={{ width: 32, height: 32, borderRadius: 8, background: "#111113", border: "1px solid #27272A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><ZoomOut size={14} color="#a1a1aa" /></button>
          <button onClick={() => { setZoom(1); setSelected(null); }} style={{ width: 32, height: 32, borderRadius: 8, background: "#111113", border: "1px solid #27272A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Maximize2 size={14} color="#a1a1aa" /></button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries(GROUP_COLORS).map(([group, color]) => (
          <div key={group} className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: 10, color: "#52525b", textTransform: "capitalize" }}>{group}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 300px" : "1fr", gap: 14 }}>
        {/* Graph canvas */}
        <div style={{ borderRadius: 14, background: "#09090B", border: "1px solid #27272A", height: 500, overflow: "hidden", position: "relative" }}>
          <svg width="100%" height="100%" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
            {/* Edges */}
            {EDGES.map(([from, to], i) => {
              const f = NODES.find(n => n.id === from);
              const t = NODES.find(n => n.id === to);
              if (!f || !t) return null;
              const isHighlighted = selected && (from === selected || to === selected);
              return <line key={i} x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={isHighlighted ? "#5B8CFF" : "#1e1e20"} strokeWidth={isHighlighted ? 2 : 1} opacity={selected && !isHighlighted ? 0.15 : 1} />;
            })}
            {/* Nodes */}
            {NODES.map(n => {
              const color = GROUP_COLORS[n.group] || "#5B8CFF";
              const isSelected = n.id === selected;
              const isConnected = connectedIds.includes(n.id);
              const isHovered = n.id === hoveredNode;
              const opacity = selected ? (isSelected || isConnected ? 1 : 0.2) : 1;
              return (
                <g key={n.id} onClick={() => setSelected(isSelected ? null : n.id)} onMouseEnter={() => setHoveredNode(n.id)} onMouseLeave={() => setHoveredNode(null)} style={{ cursor: "pointer", opacity, transition: "opacity 0.3s" }}>
                  <circle cx={n.x} cy={n.y} r={n.size / 2 + (isHovered ? 4 : 0)} fill={`${color}22`} stroke={color} strokeWidth={isSelected ? 3 : 1.5} />
                  <circle cx={n.x} cy={n.y} r={4} fill={color} />
                  <text x={n.x} y={n.y + n.size / 2 + 14} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontWeight={600} fontFamily="'Space Grotesk', sans-serif">{n.label}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        {selected && selectedNode && (
          <div style={{ borderRadius: 14, background: "#111113", border: "1px solid #27272A", padding: 20, alignSelf: "start" }}>
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${GROUP_COLORS[selectedNode.group]}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={16} color={GROUP_COLORS[selectedNode.group]} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#f5f5f5" }}>{selectedNode.label}</p>
                <p style={{ fontSize: 10, color: GROUP_COLORS[selectedNode.group], textTransform: "uppercase", fontWeight: 700 }}>{selectedNode.group}</p>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #1c1c1f", paddingTop: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Connected Nodes ({connectedIds.length})</p>
              <div className="space-y-2">
                {connectedIds.map(id => {
                  const node = NODES.find(n => n.id === id);
                  if (!node) return null;
                  return (
                    <button key={id} onClick={() => setSelected(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#09090B", border: "1px solid #1c1c1f", borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: GROUP_COLORS[node.group] }} />
                      <span style={{ fontSize: 11, color: "#a1a1aa" }}>{node.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
