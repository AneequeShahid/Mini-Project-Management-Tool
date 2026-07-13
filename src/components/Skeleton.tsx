export function SkeletonCard() {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse space-y-3">
      <div className="h-4 bg-white/10 rounded-lg w-3/4" />
      <div className="h-3 bg-white/10 rounded-lg w-1/2" />
      <div className="h-3 bg-white/10 rounded-lg w-full" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number, cols?: number }) {
  return (
    <div className="w-full">
      <div className="bg-white/5 border-b border-white/10 p-3 animate-pulse">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-white/10 rounded-lg w-20" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-3 flex gap-4 animate-pulse">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-white/10 rounded-lg flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCircle() {
  return <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />;
}

export function SkeletonText({ width = "100%" }: { width?: string }) {
  return <div className="h-4 bg-white/10 rounded-lg animate-pulse" style={{ width }} />;
}

export function SkeletonDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse space-y-2">
          <div className="h-6 bg-white/10 rounded-lg w-1/3" />
          <div className="h-8 bg-white/10 rounded-lg w-1/2" />
        </div>
      ))}
    </div>
  );
}
