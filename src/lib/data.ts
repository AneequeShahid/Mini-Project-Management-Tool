// src/lib/data.ts — Gravity Seed Data Store
export const PROJECTS = [
  { id: 'proj-1', name: 'Gravity Platform', description: 'Core AI project management platform', status: 'active', priority: 'High', progress: 68, color: '#5B8CFF', team: ['AS', 'MK', 'JL', 'RP', 'TW'], sprint_count: 4, tasks_total: 48, tasks_done: 32 },
  { id: 'proj-2', name: 'Auth & Identity', description: 'SSO, SAML, and 2FA compliance module', status: 'active', priority: 'Critical', progress: 45, color: '#8b5cf6', team: ['AS', 'RP'], sprint_count: 2, tasks_total: 22, tasks_done: 10 },
  { id: 'proj-3', name: 'Mobile SDK', description: 'React Native SDK for enterprise clients', status: 'planning', priority: 'Medium', progress: 12, color: '#10b981', team: ['JL', 'TW'], sprint_count: 1, tasks_total: 15, tasks_done: 2 },
];

export const SPRINTS = [
  { id: 'spr-1', project_id: 'proj-1', name: 'Sprint 12', goal: 'Complete dashboard redesign and AI briefing', status: 'active', start_date: '2026-07-07', end_date: '2026-07-20', story_points_total: 42, story_points_done: 28 },
  { id: 'spr-2', project_id: 'proj-1', name: 'Sprint 11', goal: 'Kanban views and calendar integration', status: 'completed', start_date: '2026-06-23', end_date: '2026-07-06', story_points_total: 38, story_points_done: 38 },
  { id: 'spr-3', project_id: 'proj-1', name: 'Sprint 10', goal: 'API layer and webhook system', status: 'completed', start_date: '2026-06-09', end_date: '2026-06-22', story_points_total: 35, story_points_done: 33 },
  { id: 'spr-4', project_id: 'proj-1', name: 'Sprint 13', goal: 'AI agents and knowledge graph', status: 'planning', start_date: '2026-07-21', end_date: '2026-08-03', story_points_total: 45, story_points_done: 0 },
  { id: 'spr-5', project_id: 'proj-2', name: 'Auth Sprint 1', goal: 'OAuth and SAML implementation', status: 'active', start_date: '2026-07-07', end_date: '2026-07-20', story_points_total: 28, story_points_done: 12 },
];

