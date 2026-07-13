import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/user.js";
import { Project } from "./models/project.js";
import { Sprint } from "./models/sprint.js";
import { Task } from "./models/task.js";
import { Epic } from "./models/epic.js";
import { Milestone } from "./models/milestone.js";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.log("No MONGODB_URI set, skipping seed"); process.exit(0); }
  await mongoose.connect(uri);
  console.log("Connected, seeding enterprise data...");

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Sprint.deleteMany({}),
    Task.deleteMany({}),
    Epic.deleteMany({}),
    Milestone.deleteMany({}),
  ]);

  const pw = await bcrypt.hash("password123", 10);
  const admin = await User.create({ name: "Admin User", email: "admin@example.com", password: pw, role: "Admin" });
  const dev1 = await User.create({ name: "Alice Dev", email: "alice@example.com", password: pw, role: "Team Member" });
  const dev2 = await User.create({ name: "Bob Dev", email: "bob@example.com", password: pw, role: "Team Member" });
  const viewer = await User.create({ name: "Client Viewer", email: "client@example.com", password: pw, role: "Viewer" });

  // 1. Create Project Templates
  const templates = [
    {
      name: "SaaS MVP Starter",
      description: "Standard structure for building a SaaS product from 0 to 1",
      isTemplate: true,
      workspace: new mongoose.Types.ObjectId(),
      organization: new mongoose.Types.ObjectId(),
      owner: admin._id,
      members: [admin._id],
      roles: [{ user: admin._id, role: "Owner" }],
      // Custom Fields for SaaS
      customFieldDefinitions: [
        { name: "Subscription Tier", type: "dropdown", options: ["Free", "Pro", "Enterprise"] },
        { name: "Target Audience", type: "text" },
      ],
    },
    {
      name: "Mobile App Framework",
      description: "Optimized for React Native/Flutter development cycles",
      isTemplate: true,
      workspace: new mongoose.Types.ObjectId(),
      organization: new mongoose.Types.ObjectId(),
      owner: admin._id,
      members: [admin._id],
      roles: [{ user: admin._id, role: "Owner" }],
      customFieldDefinitions: [
        { name: "OS Version", type: "text" },
        { name: "Screen Size", type: "text" },
      ],
    },
  ];

  const createdTemplates = await Project.insertMany(templates);

  // Populate a template with some data (Sprints/Tasks)
  const saasTemplate = createdTemplates[0];
  const saasSprint = await Sprint.create({
    project: saasTemplate._id,
    name: "Foundation Sprint",
    goal: "Set up core auth and DB",
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 86400000),
    status: "Planned",
  });

  await Task.create([
    { project: saasTemplate._id, sprint: saasSprint._id, title: "Set up AWS/Vercel", status: "Todo", priority: "High", storyPoints: 5, createdBy: admin._id },
    { project: saasTemplate._id, sprint: saasSprint._id, title: "Implement JWT Auth", status: "Todo", priority: "Critical", storyPoints: 8, createdBy: admin._id },
  ]);

  // 2. Create an Active Project with everything enabled
  const mainProject = await Project.create({
    name: "Enterprise AI Platform",
    description: "Developing the next-gen AI project management tool",
    workspace: new mongoose.Types.ObjectId(),
    organization: new mongoose.Types.ObjectId(),
    owner: admin._id,
    members: [admin._id, dev1._id, dev2._id, viewer._id],
    roles: [
      { user: admin._id, role: "Owner" },
      { user: dev1._id, role: "Admin" },
      { user: dev2._id, role: "Member" },
      { user: viewer._id, role: "Viewer" },
    ],
    customFieldDefinitions: [
      { name: "Customer Segment", type: "dropdown", options: ["Enterprise", "SMB", "Individual"] },
      { name: "Estimated Revenue", type: "number" },
      { name: "Release Date", type: "date" },
    ],
  });

  const epic = await Epic.create({
    project: mainProject._id,
    name: "Core AI Engine",
    description: "Development of the RAG and LLM orchestration layer",
    status: "In Progress",
    priority: "Critical",
    createdBy: admin._id,
  });

  const milestone = await Milestone.create({
    project: mainProject._id,
    name: "Beta Release",
    dueDate: new Date(Date.now() + 30 * 86400000),
    status: "Pending",
    createdBy: admin._id,
  });

  const sprint = await Sprint.create({
    project: mainProject._id,
    name: "Sprint 1: Foundation",
    goal: "Core API and Auth",
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 86400000),
    status: "Active",
  });

  const tasks = await Task.create([
    { 
      project: mainProject._id, 
      sprint: sprint._id, 
      epic: epic._id, 
      milestone: milestone._id, 
      title: "Implement Vector Store", 
      status: "Done", 
      priority: "Critical", 
      assignee: dev1._id, 
      storyPoints: 13, 
      createdBy: admin._id,
      customFields: [{ fieldId: new mongoose.Types.ObjectId(), value: "Enterprise" }] 
    },
    { 
      project: mainProject._id, 
      sprint: sprint._id, 
      epic: epic._id, 
      title: "Setup Socket.IO Rooms", 
      status: "In Progress", 
      priority: "High", 
      assignee: dev2._id, 
      storyPoints: 5, 
      createdBy: admin._id 
    },
    { 
      project: mainProject._id, 
      sprint: sprint._id, 
      title: "Design Landing Page", 
      status: "Todo", 
      priority: "Medium", 
      assignee: dev1._id, 
      storyPoints: 3, 
      createdBy: admin._id 
    },
  ]);

  console.log(`Seeded: ${await User.countDocuments()} users, ${await Project.countDocuments()} projects (incl. templates), ${await Sprint.countDocuments()} sprints, ${await Task.countDocuments()} tasks, ${await Epic.countDocuments()} epics, ${await Milestone.countDocuments()} milestones`);
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
