"use client";

import { useState } from "react";
import { HardDrive, CheckCircle2, GitBranch, ArrowUpRight, HelpCircle } from "lucide-react";

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState([
    { id: "dep_1", project: "Acme Core API", branch: "main", commit: "configure npm legacy-peer-deps", status: "READY", url: "https://gravity-platform.vercel.app" },
    { id: "dep_2", project: "Acme Core API", branch: "main", commit: "update readme specifications", status: "READY", url: "https://gravity-platform-git-main.vercel.app" }
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Vercel Deployments</h1>
        <p className="text-slate-400 text-sm mt-1">Review live production release hashes and dynamic branch preview URLs.</p>
      </div>

      <div className="space-y-6">
        {deployments.map((dep) => (
          <div key={dep.id} className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-accent-purple/20 transition-all">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-heading">{dep.project}</h3>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20">
                  {dep.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <GitBranch size={12} /> {dep.branch}
                </span>
                <span className="text-slate-500 truncate max-w-[250px]">
                  Commit: {dep.commit}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
              <a
                href={dep.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-heading font-semibold rounded-xl transition-all"
              >
                Visit App <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