export const TASKS = [
  { id: 'task-1', project_id: 'proj-1', sprint_id: 'spr-1', title: 'Implement AI Chief of Staff briefing panel', description: 'Build the daily briefing hero with AI insights', priority: 'Critical', status: 'In Review', story_points: 8, due_date: '2026-07-15', assignee: 'AS', work_item_type_id: 'type-1', created_at: '2026-07-07T09:00:00Z' },
  { id: 'task-2', project_id: 'proj-1', sprint_id: 'spr-1', title: 'Workspace Health Monitor widget', description: 'Real-time metrics grid with 5 health indicators', priority: 'High', status: 'Done', story_points: 5, due_date: '2026-07-12', assignee: 'MK', work_item_type_id: 'type-1', created_at: '2026-07-07T09:30:00Z' },
  { id: 'task-3', project_id: 'proj-1', sprint_id: 'spr-1', title: 'Velocity chart with Recharts', description: 'Sprint velocity trend line chart', priority: 'High', status: 'In Progress', story_points: 3, due_date: '2026-07-16', assignee: 'JL', work_item_type_id: 'type-1', created_at: '2026-07-08T10:00:00Z' },
  { id: 'task-4', project_id: 'proj-1', sprint_id: 'spr-1', title: 'Fix auth token refresh race condition', description: 'Token expires during concurrent requests causing 401 cascade', priority: 'Critical', status: 'In Progress', story_points: 5, due_date: '2026-07-14', assignee: 'RP', work_item_type_id: 'type-2', created_at: '2026-07-09T11:00:00Z' },
  { id: 'task-5', project_id: 'proj-1', sprint_id: 'spr-1', title: 'Design system radius token enforcement', description: 'Apply radius tokens across all modals', priority: 'Medium', status: 'Done', story_points: 2, due_date: '2026-07-10', assignee: 'TW', work_item_type_id: 'type-3', created_at: '2026-07-07T14:00:00Z' },
  { id: 'task-6', project_id: 'proj-1', sprint_id: 'spr-1', title: 'Command palette keyboard navigation', description: 'Implement Cmd+K shortcut with full keyboard support', priority: 'Medium', status: 'Todo', story_points: 3, due_date: '2026-07-18', assignee: 'AS', work_item_type_id: 'type-1', created_at: '2026-07-10T09:00:00Z' },
  { id: 'task-7', project_id: 'proj-1', sprint_id: 'spr-2', title: 'Sidebar badge system with live counts', description: 'Dynamic count badges on nav items', priority: 'Low', status: 'Done', story_points: 2, due_date: '2026-07-05', assignee: 'MK', work_item_type_id: 'type-3', created_at: '2026-06-24T09:00:00Z' },
  { id: 'task-8', project_id: 'proj-1', sprint_id: 'spr-2', title: 'Calendar AI pre-meeting briefings', description: 'Before each meeting show AI summary', priority: 'High', status: 'Done', story_points: 8, due_date: '2026-07-04', assignee: 'JL', work_item_type_id: 'type-1', created_at: '2026-06-24T10:00:00Z' },
  { id: 'task-9', project_id: 'proj-1', sprint_id: 'spr-2', title: 'Workspace empty state premium design', description: 'Premium illustrated empty states', priority: 'Medium', status: 'Done', story_points: 3, due_date: '2026-07-03', assignee: 'TW', work_item_type_id: 'type-3', created_at: '2026-06-25T09:00:00Z' },
  { id: 'task-10', project_id: 'proj-1', sprint_id: 'spr-1', title: 'Gantt roadmap interactive timeline', description: 'Drag-and-drop Gantt chart with sprint lanes', priority: 'High', status: 'Backlog', story_points: 13, due_date: '2026-07-25', assignee: 'RP', work_item_type_id: 'type-1', created_at: '2026-07-11T09:00:00Z' },
  { id: 'task-11', project_id: 'proj-2', sprint_id: 'spr-5', title: 'SAML 2.0 identity provider integration', description: 'Implement Okta/Azure AD SAML SSO flow', priority: 'Critical', status: 'In Progress', story_points: 13, due_date: '2026-07-18', assignee: 'AS', work_item_type_id: 'type-2', created_at: '2026-07-07T09:00:00Z' },
  { id: 'task-12', project_id: 'proj-2', sprint_id: 'spr-5', title: '2FA TOTP enforcement for admin accounts', description: 'Google Authenticator and Authy compatible TOTP', priority: 'Critical', status: 'In Review', story_points: 8, due_date: '2026-07-16', assignee: 'RP', work_item_type_id: 'type-2', created_at: '2026-07-08T09:00:00Z' },
  { id: 'task-13', project_id: 'proj-2', sprint_id: 'spr-5', title: 'Session audit log with geolocation', description: 'Track all login events with IP, device, location', priority: 'High', status: 'Todo', story_points: 5, due_date: '2026-07-20', assignee: 'AS', work_item_type_id: 'type-2', created_at: '2026-07-09T09:00:00Z' },
  { id: 'task-14', project_id: 'proj-1', sprint_id: 'spr-1', title: 'Dark mode modal backdrop blur', description: 'Apply blur(12px) backdrop on all modal overlays', priority: 'Low', status: 'Done', story_points: 1, due_date: '2026-07-11', assignee: 'TW', work_item_type_id: 'type-3', created_at: '2026-07-07T15:00:00Z' },
  { id: 'task-15', project_id: 'proj-1', sprint_id: 'spr-1', title: 'Real-time agent coordination feed', description: 'Live feed showing active AI agents and their tasks', priority: 'High', status: 'In Progress', story_points: 8, due_date: '2026-07-17', assignee: 'JL', work_item_type_id: 'type-1', created_at: '2026-07-10T09:00:00Z' },
];

