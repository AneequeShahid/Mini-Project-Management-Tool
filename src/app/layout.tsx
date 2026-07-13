import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse // AI-Native Project Intelligence Platform",
  description: "Beautiful editorial roadmaps, predictive risks, and automatic workflows for high-performance engineering teams.",
  keywords: ["Next.js", "Supabase", "Jira Killer", "AI Project Management", "Project Intelligence", "Gantt Charts"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className="min-h-full bg-bg-dark text-slate-100 font-body antialiased selection:bg-accent-purple/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
