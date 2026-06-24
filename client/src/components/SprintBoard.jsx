import React, { useEffect, useMemo, useState } from "react";
import API from "../api";

const DEFAULT_COLUMNS = [
  { id: "Todo", label: "To Do" },
  { id: "In Progress", label: "In Progress" },
  { id: "Done", label: "Done" },
];

export default function SprintBoard() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [status, setStatus] = useState("Todo");
  const [bugReport, setBugReport] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await API.get("/tasks");
        setTasks(data);
      } catch (e) {
        setError(e.message ? String(e.message) : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    DEFAULT_COLUMNS.forEach((column) => map.set(column.id, []));
    tasks.forEach((task) => {
      const key = task.status || "Todo";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(task);
    });
    return map;
  }, [tasks]);

  const addTask = async (event) => {
    event.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      const created = await API.post("/tasks", {
        title: title.trim(),
        description: description.trim(),
        status,
        storyPoints: storyPoints ? Number(storyPoints) : undefined,
        isBug: Boolean(bugReport.trim()),
        bugReport: bugReport.trim() || undefined,
      });
      setTasks((prev) => [...prev, created]);
      setTitle("");
      setDescription("");
      setStoryPoints("");
      setStatus("Todo");
      setBugReport("");
    } catch (e) {
      setError(e.message ? String(e.message) : "Failed to create task");
    }
  };

  const moveTask = async (taskId, status) => {
    setError("");
    try {
      const updated = await API.patch(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((item) => (item._id === taskId ? updated : item)));
    } catch (e) {
      setError(e.message ? String(e.message) : "Failed to update task");
    }
  };

  const onDragStart = (event, taskId) => {
    event.dataTransfer.setData("application/x-task-id", String(taskId));
  };

  const onDrop = async (event, status) => {
    const taskId = event.dataTransfer.getData("application/x-task-id");
    if (!taskId) return;
    const task = tasks.find((item) => item._id === taskId);
    if (task && task.status === status) return;
    await moveTask(taskId, status);
  };

  return (
    <div className="board">
      <form className="task-create" onSubmit={addTask}>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="User story title" maxLength={120} />
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Acceptance criteria" />
        <input type="number" value={storyPoints} onChange={(event) => setStoryPoints(event.target.value)} placeholder="Story points" min={0} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {DEFAULT_COLUMNS.map((column) => (
            <option key={column.id} value={column.id}>
              {column.label}
            </option>
          ))}
        </select>
        <input value={bugReport} onChange={(event) => setBugReport(event.target.value)} placeholder="Bug description (optional)" />
        <button type="submit">Add Task</button>
      </form>

      {error ? <p className="error" role="alert">{error}</p> : null}
      {loading ? <p className="loading">Loading board…</p> : null}

      <div className="columns">
        {DEFAULT_COLUMNS.map((column) => (
          <div
            key={column.id}
            className="column"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onDrop(event, column.id)}
          >
            <h2>{column.label}</h2>
            <ul>
              {grouped
                .get(column.id)
                ?.sort((a, b) => (a.storyPoints || 0) - (b.storyPoints || 0))
                .map((task) => (
                  <li key={task._id} draggable onDragStart={(event) => onDragStart(event, task._id)}>
                    <strong>{task.title}</strong>
                    <span>{task.storyPoints ? `${task.storyPoints} pts` : "Unestimated"}</span>
                    {task.isBug ? <span className="pill bug">Bug</span> : null}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