export const WORK_ITEM_TYPES = [
  { id: 'type-1', name: 'Feature', icon: 'sparkles', color: '#5B8CFF' },
  { id: 'type-2', name: 'Bug', icon: 'bug', color: '#ef4444' },
  { id: 'type-3', name: 'Design', icon: 'layers', color: '#8b5cf6' },
  { id: 'type-4', name: 'Docs', icon: 'book-open', color: '#10b981' },
];

export const CUSTOM_FIELDS = [
  { id: 'cf-1', name: 'Environment', type: 'select', options: ['dev', 'staging', 'prod'] },
  { id: 'cf-2', name: 'Risk Score', type: 'number' },
];

export const DEPLOYMENTS = [
  { id: 'dep-1', project: 'gravity-platform', branch: 'main', commit: '97fe299', message: 'Port Gravity design system to Next.js', status: 'success', duration: '2m 14s', triggered_by: 'Aneeque Shahid', environment: 'production', created_at: '2026-07-13T13:11:08Z', url: 'https://gravity.vercel.app' },
  { id: 'dep-2', project: 'gravity-platform', branch: 'main', commit: '53bb51a', message: 'Redesign Modal backdrop blur', status: 'success', duration: '1m 58s', triggered_by: 'GitHub Actions', environment: 'production', created_at: '2026-07-12T04:40:00Z', url: 'https://gravity.vercel.app' },
  { id: 'dep-3', project: 'auth-service', branch: 'feature/saml', commit: 'a1b2c3d', message: 'Add SAML 2.0 identity provider', status: 'building', duration: '-', triggered_by: 'Aneeque Shahid', environment: 'staging', created_at: '2026-07-13T13:00:00Z', url: null },
  { id: 'dep-4', project: 'gravity-platform', branch: 'fix/token-refresh', commit: 'e4f5g6h', message: 'Fix auth token refresh race condition', status: 'failed', duration: '0m 48s', triggered_by: 'GitHub Actions', environment: 'staging', created_at: '2026-07-11T18:30:00Z', url: null },
  { id: 'dep-5', project: 'mobile-sdk', branch: 'main', commit: 'i7j8k9l', message: 'Initial SDK scaffold', status: 'success', duration: '3m 02s', triggered_by: 'Aneeque Shahid', environment: 'preview', created_at: '2026-07-10T10:00:00Z', url: 'https://preview.gravity.vercel.app' },
  { id: 'dep-6', project: 'gravity-platform', branch: 'main', commit: 'f97e5ae', message: 'Build WorkspaceEmptyState component', status: 'success', duration: '2m 05s', triggered_by: 'GitHub Actions', environment: 'production', created_at: '2026-07-11T06:00:00Z', url: 'https://gravity.vercel.app' },
];

