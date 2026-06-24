import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SprintRoutes() {
  const { projectId } = useParams();
  const [sprints, setSprints] = useState([]);
  const [draft, setDraft] = useState({ name: "", goal: "", startDate: "", endDate: "", status: "Planned" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/sprints?project=${encodeURIComponent(projectId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSprints(data);
    } catch (e) {
      setError(e.message || "Failed to load sprints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const createSprint = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, project: projectId }),
      });
      if (!res.ok) throw new Error("Create failed");
      const created = await res.json();
      setSprints((prev) => [...prev, created]);
      setDraft({ name: "", goal: "", startDate: "", endDate: "", status: "Planned" });
    } catch (e) {
      setError(e.message || "Failed to create sprint");
    }
  };

  return (
    <div>
      <h1>Sprints</h1>
      {error && <p role="alert">{error}</p>}
      {loading ? <p>Loading sprints…</p> : null}
      <ul>
        {sprints.map((sprint) => (
          <li key={sprint._id}>
            <strong>{sprint.name}</strong> — {sprint.status}
            <div>{sprint.goal}</div>
            <div>{new Date(sprint.startDate).toDateString()} → {new Date(sprint.endDate).toDateString()}</div>
          </li>
        ))}
      </ul>
      <form onSubmit={createSprint}>
        <input value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Sprint name" required />
        <input value={draft.goal} onChange={(e) => setDraft((prev) => ({ ...prev, goal: e.target.value }))} placeholder="Goal" />
        <input type="date" value={draft.startDate} onChange={(e) => setDraft((prev) => ({ ...prev, startDate: e.target.value }))} required />
        <input type="date" value={draft.endDate} onChange={(e) => setDraft((prev) => ({ ...prev, endDate: e.target.value }))} required />
        <select value={draft.status} onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value }))}>
          <option value="Planned">Planned</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
        <button type="submit">Create Sprint</button>
      </form>
    </div>
  );
}
