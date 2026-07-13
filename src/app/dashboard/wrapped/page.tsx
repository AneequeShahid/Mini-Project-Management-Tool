"use client";

import { useState, useEffect } from "react";
import { Sparkles, Trophy, Flame, Clock, Cpu, ChevronRight, ChevronLeft, Share2 } from "lucide-react";

export default function ProjectWrappedPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/wrapped")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const slides = [
    // Slide 1: Intro
    {
      bg: "from-accent-purple/20 via-accent-blue/15 to-bg-dark",
      content: (
        <div className="text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent-purple/10 border border-accent-purple/25 flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(139,92,246,0.2)]">
            🎁
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold font-heading text-white tracking-tight leading-none">
            Project <span className="bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan bg-clip-text text-transparent">Wrapped</span>
          </h2>
          <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
            Your engineering journey, collaboration streaks, and automated actions visualized for the past sprint cycle.
          </p>
        </div>
      ),
    },
    // Slide 2: Task Metrics
    {
      bg: "from-accent-blue/20 via-accent-cyan/15 to-bg-dark",
      content: (
        <div className="space-y-8 max-w-md mx-auto text-center animate-slide-up">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue">
            <Trophy size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-heading font-bold">Total Tasks Completed</p>
            <h3 className="text-6xl md:text-8xl font-black text-white font-heading tracking-tighter">
              {data?.tasksCompleted}
            </h3>
            <p className="text-xs text-accent-cyan font-semibold">You ranked in the top 3% of agile developers!</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-4">
            <Flame className="text-orange-500 animate-pulse" size={24} />
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Focus Streak</p>
              <p className="text-sm font-extrabold text-white font-heading">{data?.focusStreakDays} Consecutive Days</p>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 3: Peak Productivity Hours
    {
      bg: "from-accent-cyan/25 via-accent-purple/15 to-bg-dark",
      content: (
        <div className="space-y-8 max-w-md mx-auto text-center animate-scale-up">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
            <Clock size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-heading font-bold">Most Active Time</p>
            <h3 className="text-5xl md:text-7xl font-black text-white font-heading tracking-tight">
              {data?.peakActiveHour}
            </h3>
            <p className="text-xs text-slate-400">Night Owl developer profile detected 🦉</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-4">
            <Cpu className="text-accent-purple" size={24} />
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Primary Agent Partner</p>
              <p className="text-sm font-extrabold text-white font-heading">{data?.mostUsedAgent}</p>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 4: Achievement Badges
    {
      bg: "from-accent-purple/20 via-accent-cyan/20 to-bg-dark",
      content: (
        <div className="space-y-8 max-w-lg mx-auto text-center animate-slide-up">
          <div>
            <span className="text-2xl">🏆</span>
            <h3 className="text-2xl font-bold font-heading text-white mt-2">Earned Team Badges</h3>
            <p className="text-slate-400 text-xs mt-1">Badges unlocked during this sprint cycle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.teamBadges?.map((badge: any, i: number) => (
              <div key={i} className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-center space-y-2 hover:bg-white/5 transition-colors">
                <span className="text-3xl block">{badge.icon}</span>
                <h4 className="text-xs font-bold text-white font-heading">{badge.name}</h4>
                <p className="text-[10px] text-slate-400 leading-snug">{badge.desc}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={() => alert("Copied Wrapped URL to clipboard!")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold font-heading text-xs shadow-lg shadow-accent-purple/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <Share2 size={14} />
            Share Wrapped
          </button>
        </div>
      ),
    }
  ];

  return (
    <div className={`relative min-h-[70vh] rounded-[32px] overflow-hidden bg-gradient-to-br ${slides[currentSlide].bg} border border-white/10 p-8 md:p-16 flex flex-col justify-between shadow-2xl transition-all duration-700`}>
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Progress Bars */}
      <div className="flex gap-2 w-full max-w-md mx-auto relative z-10">
        {slides.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= currentSlide ? "bg-accent-purple" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Slide Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-8">
        {slides[currentSlide].content}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto relative z-10">
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="text-xs font-semibold text-slate-500 font-heading">
          {currentSlide + 1} / {slides.length}
        </span>

        <button
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlide === slides.length - 1}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