export const INTEGRATIONS = [
  { id: 'int-1', name: 'GitHub', description: 'Connect repositories, PRs, and commits', category: 'Source Control', connected: true, status: 'syncing', last_sync: '2 min ago', color: '#f0f0f0' },
  { id: 'int-2', name: 'Slack', description: 'Send notifications to channels and DMs', category: 'Communication', connected: true, status: 'active', last_sync: '5 min ago', color: '#4a154b' },
  { id: 'int-3', name: 'Notion', description: 'Sync documents and knowledge base', category: 'Documentation', connected: false, status: 'disconnected', last_sync: null, color: '#000' },
  { id: 'int-4', name: 'Linear', description: 'Bidirectional issue sync', category: 'Project Management', connected: true, status: 'active', last_sync: '1 hr ago', color: '#5e6ad2' },
  { id: 'int-5', name: 'Vercel', description: 'Deployment monitoring and previews', category: 'CI/CD', connected: true, status: 'active', last_sync: '10 min ago', color: '#000' },
  { id: 'int-6', name: 'Jira', description: 'Import and sync Jira issues', category: 'Project Management', connected: false, status: 'disconnected', last_sync: null, color: '#0052cc' },
  { id: 'int-7', name: 'Google Calendar', description: 'Sync meetings and deadlines', category: 'Calendar', connected: true, status: 'active', last_sync: '30 min ago', color: '#4285f4' },
  { id: 'int-8', name: 'Zoom', description: 'Auto-create meeting links from events', category: 'Meetings', connected: false, status: 'disconnected', last_sync: null, color: '#2D8CFF' },
  { id: 'int-9', name: 'Figma', description: 'Link design files to tasks', category: 'Design', connected: true, status: 'active', last_sync: '2 hr ago', color: '#a259ff' },
  { id: 'int-10', name: 'Supabase', description: 'Database and real-time subscriptions', category: 'Database', connected: true, status: 'active', last_sync: 'live', color: '#3ecf8e' },
  { id: 'int-11', name: 'Discord', description: 'Team notifications and bot commands', category: 'Communication', connected: false, status: 'disconnected', last_sync: null, color: '#5865F2' },
  { id: 'int-12', name: 'OpenAI', description: 'AI briefings, suggestions, and agents', category: 'AI', connected: true, status: 'active', last_sync: '1 min ago', color: '#10a37f' },
];

export const AGENTS = [
  { id: 'agent-1', name: 'Developer Agent', avatar: 'DA', color: '#5B8CFF', status: 'coding', task: 'Writing unit tests for Auth OAuth callback sync', progress: 72, model: 'GPT-4o', tokens_used: 18420, tasks_completed: 47, uptime: '99.2%' },
  { id: 'agent-2', name: 'QA Agent', avatar: 'QA', color: '#10b981', status: 'testing', task: 'Running regression suite on staging environment', progress: 45, model: 'GPT-4o-mini', tokens_used: 9200, tasks_completed: 103, uptime: '98.7%' },
  { id: 'agent-3', name: 'Planner Agent', avatar: 'PA', color: '#8b5cf6', status: 'planning', task: 'Balancing story points across Sprint 13 backlog', progress: 88, model: 'GPT-4o', tokens_used: 6100, tasks_completed: 31, uptime: '99.9%' },
  { id: 'agent-4', name: 'Security Agent', avatar: 'SA', color: '#ef4444', status: 'scanning', task: 'Auditing 18 user accounts for 2FA compliance', progress: 33, model: 'GPT-4o-mini', tokens_used: 3400, tasks_completed: 22, uptime: '97.1%' },
  { id: 'agent-5', name: 'Documentation Agent', avatar: 'DO', color: '#f59e0b', status: 'writing', task: 'Generating API docs for all endpoints', progress: 60, model: 'GPT-4o-mini', tokens_used: 12800, tasks_completed: 68, uptime: '99.5%' },
];

