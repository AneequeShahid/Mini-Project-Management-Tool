import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import API from "../api";

export default function Burndown() {
  const { sprintId } = useParams();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!sprintId) return;
      setError("");
      try {
        const res = await API.get(`/burndown/sprints/${sprintId}`);
        const points = Array.isArray(res) ? res : [];
        const sorted = points
          .slice()
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((item) => ({ date: new Date(item.date).toLocaleDateString(), remaining: item.remainingPoints }));
        setData(sorted);
      } catch (e) {
        setError(e.message ? String(e.message) : "Failed to load burndown");
      }
    })();
  }, [sprintId]);

  const idealLine = useMemo(() => {
    if (!data.length) return [];
    const max = Math.max(...data.map((d) => d.remaining));
    return data.map((d, idx) => ({ date: d.date, ideal: Math.max(0, Number((max - (max / Math.max(data.length - 1, 1)) * idx).toFixed(2))) }));
  }, [data]);

  return (
    <div>
      <h2>Burndown Chart</h2>
      {error ? <p role="alert">{error}</p> : null}
      {!sprintId ? <p>Select a sprint from the sprint routes to view its burndown.</p> : null}
      {sprintId && !data.length && !error ? <p>No burndown records found for this sprint yet.</p> : null}
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ideal" stroke="#94a3b8" name="Ideal Burndown" dot={false} />
            <Line type="monotone" dataKey="remaining" stroke="#38bdf8" name="Actual Remaining" />
          </LineChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
