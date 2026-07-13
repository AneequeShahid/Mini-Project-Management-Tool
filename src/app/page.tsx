import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Floating Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-[120px] animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/20 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />

      <main className="relative z-10 max-w-4xl mx-auto text-center px-6 py-12 flex flex-col items-center">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider text-accent-cyan uppercase mb-6 font-heading">
          ✨ AI-Native Project Intelligence
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-bold font-heading text-white tracking-tight leading-[1.1] mb-6">
          Meet <span className="bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan bg-clip-text text-transparent">Pulse</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-lg text-slate-300 leading-relaxed mb-10">
          The next-generation intelligence platform that transforms raw issues, commits, and chats into predictive roadmaps and automated sprints.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center h-14 px-8 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold font-heading hover:brightness-110 active:scale-95 transition-all shadow-[0_8px_32px_rgba(139,92,246,0.3)] w-56 text-center"
          >
            Launch Platform
          </Link>
          <a
            href="https://github.com/AneequeShahid/mini-project-management-tool"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-14 px-8 rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold font-heading hover:bg-white/10 hover:text-white transition-colors w-56 text-center"
          >
            View Repository
          </a>
        </div>

        {/* Grid Visual */}
        <div className="mt-20 w-full max-w-3xl glass-card p-1 border border-white/10 overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent z-10 pointer-events-none" />
          <div className="h-48 bg-white/5 flex items-center justify-center text-slate-400 font-heading font-semibold text-sm">
            ⚡ Platform Sandbox Loaded
          </div>
        </div>
      </main>
    </div>
  );
}