export const TIMELINE_EVENTS = [
  { id: 'evt-1', title: 'Auth module finalized', description: 'PR #42 merged by QA Agent', time: '10 min ago', type: 'pr', color: '#8b5cf6', project: 'Auth & Identity' },
  { id: 'evt-2', title: 'Database schema migration', description: 'Indexes mapped to production successfully', time: '1 hr ago', type: 'db', color: '#10b981', project: 'Gravity Platform' },
  { id: 'evt-3', title: 'Sprint 12 risk resolved', description: 'Failure probability dropped from 14% to 3%', time: '3 hr ago', type: 'risk', color: '#5B8CFF', project: 'Gravity Platform' },
  { id: 'evt-4', title: 'Vercel deployment succeeded', description: 'commit 97fe299 to production in 2m 14s', time: '5 hr ago', type: 'deploy', color: '#10b981', project: 'Gravity Platform' },
  { id: 'evt-5', title: 'Developer Agent completed 47 tasks', description: 'OAuth callbacks, token refresh, unit tests', time: '1 day ago', type: 'agent', color: '#5B8CFF', project: 'Auth & Identity' },
  { id: 'evt-6', title: 'Security scan flagged 2FA gap', description: '18 admin accounts missing TOTP setup', time: '1 day ago', type: 'security', color: '#ef4444', project: 'Auth & Identity' },
  { id: 'evt-7', title: 'Sprint 11 completed at 100%', description: '38/38 story points, zero carry-over', time: '2 days ago', type: 'sprint', color: '#10b981', project: 'Gravity Platform' },
  { id: 'evt-8', title: 'Knowledge graph indexed 6,242 nodes', description: 'Full codebase + docs in vector store', time: '3 days ago', type: 'memory', color: '#8b5cf6', project: 'Gravity Platform' },
];

export const CALENDAR_EVENTS = [
  { id: 'cal-1', title: 'Sprint 12 Standup', date: '2026-07-14', time: '09:00', duration: '30m', type: 'standup', attendees: ['AS', 'MK', 'JL', 'RP', 'TW'], color: '#5B8CFF', description: 'Daily sync. Focus: auth bug and velocity chart.' },
  { id: 'cal-2', title: 'Gravity Design Review', date: '2026-07-14', time: '14:00', duration: '1hr', type: 'review', attendees: ['AS', 'TW'], color: '#8b5cf6', description: 'Review modal system and dashboard hero redesign.' },
  { id: 'cal-3', title: 'Auth Security Audit', date: '2026-07-15', time: '10:00', duration: '2hr', type: 'audit', attendees: ['AS', 'RP'], color: '#ef4444', description: 'Quarterly security audit: SAML and 2FA compliance.' },
  { id: 'cal-4', title: 'Sprint 12 Review & Retro', date: '2026-07-20', time: '13:00', duration: '2hr', type: 'review', attendees: ['AS', 'MK', 'JL', 'RP', 'TW'], color: '#10b981', description: 'Demo Sprint 12 features, retrospective, Sprint 13 planning.' },
  { id: 'cal-5', title: 'Investor Demo Prep', date: '2026-07-17', time: '11:00', duration: '1hr', type: 'meeting', attendees: ['AS'], color: '#f59e0b', description: 'Prepare Gravity live demo for Series A pitch.' },
  { id: 'cal-6', title: 'Mobile SDK Kickoff', date: '2026-07-21', time: '09:00', duration: '1.5hr', type: 'kickoff', attendees: ['AS', 'JL', 'TW'], color: '#10b981', description: 'Define architecture, milestones, and team for SDK.' },
];

export const VELOCITY_DATA = [
  { sprint: 'S8', planned: 30, delivered: 28, bugs: 3 },
  { sprint: 'S9', planned: 32, delivered: 30, bugs: 2 },
  { sprint: 'S10', planned: 35, delivered: 33, bugs: 4 },
  { sprint: 'S11', planned: 38, delivered: 38, bugs: 1 },
  { sprint: 'S12', planned: 42, delivered: 28, bugs: 2 },
];

export const BURNDOWN_DATA = [
  { day: 'D1', remaining: 42, ideal: 42 },
  { day: 'D2', remaining: 39, ideal: 39 },
  { day: 'D3', remaining: 37, ideal: 36 },
  { day: 'D4', remaining: 35, ideal: 33 },
  { day: 'D5', remaining: 32, ideal: 30 },
  { day: 'D6', remaining: 30, ideal: 27 },
  { day: 'D7', remaining: 28, ideal: 24 },
  { day: 'D8', remaining: 28, ideal: 21 },
];

