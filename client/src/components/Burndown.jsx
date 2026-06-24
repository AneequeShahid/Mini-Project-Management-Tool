import { useMemo, useState } from "react";

export default function Burndown() {
  const [data, setData] = useState([]);

  const load = async () => {
    const res = await fetch("/api/burndown");
    const json = await res.json();
    const filtered = Array.isArray(json) ? json : [];
    setData(filtered);
    if (filtered.length > 0) {
      const sorted = filtered.slice().sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const max = sorted[0].remainingPoints;
      const rows = sorted.map((item, idx) => ({
        date: item.date,
        actual: item.remainingPoints,
        ideal: Number(
          Math.max(0, max - (max / Math.max(sorted.length - 1, 1)) * idx).toFixed(2)
        ),
      }));
      setData(rows);
    }
  };

  const max = useMemo(() => Math.max(...data.map((d) => d.actual ?? d.remainingPoints ?? 0), 0), [data]);

  return (
    <>
      <h2>Burndown Chart</h2>
      <button type="button" onClick={load}>Load burndown</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
