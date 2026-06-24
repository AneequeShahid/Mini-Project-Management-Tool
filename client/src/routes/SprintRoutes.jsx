import { useEffect, useState } from "react";

export default function SprintRoutes() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sprints");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSprints(data);
    } catch (e) {
      setError(e.message || "Failed to load sprints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1>Sprints</h1>
      {error ? <p role="alert">{error}</p> : null}
      {loading ? <p>Loading sprints…</p> : null}
      <ul>
        {sprints.map((sprint) => (
          <li key={sprint._id}>
            <strong>{sprint.name}</strong> — {sprint.status}
            <div>{sprint.goal}</div>
            <div>
              {sprint.startDate ? new Date(sprint.startDate).toDateString() : "—"} →{" "}
              {sprint.endDate ? new Date(sprint.endDate).toDateString() : "—"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