export const OBSERVABILITY_DATA = {
  metrics: { totalCost: '$0.246', averageLatency: '1.45s', cacheHitRate: '94.2%', toolSuccessRate: '99.8%', totalTokens: '142,840', activeModels: 3 },
  tokenUsageHistory: [
    { name: 'Mon', tokens: 12000, cost: 0.024, errors: 2 },
    { name: 'Tue', tokens: 18000, cost: 0.036, errors: 0 },
    { name: 'Wed', tokens: 15000, cost: 0.030, errors: 1 },
    { name: 'Thu', tokens: 28000, cost: 0.056, errors: 3 },
    { name: 'Fri', tokens: 32000, cost: 0.064, errors: 0 },
    { name: 'Sat', tokens: 10000, cost: 0.020, errors: 0 },
    { name: 'Sun', tokens: 8000, cost: 0.016, errors: 1 },
  ],
  modelBreakdown: [
    { name: 'GPT-4o', tokens: 89000, cost: 0.178, color: '#5B8CFF' },
    { name: 'GPT-4o-mini', tokens: 42000, cost: 0.042, color: '#8b5cf6' },
    { name: 'Embeddings', tokens: 11840, cost: 0.026, color: '#10b981' },
  ],
  latencyHistory: [
    { name: 'Mon', p50: 1.2, p95: 2.8 },
    { name: 'Tue', p50: 1.1, p95: 2.5 },
    { name: 'Wed', p50: 1.4, p95: 3.1 },
    { name: 'Thu', p50: 1.3, p95: 2.9 },
    { name: 'Fri', p50: 1.5, p95: 3.4 },
    { name: 'Sat', p50: 0.9, p95: 2.1 },
    { name: 'Sun', p50: 0.8, p95: 1.9 },
  ],
};

export const MEMORY_NODES = [
  { id: 'mem-1', title: 'Auth OAuth Flow Architecture', type: 'architecture', tags: ['oauth', 'auth', 'security'], summary: 'Complete OAuth 2.0 + PKCE flow for Google and GitHub', relevance: 0.98, updated: '2 days ago' },
  { id: 'mem-2', title: 'Database Index Optimization', type: 'optimization', tags: ['database', 'performance'], summary: 'Composite indexes reduce task query time by 87%', relevance: 0.91, updated: '3 days ago' },
  { id: 'mem-3', title: 'Sprint Velocity Regression', type: 'analytics', tags: ['sprint', 'velocity'], summary: 'Friday deploys correlate with 23% higher bug rates', relevance: 0.87, updated: '1 week ago' },
  { id: 'mem-4', title: 'Modal Design System Standards', type: 'design', tags: ['design', 'modal', 'ui'], summary: 'All modals: radius-dialog 18px, backdrop blur(12px), surface #18181B', relevance: 0.82, updated: '4 days ago' },
  { id: 'mem-5', title: 'Vercel Deployment Config', type: 'devops', tags: ['vercel', 'deployment'], summary: 'Root Next.js app is deployed. frontend/ Vite is local-only', relevance: 0.95, updated: '1 day ago' },
  { id: 'mem-6', title: 'Agent Coordination Protocol', type: 'ai', tags: ['agents', 'ai'], summary: 'Agents report via event bus. Planner orchestrates assignments', relevance: 0.89, updated: '5 days ago' },
];

