import { Sprint } from "../models/sprint.js";
import { Task } from "../models/task.js";
import { Project } from "../models/project.js";
import { Parser } from "json2csv";

export async function exportProjectReport(req, res) {
  const { projectId } = req.params;
  const tasks = await Task.find({ project: projectId }).populate("assignee", "name").lean();
  
  const formattedTasks = tasks.map(t => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    storyPoints: t.storyPoints || 0,
    dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "",
    assignee: t.assignee?.name || "Unassigned"
  }));
  
  const fields = ["title", "status", "priority", "storyPoints", "dueDate", "assignee"];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(formattedTasks);
  
  res.header("Content-Type", "text/csv");
  res.attachment(`project_report_${projectId}.csv`);
  res.send(csv);
}

export async function getAnalytics(req, res) {
  const { projectId } = req.params;
  const projectFilter = projectId ? { project: projectId } : {};

  const sprints = await Sprint.find(projectFilter).sort({ startDate: 1 });
  const tasks = await Task.find(projectFilter).populate("assignee", "name");

  // Velocity chart: story points completed per sprint
  const velocityData = sprints.map((s) => {
    const sprintTasks = tasks.filter((t) => t.sprint?.toString() === s._id.toString());
    const completed = sprintTasks.filter((t) => t.status === "Done").reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const total = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    return { sprint: s.name, completed, total, status: s.status };
  });

  // Cycle time: average days from creation to Done
  const doneTasks = tasks.filter((t) => t.status === "Done" && t.createdAt);
  const cycleTime = doneTasks.length
    ? Math.round(doneTasks.reduce((sum, t) => sum + (new Date(t.updatedAt) - new Date(t.createdAt)) / 86400000, 0) / doneTasks.length)
    : 0;

  // Lead time: average days from creation to now (or completion)
  const leadTime = tasks.length
    ? Math.round(
        tasks.reduce((sum, t) => {
          const end = t.status === "Done" ? new Date(t.updatedAt) : new Date();
          return sum + (end - new Date(t.createdAt)) / 86400000;
        }, 0) / tasks.length
      )
    : 0;

  // Cumulative Flow over Time
  const statuses = ["Backlog", "Todo", "In Progress", "In Review", "Done"];
  const projectStart = sprints.length ? new Date(sprints[0].startDate) : new Date();
  const projectEnd = new Date();
  const totalDays = Math.ceil((projectEnd - projectStart) / 86400000) || 1;
  
  const timeSeriesCFD = [];
  for (let i = 0; i <= totalDays; i++) {
    const day = new Date(projectStart);
    day.setDate(day.getDate() + i);
    const dateStr = day.toISOString().slice(0, 10);
    
    const counts = statuses.map((status) => {
      const count = tasks.filter((t) => {
        if (t.createdAt > day) return false;
        // This is a simplification: we assume the status at the end of the day
        // In a real system, we'd use a status history log
        return t.status === status;
      }).length;
      return { status, count };
    });
    timeSeriesCFD.push({ date: dateStr, counts });
  }

  // Velocity Trend (percentage change from previous sprint)
  const velocityTrend = velocityData.map((s, i, arr) => {
    const prev = arr[i - 1];
    const change = prev ? ((s.completed - prev.completed) / prev.completed) * 100 : 0;
    return { ...s, trend: change };
  });


  // Workload distribution
  const workload = {};
  tasks.forEach((t) => {
    if (t.assignee) {
      const name = t.assignee.name || "Unknown";
      if (!workload[name]) workload[name] = { assigned: 0, completed: 0, inProgress: 0 };
      workload[name].assigned++;
      if (t.status === "Done") workload[name].completed++;
      if (t.status === "In Progress") workload[name].inProgress++;
    }
  });

  // Sprint success rate
  const completedSprints = sprints.filter((s) => s.status === "Completed");
  const sprintSuccessRate = completedSprints.length
    ? Math.round(
        (completedSprints.filter((s) => {
          const sprintTasks = tasks.filter((t) => t.sprint?.toString() === s._id.toString());
          if (!sprintTasks.length) return false;
          const done = sprintTasks.filter((t) => t.status === "Done").length;
          return done / sprintTasks.length >= 0.7;
        }).length /
          completedSprints.length) *
          100
      )
    : 0;

  // Burnup data for latest sprint
  const latestSprint = sprints.filter((s) => s.status === "Active" || s.status === "Completed").pop();
  let burnupData = [];
  if (latestSprint) {
    const sprintTasks = tasks.filter((t) => t.sprint?.toString() === latestSprint._id.toString());
    const totalDays = Math.ceil((new Date(latestSprint.endDate) - new Date(latestSprint.startDate)) / 86400000) || 1;
    const totalPoints = sprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
    for (let i = 0; i <= totalDays; i++) {
      const day = new Date(latestSprint.startDate);
      day.setDate(day.getDate() + i);
      const completed = sprintTasks.filter((t) => t.status === "Done" && new Date(t.updatedAt) <= day)
        .reduce((s, t) => s + (t.storyPoints || 0), 0);
      burnupData.push({
        day: day.toISOString().slice(0, 10),
        completed,
        total: totalPoints,
      });
    }
  }

  res.json({
    velocityData: velocityTrend,
    cycleTime,
    leadTime,
    cumulativeFlow: statuses.map((status) => ({
      status,
      count: tasks.filter((t) => t.status === status).length,
    })),
    timeSeriesCFD,
    workload,
    sprintSuccessRate,
    burnupData,
    totalSprints: sprints.length,
    totalTasks: tasks.length,
  });

}
