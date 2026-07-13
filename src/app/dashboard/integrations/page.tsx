"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Unlink, RefreshCw, CheckCircle2, Settings, AlertCircle, X } from "lucide-react";
import { GoogleCalendarIcon, GoogleMeetIcon, MicrosoftTeamsIcon, ZoomIcon, SlackIcon, GithubIcon, VercelIcon, NotionIcon, FigmaIcon } from "@/components/BrandIcons";

const PROVIDER_MAP: Record<string, string> = {
  gcal: "google",
  meet: "google",
  teams: "microsoft-teams",
  zoom: "zoom",
  slack: "slack",
  github: "github",
  vercel: "vercel",
  figma: "figma",
  notion: "notion"
};

export default function IntegrationsPage() {
  const [integrationsList, setIntegrationsList] = useState([
    { id: "gcal", name: "Google Calendar", category: "productivity", status: "Disconnected", sync: "Never", desc: "Sync sprint milestones and schedule team events directly in calendars." },
    { id: "meet", name: "Google Meet", category: "video", status: "Disconnected", sync: "Never", desc: "Automatically generate Meet conference links inside project tasks." },
    { id: "teams", name: "Microsoft Teams", category: "video", status: "Disconnected", sync: "Never", desc: "Create Teams meetings and sync team chats to activity feeds." },
    { id: "zoom", name: "Zoom Meetings", category: "video", status: "Disconnected", sync: "Never", desc: "Schedule Zoom calls with auto-recorded transcription pipelines." },
    { id: "slack", name: "Slack Alerts", category: "messaging", status: "Disconnected", sync: "Never", desc: "Broadcast event logs, task assignments, and AI risk alerts." },
    { id: "github", name: "GitHub Hooks", category: "developer", status: "Disconnected", sync: "Never", desc: "Sync commits, branches, reviews, and pull request changes." },
    { id: "vercel", name: "Vercel Deployments", category: "developer", status: "Disconnected", sync: "Never", desc: "Track build failures, preview URLs, and speed statistics." },
    { id: "figma", name: "Figma Designs", category: "design", status: "Disconnected", sync: "Never", desc: "Embed design system canvas frames and review live comments." },
    { id: "notion", name: "Notion Sync", category: "productivity", status: "Disconnected", sync: "Never", desc: "Export architecture proposals and sync meeting notes." }
  ]);

  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<any>(null);
  const [configValue, setConfigValue] = useState("");
  const [parentPageId, setParentPageId] = useState("");

  const workspaceId = "default-workspace-id";

  const fetchIntegrations = async () => {
    try {
      const res = await fetch(`/api/integrations/workspace/${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        const providers = data.map((item: any) => item.provider);
        setConnectedProviders(providers);

        setIntegrationsList(prev =>
          prev.map(item => {
            const providerName = PROVIDER_MAP[item.id];
            const isConnected = providers.includes(providerName);
            return {
              ...item,
              status: isConnected ? "Connected" : "Disconnected",
              sync: isConnected ? "Just now" : "Never"
            };
          })
        );
      }
    } catch (err) {
      console.error("Error loading integrations:", err);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const getBrandIcon = (id: string) => {
    switch (id) {
      case "gcal": return <GoogleCalendarIcon size={24} />;
      case "meet": return <GoogleMeetIcon size={24} />;
      case "teams": return <MicrosoftTeamsIcon size={24} />;
      case "zoom": return <ZoomIcon size={24} />;
      case "slack": return <SlackIcon size={24} />;
      case "github": return <GithubIcon size={24} />;
      case "vercel": return <VercelIcon size={24} />;
      case "figma": return <FigmaIcon size={24} />;
      case "notion": return <NotionIcon size={24} />;
      default: return null;
    }
  };

  const handleConnect = (id: string) => {
    const provider = PROVIDER_MAP[id];
    if (provider === "google" || provider === "zoom") {
      // Redirect to OAuth flows
      window.location.href = `/api/auth/oauth/${provider}?workspaceId=${workspaceId}`;
    } else {
      // Open custom config modal for key entry
      setShowConfigModal(id);
      setConfigValue("");
      setParentPageId("");
    }
  };

  const submitConfig = async () => {
    if (!showConfigModal) return;
    setLoadingId(showConfigModal);
    const provider = PROVIDER_MAP[showConfigModal];

    try {
      const payload: any = {
        provider,
        credentials: {
          accessToken: configValue,
        },
      };

      if (provider === "notion" && parentPageId) {
        payload.settings = { parentPageId };
      }

      const res = await fetch(`/api/integrations/workspace/${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchIntegrations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
      setShowConfigModal(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    setLoadingId(id);
    const provider = PROVIDER_MAP[id];

    try {
      // Fetch active integration ID to delete
      const res = await fetch(`/api/integrations/workspace/${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        const target = data.find((x: any) => x.provider === provider);
        if (target) {
          const delRes = await fetch(`/api/integrations/${target.id}`, {
            method: "DELETE",
          });
          if (delRes.ok) {
            await fetchIntegrations();
          }
        }
      }
    } catch (err) {
      console.error("Error disconnecting integration:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Integrations Store</h1>
          <p className="text-slate-400 text-sm mt-1">Connect your workspace to premium third-party developer resources, communication hubs, and calendar networks.</p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-300 font-heading">
            <CheckCircle2 size={12} className="text-accent-emerald" /> {connectedProviders.length} Active Connections
          </span>
        </div>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationsList.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-white/[0.02] border border-white/5 hover:border-accent-purple/20 rounded-[28px] backdrop-blur-[24px] transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/5 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <span className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                  {getBrandIcon(item.id)}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-heading border ${item.status === "Connected" ? "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/10" : "text-slate-500 bg-white/5 border-white/10"}`}>
                    {item.status}
                  </span>
                  {item.status === "Connected" && (
                    <span className="text-[9px] text-slate-500 font-mono">Sync: {item.sync}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-heading">{item.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{item.desc}</p>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2 relative z-10">
              {item.status === "Connected" ? (
                <>
                  <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <Settings size={14} />
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDisconnect(item.id)}
                    disabled={loadingId === item.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 font-heading transition-colors cursor-pointer"
                  >
                    {loadingId === item.id ? <RefreshCw size={12} className="animate-spin" /> : <Unlink size={12} />} Disconnect
                  </motion.button>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <AlertCircle size={10} /> Setup required
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleConnect(item.id)}
                    disabled={loadingId === item.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-purple/10 hover:bg-accent-purple/20 border border-accent-purple/20 text-xs font-semibold text-accent-purple font-heading transition-colors cursor-pointer"
                  >
                    {loadingId === item.id ? <RefreshCw size={12} className="animate-spin" /> : <Link2 size={12} />} Connect
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Config Entry Modal for Non-OAuth integrations */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 bg-slate-900 border border-white/10 rounded-3xl space-y-6 relative"
            >
              <button
                onClick={() => setShowConfigModal(null)}
                className="absolute right-4 top-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-heading">
                  Connect {integrationsList.find(x => x.id === showConfigModal)?.name}
                </h3>
                <p className="text-xs text-slate-400">Configure connection tokens and credentials securely.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Access Token / Webhook URL
                  </label>
                  <input
                    type="password"
                    placeholder="Enter access token / key..."
                    value={configValue}
                    onChange={(e) => setConfigValue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-accent-purple"
                  />
                </div>

                {PROVIDER_MAP[showConfigModal] === "notion" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Parent Page ID (Target)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter target Page ID..."
                      value={parentPageId}
                      onChange={(e) => setParentPageId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-accent-purple"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowConfigModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={submitConfig}
                  className="px-5 py-2.5 rounded-xl bg-accent-purple text-white text-xs font-semibold hover:bg-accent-purple/80"
                >
                  Save Integration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
