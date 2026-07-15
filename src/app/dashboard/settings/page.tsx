"use client";
import { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, Palette, Globe, Key, Monitor, Moon, Sun, Save, ChevronRight, Check, Lock, Smartphone, Mail, CreditCard, Database, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    name: "Aneeque Shahid", email: "aneeque@gravity.dev", role: "Owner", timezone: "UTC+5",
    theme: "dark", accentColor: "#5B8CFF", density: "comfortable", notifications_email: true, notifications_slack: true, notifications_push: false,
    twoFactor: true, sessionTimeout: 30, apiKey: "grav_sk_****************************a3f9",
  });

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "api", label: "API Keys", icon: Key },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5", marginBottom: 24 }}>Settings</h1>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
        {/* Sidebar */}
        <div className="space-y-1">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500, background: activeTab === t.id ? "rgba(91,140,255,0.08)" : "transparent", color: activeTab === t.id ? "#5B8CFF" : "#71717a", textAlign: "left" }}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ borderRadius: 16, background: "#111113", border: "1px solid #27272A", padding: 28 }}>
          {activeTab === "profile" && (
            <div className="space-y-5">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f5f5f5", fontFamily: "'Space Grotesk', sans-serif" }}>Profile</h2>
              {[
                { label: "Full Name", value: settings.name, key: "name" },
                { label: "Email", value: settings.email, key: "email" },
                { label: "Role", value: settings.role, key: "role", disabled: true },
                { label: "Timezone", value: settings.timezone, key: "timezone" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</label>
                  <input type="text" value={f.value} disabled={f.disabled} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "9px 12px", color: f.disabled ? "#52525b" : "#f5f5f5", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <button onClick={save} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "#5B8CFF", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#000" }}>
                {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save Changes</>}
              </button>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-5">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f5f5f5", fontFamily: "'Space Grotesk', sans-serif" }}>Appearance</h2>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Theme</label>
                <div className="flex gap-3">
                  {[{ id: "dark", icon: Moon, label: "Dark" }, { id: "light", icon: Sun, label: "Light" }, { id: "system", icon: Monitor, label: "System" }].map(t => {
                    const Icon = t.icon;
                    return (
                      <button key={t.id} onClick={() => setSettings(p => ({ ...p, theme: t.id }))} style={{ flex: 1, padding: "14px", borderRadius: 10, border: "1px solid", cursor: "pointer", textAlign: "center", borderColor: settings.theme === t.id ? "#5B8CFF" : "#27272A", background: settings.theme === t.id ? "rgba(91,140,255,0.08)" : "#18181B" }}>
                        <Icon size={20} color={settings.theme === t.id ? "#5B8CFF" : "#52525b"} style={{ margin: "0 auto 6px" }} />
                        <p style={{ fontSize: 11, fontWeight: 600, color: settings.theme === t.id ? "#5B8CFF" : "#71717a" }}>{t.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Accent Color</label>
                <div className="flex gap-3">
                  {["#5B8CFF", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"].map(c => (
                    <button key={c} onClick={() => setSettings(p => ({ ...p, accentColor: c }))} style={{ width: 36, height: 36, borderRadius: 10, background: c, border: settings.accentColor === c ? "3px solid #fff" : "2px solid transparent", cursor: "pointer" }} />
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Density</label>
                <div className="flex gap-3">
                  {["compact", "comfortable", "spacious"].map(d => (
                    <button key={d} onClick={() => setSettings(p => ({ ...p, density: d }))} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600, textTransform: "capitalize", borderColor: settings.density === d ? "#5B8CFF" : "#27272A", background: settings.density === d ? "rgba(91,140,255,0.08)" : "#18181B", color: settings.density === d ? "#5B8CFF" : "#71717a" }}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-5">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f5f5f5", fontFamily: "'Space Grotesk', sans-serif" }}>Notifications</h2>
              {[
                { label: "Email Notifications", desc: "Receive sprint updates and task assignments via email", key: "notifications_email", icon: Mail },
                { label: "Slack Notifications", desc: "Get real-time alerts in your Slack channels", key: "notifications_slack", icon: Globe },
                { label: "Push Notifications", desc: "Browser push notifications for critical alerts", key: "notifications_push", icon: Smartphone },
              ].map(n => {
                const Icon = n.icon;
                return (
                  <div key={n.key} className="flex items-center justify-between" style={{ padding: "14px 16px", borderRadius: 12, background: "#18181B", border: "1px solid #27272A" }}>
                    <div className="flex items-center gap-3">
                      <Icon size={16} color="#5B8CFF" />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5" }}>{n.label}</p>
                        <p style={{ fontSize: 11, color: "#52525b" }}>{n.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => setSettings(p => ({ ...p, [n.key]: !(p as any)[n.key] }))} style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: (settings as any)[n.key] ? "#5B8CFF" : "#27272A", position: "relative" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: (settings as any)[n.key] ? 23 : 3, transition: "left 0.2s" }} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-5">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f5f5f5", fontFamily: "'Space Grotesk', sans-serif" }}>Security</h2>
              <div className="flex items-center justify-between" style={{ padding: "14px 16px", borderRadius: 12, background: "#18181B", border: "1px solid #27272A" }}>
                <div className="flex items-center gap-3">
                  <Lock size={16} color="#10b981" />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5" }}>Two-Factor Authentication</p>
                    <p style={{ fontSize: 11, color: "#52525b" }}>Protect your account with TOTP-based 2FA</p>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>Enabled</span>
              </div>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "#18181B", border: "1px solid #27272A" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5", marginBottom: 4 }}>Active Sessions</p>
                <p style={{ fontSize: 11, color: "#52525b", marginBottom: 12 }}>Manage your active login sessions</p>
                {[
                  { device: "Chrome · Windows 11", ip: "192.168.1.4", time: "Current session", current: true },
                  { device: "Safari · macOS", ip: "10.0.0.22", time: "2 days ago", current: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between" style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid #27272A" : "none" }}>
                    <div>
                      <p style={{ fontSize: 12, color: "#d4d4d8" }}>{s.device}</p>
                      <p style={{ fontSize: 10, color: "#3f3f46", fontFamily: "monospace" }}>{s.ip} · {s.time}</p>
                    </div>
                    {s.current ? <span style={{ fontSize: 9, fontWeight: 700, color: "#10b981" }}>CURRENT</span> : <button style={{ fontSize: 10, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Revoke</button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-5">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f5f5f5", fontFamily: "'Space Grotesk', sans-serif" }}>API Keys</h2>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "#18181B", border: "1px solid #27272A" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", marginBottom: 6 }}>Secret Key</p>
                <div className="flex items-center gap-3">
                  <code style={{ flex: 1, fontSize: 12, color: "#71717a", fontFamily: "monospace", background: "#09090B", padding: "8px 12px", borderRadius: 6 }}>{settings.apiKey}</code>
                  <button style={{ padding: "8px 14px", borderRadius: 8, background: "#1e1e20", border: "1px solid #27272A", fontSize: 11, fontWeight: 600, color: "#a1a1aa", cursor: "pointer" }}>Regenerate</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-5">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f5f5f5", fontFamily: "'Space Grotesk', sans-serif" }}>Billing</h2>
              <div style={{ padding: "20px", borderRadius: 12, background: "linear-gradient(135deg, rgba(91,140,255,0.08) 0%, rgba(139,92,246,0.06) 100%)", border: "1px solid rgba(91,140,255,0.15)" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#5B8CFF", textTransform: "uppercase", marginBottom: 4 }}>Current Plan</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "#f5f5f5", fontFamily: "'Space Grotesk', sans-serif" }}>Pro <span style={{ fontSize: 13, color: "#71717a" }}>$49/mo</span></p>
                <p style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>5 team members · Unlimited projects · AI agents · Priority support</p>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="space-y-5">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#ef4444", fontFamily: "'Space Grotesk', sans-serif" }}>Danger Zone</h2>
              {[
                { label: "Delete all projects", desc: "Permanently remove all projects and their data" },
                { label: "Reset workspace", desc: "Reset all settings and data to defaults" },
                { label: "Delete account", desc: "Permanently delete your account and all associated data" },
              ].map(d => (
                <div key={d.label} className="flex items-center justify-between" style={{ padding: "14px 16px", borderRadius: 12, background: "#18181B", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5" }}>{d.label}</p>
                    <p style={{ fontSize: 11, color: "#52525b" }}>{d.desc}</p>
                  </div>
                  <button style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 11, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