export const WORKFLOWS = [
  { id: 'wf-1', name: 'Auto-assign Critical Bugs', trigger: 'Task created with priority=Critical', action: 'Assign to lead + notify Slack #alerts', status: 'active', runs: 14, last_run: '2 hr ago' },
  { id: 'wf-2', name: 'Sprint Completion Alert', trigger: 'Sprint story points = 100%', action: 'Celebrate in Slack + schedule retro', status: 'active', runs: 8, last_run: '1 week ago' },
  { id: 'wf-3', name: 'Failed Deployment Recovery', trigger: 'Deployment status = failed', action: 'Notify team + create incident task', status: 'active', runs: 3, last_run: '2 days ago' },
  { id: 'wf-4', name: 'Daily AI Standup Digest', trigger: 'Every weekday at 09:00', action: 'Post AI standup summary to #standup', status: 'active', runs: 47, last_run: '9 hr ago' },
  { id: 'wf-5', name: 'Stale Task Reminder', trigger: 'Task unchanged for 3 days', action: 'Comment on task + nudge assignee', status: 'paused', runs: 22, last_run: '1 day ago' },
  { id: 'wf-6', name: 'PR Review Assignment', trigger: 'PR opened in connected repo', action: 'Auto-assign reviewer by code ownership', status: 'active', runs: 89, last_run: '4 hr ago' },
  { id: 'wf-7', name: 'Overload Detection Alert', trigger: 'Engineer has 5+ active tasks', action: 'Alert manager + suggest redistribution', status: 'active', runs: 6, last_run: '12 hr ago' },
  { id: 'wf-8', name: 'Security Compliance Check', trigger: 'Every Monday at 08:00', action: 'Scan for 2FA and session anomalies', status: 'active', runs: 12, last_run: '2 days ago' },
];

export const MEETINGS = [
  { id: 'mtg-1', title: 'Sprint 12 Daily Standup', type: 'standup', date: '2026-07-13', time: '09:00', duration: '30 min', attendees: 5, status: 'completed', recording: true, summary: 'Auth bug assigned to RP, 28/42 pts done' },
  { id: 'mtg-2', title: 'Gravity Design Review', type: 'review', date: '2026-07-13', time: '14:00', duration: '1 hr', attendees: 2, status: 'completed', recording: true, summary: 'Approved modal system and dark theme' },
  { id: 'mtg-3', title: 'Auth Security Audit', type: 'audit', date: '2026-07-15', time: '10:00', duration: '2 hr', attendees: 2, status: 'upcoming', recording: false, summary: null },
  { id: 'mtg-4', title: 'Investor Demo Preparation', type: 'planning', date: '2026-07-17', time: '11:00', duration: '1 hr', attendees: 1, status: 'upcoming', recording: false, summary: null },
  { id: 'mtg-5', title: 'Sprint 12 Review & Retro', type: 'retro', date: '2026-07-20', time: '13:00', duration: '2 hr', attendees: 5, status: 'upcoming', recording: false, summary: null },
];

export const GUARDRAILS = [
  { id: 'gr-1', name: 'PII Detection', description: 'Block AI output containing email, phone, SSN patterns', status: 'active', triggers_24h: 3, action: 'redact' },
  { id: 'gr-2', name: 'Hallucination Filter', description: 'Verify AI claims against knowledge graph', status: 'active', triggers_24h: 12, action: 'verify' },
  { id: 'gr-3', name: 'Cost Budget Limiter', description: 'Halt AI requests if daily spend exceeds $0.50', status: 'active', triggers_24h: 0, action: 'halt' },
  { id: 'gr-4', name: 'Prompt Injection Shield', description: 'Sanitize adversarial prompt injections', status: 'active', triggers_24h: 1, action: 'sanitize' },
  { id: 'gr-5', name: 'Agent Loop Breaker', description: 'Terminate agent if same tool called 5+ times', status: 'active', triggers_24h: 0, action: 'terminate' },
];

