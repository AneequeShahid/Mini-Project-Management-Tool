import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function TaskRoutes() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [status, setStatus] = useState("Todo");
  const [bugReport, setBugReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/tasks?project=${encodeURIComponent(projectId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setError(e.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const createTask = async (event) => {
    event.preventDefault();
    setError("");
    const trimmedBug = bugReport.trim();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: projectId,
          title,
          description,
          status,
          storyPoints: storyPoints ? Number(storyPoints) : undefined,
          isBug: Boolean(trimmedBug),
          bugReport: trimmedBug || undefined,
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      const created = await res.json();
      setTasks((prev) => [...prev, created]);
      setTitle("");
      setDescription("");
      setStoryPoints("");
      setStatus("Todo");
      setBugReport("");
    } catch (e) {
      setError(e.message || "Failed to create task");
    }
  };

  const moveTask = async (taskId, nextStatus) => {
    setError("");
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setTasks((prev) => prev.map((item) => (item._id === taskId ? updated : item)));
    } catch (e) {
      setError(e.message || "Failed to move task");
    }
  };

  return (
    <div>
      <h1>Task Board</h1>
      {error && <p role="alert">{error}</p>}
      {loading ? <p>Loading tasks…</p> : null}
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <strong>{task.title}</strong> — {task.status}
            {task.isBug ? <span style={{ marginLeft: 10 }}>Bug: {task.bugReport || "Reported"}</span> : null}
            <div>
              <button type="button" onClick={() => moveTask(task._id, "Todo")}>To Do</button>
              <button type="button" onClick={() => moveTask(task._id, "In Progress")}>In Progress</button>
              <button type="button" onClick={() => moveTask(task._id, "Done")}>Done</button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={createTask}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <input type="number" value={storyPoints} onChange={(e) => setStoryPoints(e.target.value)} placeholder="Story Points" min={0} />
        <input value={bugReport} onChange={(e) => setBugReport(e.target.value)} placeholder="Bug description (optional)" />
        <button type="submit">Create Task</button>
      </form>
    </div>
  );
}
