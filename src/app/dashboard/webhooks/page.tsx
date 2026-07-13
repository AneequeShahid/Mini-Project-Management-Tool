"use client";

import { useState } from "react";
import { Link2, ShieldCheck, Terminal, Copy, ClipboardCheck } from "lucide-react";

export default function WebhooksPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const webhooks = [
    { id: "wh_1", source: "GitHub Webhook", url: "https://gravity-platform.vercel.app/api/webhooks/github", secret: "git_sec_123" },
    { id: "wh_2", source: "Slack Action Webhook", url: "https://gravity-platform.vercel.app/api/webhooks/slack", secret: "slack_sec_456" }
  ];

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Incoming Webhooks</h1>
        <p className="text-slate-400 text-sm mt-1">Manage destination endpoint urls and payload signature secrets for external publishers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {webhooks.map((wh) => (
          <div key={wh.id} className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] hover:border-accent-purple/20 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white text-[9px] font-bold uppercase tracking-wider font-heading">
                  {wh.source}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ID: {wh.id}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-black/35 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300">
                  <span className="truncate mr-2">{wh.url}</span>
                  <button
                    onClick={() => handleCopy(wh.url, wh.id)}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedId === wh.id ? <ClipboardCheck size={12} /> : <Copy size={12} />}
                  </button>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 font-mono text-[9px] text-slate-500">
                  Signature Secret: <span className="text-slate-300 font-semibold">{wh.secret}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
