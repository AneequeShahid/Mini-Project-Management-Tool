"use client";

import { useState, useEffect } from "react";
import { Share2, Compass, Cpu, HelpCircle, Network } from "lucide-react";

interface Node {
  id: string;
  label: string;
  type: "project" | "sprint" | "task" | "pr" | "developer" | "adr";
  x: number;
  y: number;
  details: string;
}

interface Edge {
  source: string;
  target: string;
}

export default function KnowledgeGraphPage() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/graph")
      .then((res) => res.json())
      .then((data) => {
        const formatted = (data.nodes || []).map((node: any, idx: number, arr: any[]) => {
          const angle = (idx / arr.length) * 2 * Math.PI;
          return {
            ...node,
            x: node.x || 300 + 170 * Math.cos(angle),
            y: node.y || 230 + 170 * Math.sin(angle),
          };
        });
        setNodes(formatted);
        setEdges(data.edges || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);


  const colors: Record<Node["type"], string> = {
    project: "#8b5cf6", // Purple
    sprint: "#3b82f6",  // Blue
    task: "#10b981",    // Emerald
    pr: "#f59e0b",      // Amber
    developer: "#06b6d4", // Cyan
    adr: "#ec4899",     // Pink
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Engineering Knowledge Graph</h1>
        <p className="text-slate-400 text-sm mt-1">Interactive node visualizations displaying how tasks, pull requests, decisions, and agents are linked.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SVG Graph Canvas */}
        <div className="lg:col-span-2 p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] overflow-hidden relative min-h-[500px] flex items-center justify-center">
          <svg className="w-full h-[450px]" viewBox="0 0 600 500">
            {/* Draw Relation Edges */}
            {edges.map((edge, i) => {
              const srcNode = nodes.find((n) => n.id === edge.source);
              const tgtNode = nodes.find((n) => n.id === edge.target);
              if (!srcNode || !tgtNode) return null;
              return (
                <line
                  key={i}
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  className="stroke-white/15 stroke-[1.5]"
                  strokeDasharray="4"
                />
              );
            })}

            {/* Draw Interactive Nodes */}
            {nodes.map((node) => (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group select-none"
              >
                {/* Highlight ring on hover */}
                <circle
                  r="24"
                  fill="transparent"
                  className="stroke-white/0 group-hover:stroke-white/20 group-hover:stroke-2 transition-all duration-300"
                />
                {/* Node Center */}
                <circle
                  r="14"
                  fill={colors[node.type]}
                  className="shadow-2xl hover:scale-110 transition-transform duration-200"
                />
                {/* Inner White Dot */}
                <circle r="4" fill="#ffffff" />
                {/* Text Label */}
                <text
                  y="30"
                  textAnchor="middle"
                  className="fill-slate-300 text-[10px] font-heading font-semibold group-hover:fill-white transition-colors"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Visual Legend */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 p-3 bg-black/35 rounded-xl border border-white/5 text-[9px] font-bold uppercase tracking-wider font-heading">
            {Object.entries(colors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {type}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Info Drawer */}
        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <span 
                  className="px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider font-heading border"
                  style={{ color: colors[selectedNode.type], borderColor: `${colors[selectedNode.type]}30`, backgroundColor: `${colors[selectedNode.type]}10` }}
                >
                  {selectedNode.type} Node
                </span>
                <h3 className="text-xl font-bold font-heading text-white mt-1">{selectedNode.label}</h3>
                <p className="text-[10px] text-slate-500 font-mono">Node ID: {selectedNode.id}</p>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedNode.details}
                </p>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-wider font-heading">Active Relations</h4>
                  <div className="text-[10px] text-slate-400 font-mono space-y-1">
                    {edges
                      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((e, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          🟢 {e.source} &rarr; {e.target}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500 space-y-3">
              <Network size={32} className="text-slate-600 animate-pulse" />
              <p className="text-xs font-semibold font-heading">Click on any graph node to inspect active relations, blocked states, and node summaries.</p>
            </div>
          )}

          <div className="text-[10px] text-slate-500 pt-6 border-t border-white/5 flex items-center gap-1.5">
            <HelpCircle size={12} /> Double-click canvas to focus root project.
          </div>
        </div>
      </div>
    </div>
  );
}