export const ADR_RECORDS = [
  { id: 'adr-1', number: 'ADR-001', title: 'Use Next.js App Router over Pages Router', status: 'accepted', date: '2026-06-01', author: 'AS', context: 'Need server components for AI API streaming', decision: 'Adopt Next.js 16 App Router for all new pages', consequences: 'Cannot use getServerSideProps, requires React 19' },
  { id: 'adr-2', number: 'ADR-002', title: 'Recharts over Chart.js for visualization', status: 'accepted', date: '2026-06-08', author: 'MK', context: 'Need React-first chart library with dark mode', decision: 'Use Recharts 3.x with custom dark tooltips', consequences: 'Bundle +180KB, eliminates imperative Chart.js API' },
  { id: 'adr-3', number: 'ADR-003', title: 'Supabase as primary database', status: 'accepted', date: '2026-06-15', author: 'AS', context: 'Need relational data with real-time subscriptions', decision: 'Supabase PostgreSQL + Row Level Security', consequences: 'Migrate from MongoDB, gain real-time + auth built-in' },
  { id: 'adr-4', number: 'ADR-004', title: 'Zustand over Redux for client state', status: 'accepted', date: '2026-06-22', author: 'JL', context: 'Redux adds boilerplate for simple shared state', decision: 'Zustand stores for UI, React Query for server state', consequences: 'Smaller bundle, less boilerplate' },
  { id: 'adr-5', number: 'ADR-005', title: 'Consolidate to single Next.js app', status: 'accepted', date: '2026-07-13', author: 'AS', context: 'Vercel was deploying wrong app (Vite vs Next.js)', decision: 'Delete Vite frontend, use root Next.js only', consequences: 'All design changes now visible on Vercel' },
];

export const TEAM_PERFORMANCE = [
  { id: 'tm-1', name: 'Aneeque Shahid', role: 'owner', avatar: 'AS', delivery_score: 94, quality_score: 92, collaboration_score: 88, growth_trend: 'up', allocation: 38, capacity: 40, ai_summary: 'Consistently high output across platform and auth projects. Leading architecture decisions.' },
  { id: 'tm-2', name: 'Jordan Lee', role: 'developer', avatar: 'JL', delivery_score: 88, quality_score: 90, collaboration_score: 91, growth_trend: 'up', allocation: 34, capacity: 40, ai_summary: 'Strong on calendar and agent features. Growing into frontend architecture role.' },
  { id: 'tm-3', name: 'Maria Kim', role: 'developer', avatar: 'MK', delivery_score: 85, quality_score: 94, collaboration_score: 87, growth_trend: 'stable', allocation: 30, capacity: 40, ai_summary: 'Highest quality scores. Focus area: health monitors and sidebar system.' },
  { id: 'tm-4', name: 'Ryan Park', role: 'developer', avatar: 'RP', delivery_score: 82, quality_score: 80, collaboration_score: 85, growth_trend: 'up', allocation: 42, capacity: 40, ai_summary: 'Currently over-allocated on auth + Gantt. Consider redistributing 2 tasks.' },
  { id: 'tm-5', name: 'Taylor Wright', role: 'designer', avatar: 'TW', delivery_score: 90, quality_score: 96, collaboration_score: 93, growth_trend: 'up', allocation: 28, capacity: 40, ai_summary: 'Design system lead. Excellent quality. Has capacity for additional tasks.' },
];

export const DELIVERY_FORECAST = {
  confidence: 73,
  projected_completion: '2026-07-20',
  risk_level: 'medium',
  blockers: ['Auth token race condition (task-4)', 'Gantt roadmap scope (task-10)'],
  recommendation: 'Rebalance Ryan Park workload and descope Gantt to milestone view for Sprint 12.',
};

export const ROLE_DEFINITIONS = [
  { id: 'owner', label: 'Owner', color: '#f59e0b', permissions: ['read', 'write', 'delete', 'admin', 'manage_team', 'manage_billing', 'manage_integrations'] },
  { id: 'admin', label: 'Admin', color: '#ef4444', permissions: ['read', 'write', 'delete', 'admin', 'manage_team'] },
  { id: 'developer', label: 'Developer', color: '#5B8CFF', permissions: ['read', 'write', 'delete'] },
  { id: 'designer', label: 'Designer', color: '#8b5cf6', permissions: ['read', 'write'] },
  { id: 'viewer', label: 'Viewer', color: '#71717a', permissions: ['read'] },
];

// Alias for components that import TEAM_MEMBERS
export const TEAM_MEMBERS = TEAM_PERFORMANCE;
