"use client";

import { useState } from "react";
import { ListFilter, Calendar, ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function WorkflowsHistoryPage() {
  const [history, setHistory] = useState([
    { id: "run_1", workflow: "Sync GitHub Commits", status: "Success", time: "2026-07-08T20:00:00Z", message: "Dispatched Slack notify message." },
    { id: "run_2", workflow: "Create Task Notifications", status: "Success", time: "2026-07-08T19:45:00Z", message: "Resend email summary sent." },
    { id: "run_3", workflow: "Alert Manager on Risk", status: "Failed", time: "2026-07-08T18:30:00Z", message: "Timeout connection to webhook URL endpoint." }
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Workflow Executions</h1>
        <p className="text-slate-400 text-sm mt-1">Audit log tracking active execution histories and integration handshake statuses.</p>
      </div>

      <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-heading font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Execution ID</th>
                <th className="py-3 px-4">Workflow Name</th>
                <th className="py-3 px-4">Execution Status</th>
                <th className="py-3 px-4">Message Summary</th>
                <th className="py-3 px-4">Trigger Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((run) => (
                <tr key={run.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                  <td className="py-4 px-4 font-mono text-[10px] text-slate-500">{run.id}</td>
                  <td className="py-4 px-4 text-white font-semibold font-heading">{run.workflow}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${run.status === "Success" ? "text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/10" : "text-red-500 bg-red-500/10 border border-red-500/10"}`}>
                      {run.status === "Success" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {run.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-300">{run.message}</td>
                  <td className="py-4 px-4 text-slate-500 font-mono text-[10px]">
                    {new Date(run.time).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
