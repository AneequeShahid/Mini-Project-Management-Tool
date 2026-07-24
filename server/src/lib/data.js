export const dummyData = {
  projects: [
    { _id: "p1", name: "Nucleus Core", health: 92, status: "Active", description: "Core engine refactor" },
    { _id: "p2", name: "Nebula UI", health: 88, status: "Active", description: "Design system migration" },
    { _id: "p3", name: "Pulse OS", health: 95, status: "Active", description: "Core AI platform" },
  ],
  tasks: Array.from({ length: 40 }).map((_, i) => ({
    _id: `t${i}`,
    title: `Task ${i + 1}`,
    status: ["Todo", "In Progress", "In Review", "Done"][i % 4],
    priority: ["Low", "Medium", "High", "Critical"][i % 4],
    storyPoints: Math.floor(Math.random() * 13) + 1,
    projectId: i % 3 === 0 ? "p1" : i % 3 === 1 ? "p2" : "p3",
  })),
  sprints: [
    { _id: "s1", name: "Sprint 1", goal: "Foundation", status: "Completed" },
    { _id: "s2", name: "Sprint 2", goal: "Core Features", status: "Active" },
  ],
  team: [
    { name: "Sarah" },
    { name: "Aneeque" },
    { name: "Alex" },
  ],
  integrations: [
    { name: "GitHub", status: "Connected" },
    { name: "Slack", status: "Connected" },
    { name: "Zoom", status: "Connected" },
  ],
  activity: [
    { action: "PR merged", time: "09:20" },
    { action: "Risk recalculated", time: "09:22" },
  ]
};
