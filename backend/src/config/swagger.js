import swaggerJsdoc from "swagger-jsdoc";

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini Project Management Tool API",
      version: "0.1.0",
      description: "Express API for managing projects, tasks, sprints, and more",
    },
    servers: [{ url: "/api", description: "API base path" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["Admin", "Team Member", "Viewer"] },
            avatar: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Project: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            workspace: { type: "string" },
            owner: { $ref: "#/components/schemas/User" },
            members: { type: "array", items: { $ref: "#/components/schemas/User" } },
            roles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user: { type: "string" },
                  role: { type: "string", enum: ["Owner", "Admin", "Member", "Viewer"] },
                },
              },
            },
            status: { type: "string", enum: ["Active", "Archived"] },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            icon: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Sprint: {
          type: "object",
          properties: {
            _id: { type: "string" },
            project: { type: "string" },
            name: { type: "string" },
            goal: { type: "string" },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            status: { type: "string", enum: ["Planned", "Active", "Completed"] },
            velocity: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            _id: { type: "string" },
            project: { type: "string" },
            sprint: { type: "string" },
            epic: { type: "string" },
            milestone: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["Backlog", "Todo", "In Progress", "In Review", "Done"] },
            issueType: { type: "string", enum: ["Task", "Bug"] },
            priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
            assignee: { $ref: "#/components/schemas/User" },
            reporter: { $ref: "#/components/schemas/User" },
            storyPoints: { type: "number" },
            dueDate: { type: "string", format: "date" },
            labels: { type: "array", items: { type: "string" } },
            comments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  author: { $ref: "#/components/schemas/User" },
                  text: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  reactions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        emoji: { type: "string" },
                        user: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
            attachments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  name: { type: "string" },
                  size: { type: "number" },
                  type: { type: "string" },
                  uploadedBy: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
            createdBy: { $ref: "#/components/schemas/User" },
            subtasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  done: { type: "boolean" },
                  assignee: { type: "string" },
                },
              },
            },
            estimatedTime: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Epic: {
          type: "object",
          properties: {
            _id: { type: "string" },
            project: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["Backlog", "In Progress", "Done"] },
            priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            createdBy: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Milestone: {
          type: "object",
          properties: {
            _id: { type: "string" },
            project: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            dueDate: { type: "string", format: "date" },
            status: { type: "string", enum: ["Pending", "In Progress", "Completed"] },
            tasks: { type: "array", items: { type: "string" } },
            createdBy: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Workspace: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
            owner: { type: "string" },
            members: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user: { type: "string" },
                  role: { type: "string", enum: ["Owner", "Admin", "Project Manager", "Developer", "Guest"] },
                  joinedAt: { type: "string", format: "date-time" },
                },
              },
            },
            settings: {
              type: "object",
              properties: {
                defaultTimeZone: { type: "string" },
                aiEnabled: { type: "boolean" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Integration: {
          type: "object",
          properties: {
            _id: { type: "string" },
            workspace: { type: "string" },
            provider: { type: "string", enum: ["github", "gitlab", "google-calendar", "zoom", "jitsi", "slack", "discord"] },
            enabled: { type: "boolean" },
            credentials: { type: "object" },
            settings: { type: "object" },
            lastSyncAt: { type: "string", format: "date-time" },
            createdBy: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TimeEntry: {
          type: "object",
          properties: {
            _id: { type: "string" },
            task: { type: "string" },
            user: { type: "string" },
            description: { type: "string" },
            startTime: { type: "string", format: "date-time" },
            endTime: { type: "string", format: "date-time" },
            duration: { type: "number" },
            billable: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AutomationRule: {
          type: "object",
          properties: {
            _id: { type: "string" },
            workspace: { type: "string" },
            name: { type: "string" },
            trigger: {
              type: "object",
              properties: {
                event: { type: "string" },
                filters: { type: "object" },
              },
            },
            action: {
              type: "object",
              properties: {
                type: { type: "string" },
                params: { type: "object" },
              },
            },
            enabled: { type: "boolean" },
            createdBy: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Document: {
          type: "object",
          properties: {
            _id: { type: "string" },
            workspace: { type: "string" },
            project: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            contentType: { type: "string", enum: ["richtext", "markdown"] },
            icon: { type: "string" },
            parent: { type: "string" },
            createdBy: { type: "string" },
            lastEditedBy: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            type: { type: "string" },
            title: { type: "string" },
            message: { type: "string" },
            link: { type: "string" },
            read: { type: "boolean" },
            fromUser: { type: "string" },
            project: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Activity: {
          type: "object",
          properties: {
            _id: { type: "string" },
            project: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            action: { type: "string" },
            entityType: { type: "string", enum: ["task", "sprint", "project", "comment"] },
            entityId: { type: "string" },
            details: { type: "object" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string" }, email: { type: "string" }, password: { type: "string" } } } } } },
          responses: { 201: { description: "User created", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } }, 400: { description: "Validation error" } },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email & password",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string" } } } } } },
          responses: { 200: { description: "Token returned", content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, user: { $ref: "#/components/schemas/User" } } } } } }, 401: { description: "Invalid credentials" } },
        },
      },
      "/auth/profile": {
        get: {
          tags: ["Auth"],
          summary: "Get current user profile",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "User profile", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } }, 401: { description: "Unauthorized" } },
        },
      },
      "/auth/oauth/callback": {
        post: {
          tags: ["Auth"],
          summary: "OAuth callback (Google, GitHub, etc.)",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { provider: { type: "string" }, code: { type: "string" } } } } } },
          responses: { 200: { description: "Token returned" }, 400: { description: "Invalid provider" } },
        },
      },
      "/users": {
        get: {
          tags: ["Users"],
          summary: "List all users (Admin only)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Array of users", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/User" } } } } }, 403: { description: "Forbidden" } },
        },
      },
      "/users/{id}/role": {
        patch: {
          tags: ["Users"],
          summary: "Update user role (Admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["role"], properties: { role: { type: "string", enum: ["Admin", "Team Member", "Viewer"] } } } } } },
          responses: { 200: { description: "Role updated" }, 403: { description: "Forbidden" } },
        },
      },
      "/users/profile": {
        patch: {
          tags: ["Users"],
          summary: "Update own profile",
          security: [{ bearerAuth: [] }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, avatar: { type: "string" } } } } } },
          responses: { 200: { description: "Profile updated" } },
        },
      },
      "/projects": {
        get: {
          tags: ["Projects"],
          summary: "List projects for current user",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "workspace", in: "query", schema: { type: "string" }, description: "Filter by workspace ID" }, { name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }],
          responses: { 200: { description: "Array of projects", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Project" } } } } } },
        },
        post: {
          tags: ["Projects"],
          summary: "Create a new project",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string" }, description: { type: "string" }, workspace: { type: "string" }, startDate: { type: "string", format: "date" }, endDate: { type: "string", format: "date" } } } } } },
          responses: { 201: { description: "Project created", content: { "application/json": { schema: { $ref: "#/components/schemas/Project" } } } }, 400: { description: "Validation error" } },
        },
      },
      "/projects/{id}": {
        get: {
          tags: ["Projects"],
          summary: "Get a project by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Project", content: { "application/json": { schema: { $ref: "#/components/schemas/Project" } } } }, 404: { description: "Not found" } },
        },
        put: {
          tags: ["Projects"],
          summary: "Update a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, status: { type: "string", enum: ["Active", "Archived"] }, startDate: { type: "string", format: "date" }, endDate: { type: "string", format: "date" }, icon: { type: "string" } } } } } },
          responses: { 200: { description: "Project updated" }, 404: { description: "Not found" } },
        },
        delete: {
          tags: ["Projects"],
          summary: "Delete a project and its sprints/tasks",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Project deleted" }, 404: { description: "Not found" } },
        },
      },
      "/projects/{id}/role": {
        patch: {
          tags: ["Projects"],
          summary: "Update a member's role in a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["userId", "role"], properties: { userId: { type: "string" }, role: { type: "string", enum: ["Owner", "Admin", "Member", "Viewer"] } } } } } },
          responses: { 200: { description: "Role updated" }, 403: { description: "Forbidden" }, 404: { description: "Not found" } },
        },
      },
      "/sprints/project/{projectId}": {
        get: {
          tags: ["Sprints"],
          summary: "List sprints in a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Array of sprints", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Sprint" } } } } } },
        },
        post: {
          tags: ["Sprints"],
          summary: "Create a sprint in a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "startDate", "endDate"], properties: { name: { type: "string" }, goal: { type: "string" }, startDate: { type: "string", format: "date" }, endDate: { type: "string", format: "date" } } } } } },
          responses: { 201: { description: "Sprint created" }, 400: { description: "Validation error" } },
        },
      },
      "/sprints/{id}": {
        get: {
          tags: ["Sprints"],
          summary: "Get a sprint by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Sprint", content: { "application/json": { schema: { $ref: "#/components/schemas/Sprint" } } } }, 404: { description: "Not found" } },
        },
        put: {
          tags: ["Sprints"],
          summary: "Update a sprint",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, goal: { type: "string" }, startDate: { type: "string", format: "date" }, endDate: { type: "string", format: "date" }, status: { type: "string", enum: ["Planned", "Active", "Completed"] } } } } } },
          responses: { 200: { description: "Sprint updated" }, 404: { description: "Not found" } },
        },
        delete: {
          tags: ["Sprints"],
          summary: "Delete a sprint",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Sprint deleted" }, 404: { description: "Not found" } },
        },
      },
      "/sprints/{id}/burndown": {
        get: {
          tags: ["Sprints"],
          summary: "Get burndown data for a sprint",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Burndown data" } },
        },
      },
      "/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "List tasks (filterable by project, sprint, etc.)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "project", in: "query", schema: { type: "string" } }, { name: "sprint", in: "query", schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }, { name: "assignee", in: "query", schema: { type: "string" } }, { name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }],
          responses: { 200: { description: "Array of tasks", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Task" } } } } } },
        },
        post: {
          tags: ["Tasks"],
          summary: "Create a new task",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["project", "title"], properties: { project: { type: "string" }, title: { type: "string" }, description: { type: "string" }, sprint: { type: "string" }, epic: { type: "string" }, milestone: { type: "string" }, status: { type: "string", enum: ["Backlog", "Todo", "In Progress", "In Review", "Done"] }, issueType: { type: "string", enum: ["Task", "Bug"] }, priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] }, assignee: { type: "string" }, storyPoints: { type: "number" }, dueDate: { type: "string", format: "date" }, labels: { type: "array", items: { type: "string" } }, estimatedTime: { type: "number" } } } } } },
          responses: { 201: { description: "Task created", content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } }, 400: { description: "Validation error" } },
        },
      },
      "/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Get a task by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Task", content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } }, 404: { description: "Not found" } },
        },
        put: {
          tags: ["Tasks"],
          summary: "Update a task",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, status: { type: "string", enum: ["Backlog", "Todo", "In Progress", "In Review", "Done"] }, priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] }, assignee: { type: "string" }, storyPoints: { type: "number" }, dueDate: { type: "string", format: "date" }, labels: { type: "array", items: { type: "string" } }, estimatedTime: { type: "number" } } } } } },
          responses: { 200: { description: "Task updated" }, 404: { description: "Not found" } },
        },
        delete: {
          tags: ["Tasks"],
          summary: "Delete a task",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Task deleted" }, 404: { description: "Not found" } },
        },
      },
      "/tasks/{id}/comments": {
        post: {
          tags: ["Tasks"],
          summary: "Add a comment to a task",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["text"], properties: { text: { type: "string" } } } } } },
          responses: { 200: { description: "Comment added" } },
        },
        put: {
          tags: ["Tasks"],
          summary: "Edit a comment on a task",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { text: { type: "string" } } } } } },
          responses: { 200: { description: "Comment edited" } },
        },
      },
      "/tasks/{id}/comments/{commentId}": {
        delete: {
          tags: ["Tasks"],
          summary: "Delete a comment from a task",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }, { name: "commentId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Comment deleted" } },
        },
      },
      "/tasks/{id}/attachments": {
        post: {
          tags: ["Tasks"],
          summary: "Add an attachment to a task",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } } } },
          responses: { 200: { description: "Attachment added" } },
        },
      },
      "/tasks/{id}/reactions": {
        post: {
          tags: ["Tasks"],
          summary: "Add a reaction to a task",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["emoji"], properties: { emoji: { type: "string" } } } } } },
          responses: { 200: { description: "Reaction added" } },
        },
      },
      "/epics/project/{projectId}": {
        get: {
          tags: ["Epics"],
          summary: "List epics in a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Array of epics", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Epic" } } } } } },
        },
        post: {
          tags: ["Epics"],
          summary: "Create an epic in a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string" }, description: { type: "string" }, priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] }, startDate: { type: "string", format: "date" }, endDate: { type: "string", format: "date" } } } } } },
          responses: { 201: { description: "Epic created" }, 400: { description: "Validation error" } },
        },
      },
      "/epics/{id}": {
        get: {
          tags: ["Epics"],
          summary: "Get an epic by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Epic", content: { "application/json": { schema: { $ref: "#/components/schemas/Epic" } } } }, 404: { description: "Not found" } },
        },
        put: {
          tags: ["Epics"],
          summary: "Update an epic",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, status: { type: "string", enum: ["Backlog", "In Progress", "Done"] }, priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] } } } } } },
          responses: { 200: { description: "Epic updated" }, 404: { description: "Not found" } },
        },
        delete: {
          tags: ["Epics"],
          summary: "Delete an epic",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Epic deleted" }, 404: { description: "Not found" } },
        },
      },
      "/milestones/project/{projectId}": {
        get: {
          tags: ["Milestones"],
          summary: "List milestones in a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Array of milestones", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Milestone" } } } } } },
        },
        post: {
          tags: ["Milestones"],
          summary: "Create a milestone in a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "dueDate"], properties: { name: { type: "string" }, description: { type: "string" }, dueDate: { type: "string", format: "date" } } } } } },
          responses: { 201: { description: "Milestone created" }, 400: { description: "Validation error" } },
        },
      },
      "/milestones/{id}": {
        get: {
          tags: ["Milestones"],
          summary: "Get a milestone by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Milestone", content: { "application/json": { schema: { $ref: "#/components/schemas/Milestone" } } } }, 404: { description: "Not found" } },
        },
        put: {
          tags: ["Milestones"],
          summary: "Update a milestone",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, dueDate: { type: "string", format: "date" }, status: { type: "string", enum: ["Pending", "In Progress", "Completed"] } } } } } },
          responses: { 200: { description: "Milestone updated" }, 404: { description: "Not found" } },
        },
        delete: {
          tags: ["Milestones"],
          summary: "Delete a milestone",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Milestone deleted" }, 404: { description: "Not found" } },
        },
      },
      "/dashboard": {
        get: {
          tags: ["Dashboard"],
          summary: "Get dashboard data for the current user",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Dashboard data" } },
        },
      },
      "/notifications": {
        get: {
          tags: ["Notifications"],
          summary: "List notifications for the current user",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Array of notifications", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Notification" } } } } } },
        },
      },
      "/notifications/{id}/read": {
        post: {
          tags: ["Notifications"],
          summary: "Mark a notification as read",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Notification marked read" } },
        },
      },
      "/notifications/read-all": {
        post: {
          tags: ["Notifications"],
          summary: "Mark all notifications as read",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "All notifications marked read" } },
        },
      },
      "/search": {
        get: {
          tags: ["Search"],
          summary: "Global search across projects, tasks, etc.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Search results" } },
        },
      },
      "/analytics/{projectId}": {
        get: {
          tags: ["Analytics"],
          summary: "Get analytics for a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Analytics data" } },
        },
      },
      "/analytics/all": {
        get: {
          tags: ["Analytics"],
          summary: "Get global analytics",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Global analytics data" } },
        },
      },
      "/admin/stats": {
        get: {
          tags: ["Admin"],
          summary: "Get admin stats",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Admin stats" } },
        },
      },
      "/admin/users": {
        get: {
          tags: ["Admin"],
          summary: "List all users (Admin only)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Array of users", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/User" } } } } } },
        },
      },
      "/admin/projects": {
        get: {
          tags: ["Admin"],
          summary: "List all projects (Admin only)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Array of projects", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Project" } } } } } },
        },
      },
      "/admin/projects/{id}/archive": {
        post: {
          tags: ["Admin"],
          summary: "Archive a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Project archived" } },
        },
      },
      "/admin/projects/{id}/restore": {
        post: {
          tags: ["Admin"],
          summary: "Restore an archived project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Project restored" } },
        },
      },
      "/activity/{projectId}": {
        get: {
          tags: ["Activity"],
          summary: "Get activity log for a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Array of activities", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Activity" } } } } } },
        },
      },
      "/ai/generate-project": {
        post: {
          tags: ["AI"],
          summary: "Generate a project from a prompt",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { prompt: { type: "string" } } } } } },
          responses: { 200: { description: "Generated project data" } },
        },
      },
      "/ai/breakdown-task": {
        post: {
          tags: ["AI"],
          summary: "Break down a task into subtasks",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { taskId: { type: "string" }, description: { type: "string" } } } } } },
          responses: { 200: { description: "Subtasks" } },
        },
      },
      "/ai/estimate-points": {
        post: {
          tags: ["AI"],
          summary: "Estimate story points for a task",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { taskId: { type: "string" } } } } } },
          responses: { 200: { description: "Estimated points" } },
        },
      },
      "/ai/plan-sprint": {
        post: {
          tags: ["AI"],
          summary: "Plan a sprint using AI",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { sprintId: { type: "string" } } } } } },
          responses: { 200: { description: "Sprint plan" } },
        },
      },
      "/ai/standup": {
        post: {
          tags: ["AI"],
          summary: "Generate a standup summary",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { userId: { type: "string" }, projectId: { type: "string" } } } } } },
          responses: { 200: { description: "Standup summary" } },
        },
      },
      "/ai/summarize-sprint/{sprintId}": {
        get: {
          tags: ["AI"],
          summary: "Summarize a sprint",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "sprintId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Sprint summary" } },
        },
      },
      "/ai/predict-risk/{sprintId}": {
        get: {
          tags: ["AI"],
          summary: "Predict risk for a sprint",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "sprintId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Risk prediction" } },
        },
      },
      "/ai/docs/{projectId}": {
        get: {
          tags: ["AI"],
          summary: "Generate documentation for a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Generated docs" } },
        },
      },
      "/ai/chat": {
        post: {
          tags: ["AI"],
          summary: "Chat with AI assistant",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, projectId: { type: "string" } } } } } },
          responses: { 200: { description: "AI response" } },
        },
      },
      "/ai/search": {
        get: {
          tags: ["AI"],
          summary: "Semantic search across project data",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }, { name: "projectId", in: "query", schema: { type: "string" } }],
          responses: { 200: { description: "Search results" } },
        },
      },
      "/ai/code-review": {
        post: {
          tags: ["AI"],
          summary: "Review code via AI",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { code: { type: "string" }, language: { type: "string" } } } } } },
          responses: { 200: { description: "Code review" } },
        },
      },
      "/ai/meeting-summary": {
        post: {
          tags: ["AI"],
          summary: "Generate meeting summary from transcript",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { transcript: { type: "string" } } } } } },
          responses: { 200: { description: "Meeting summary" } },
        },
      },
      "/ai/release-notes/{projectId}": {
        get: {
          tags: ["AI"],
          summary: "Generate release notes for a project",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Release notes" } },
        },
      },
      "/workspaces": {
        get: {
          tags: ["Workspaces"],
          summary: "List workspaces for the current user",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Array of workspaces", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Workspace" } } } } } },
        },
        post: {
          tags: ["Workspaces"],
          summary: "Create a workspace",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "slug"], properties: { name: { type: "string" }, slug: { type: "string" } } } } } },
          responses: { 201: { description: "Workspace created" }, 400: { description: "Validation error" } },
        },
      },
      "/workspaces/{id}": {
        get: {
          tags: ["Workspaces"],
          summary: "Get a workspace by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Workspace", content: { "application/json": { schema: { $ref: "#/components/schemas/Workspace" } } } }, 404: { description: "Not found" } },
        },
        put: {
          tags: ["Workspaces"],
          summary: "Update a workspace",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, slug: { type: "string" }, settings: { type: "object", properties: { defaultTimeZone: { type: "string" }, aiEnabled: { type: "boolean" } } } } } } } },
          responses: { 200: { description: "Workspace updated" }, 404: { description: "Not found" } },
        },
        delete: {
          tags: ["Workspaces"],
          summary: "Delete a workspace",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Workspace deleted" }, 404: { description: "Not found" } },
        },
      },
      "/workspaces/{id}/members": {
        post: {
          tags: ["Workspaces"],
          summary: "Add a member to a workspace",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["userId"], properties: { userId: { type: "string" }, role: { type: "string", enum: ["Owner", "Admin", "Project Manager", "Developer", "Guest"] } } } } } },
          responses: { 200: { description: "Member added" } },
        },
      },
      "/workspaces/{id}/members/{userId}": {
        delete: {
          tags: ["Workspaces"],
          summary: "Remove a member from a workspace",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }, { name: "userId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Member removed" } },
        },
      },
      "/integrations/workspace/{workspaceId}": {
        get: {
          tags: ["Integrations"],
          summary: "List integrations for a workspace",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "workspaceId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Array of integrations", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Integration" } } } } } },
        },
        post: {
          tags: ["Integrations"],
          summary: "Create an integration for a workspace",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "workspaceId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["provider"], properties: { provider: { type: "string", enum: ["github", "gitlab", "google-calendar", "zoom", "jitsi", "slack", "discord"] }, credentials: { type: "object" }, settings: { type: "object" } } } } } },
          responses: { 201: { description: "Integration created" } },
        },
      },
      "/integrations/{id}": {
        put: {
          tags: ["Integrations"],
          summary: "Update an integration",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { enabled: { type: "boolean" }, credentials: { type: "object" }, settings: { type: "object" } } } } } },
          responses: { 200: { description: "Integration updated" } },
        },
        delete: {
          tags: ["Integrations"],
          summary: "Delete an integration",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Integration deleted" } },
        },
      },
      "/integrations/{id}/sync": {
        post: {
          tags: ["Integrations"],
          summary: "Trigger a sync for an integration",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Sync started" } },
        },
      },
      "/time": {
        get: {
          tags: ["Time"],
          summary: "List time entries",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "task", in: "query", schema: { type: "string" } }, { name: "user", in: "query", schema: { type: "string" } }, { name: "from", in: "query", schema: { type: "string", format: "date" } }, { name: "to", in: "query", schema: { type: "string", format: "date" } }],
          responses: { 200: { description: "Array of time entries", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/TimeEntry" } } } } } },
        },
      },
      "/time/start": {
        post: {
          tags: ["Time"],
          summary: "Start a timer",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["task"], properties: { task: { type: "string" }, description: { type: "string" } } } } } },
          responses: { 200: { description: "Timer started" } },
        },
      },
      "/time/stop": {
        post: {
          tags: ["Time"],
          summary: "Stop active timer",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Timer stopped" } },
        },
      },
      "/time/manual": {
        post: {
          tags: ["Time"],
          summary: "Create a manual time entry",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["task", "startTime", "endTime"], properties: { task: { type: "string" }, startTime: { type: "string", format: "date-time" }, endTime: { type: "string", format: "date-time" }, description: { type: "string" }, billable: { type: "boolean" } } } } } },
          responses: { 201: { description: "Time entry created" } },
        },
      },
      "/time/{id}": {
        delete: {
          tags: ["Time"],
          summary: "Delete a time entry",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Time entry deleted" } },
        },
      },
      "/time/report": {
        get: {
          tags: ["Time"],
          summary: "Get time report",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "project", in: "query", schema: { type: "string" } }, { name: "user", in: "query", schema: { type: "string" } }, { name: "from", in: "query", schema: { type: "string", format: "date" } }, { name: "to", in: "query", schema: { type: "string", format: "date" } }],
          responses: { 200: { description: "Time report data" } },
        },
      },
      "/automation/workspace/{workspaceId}": {
        get: {
          tags: ["Automation"],
          summary: "List automation rules for a workspace",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "workspaceId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Array of automation rules", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/AutomationRule" } } } } } },
        },
        post: {
          tags: ["Automation"],
          summary: "Create an automation rule",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "workspaceId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "trigger", "action"], properties: { name: { type: "string" }, trigger: { type: "object", properties: { event: { type: "string" }, filters: { type: "object" } } }, action: { type: "object", properties: { type: { type: "string" }, params: { type: "object" } } } } } } } },
          responses: { 201: { description: "Automation rule created" } },
        },
      },
      "/automation/workspace/{workspaceId}/trigger": {
        post: {
          tags: ["Automation"],
          summary: "Trigger an automation event",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "workspaceId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["event"], properties: { event: { type: "string" }, data: { type: "object" } } } } } },
          responses: { 200: { description: "Automation triggered" } },
        },
      },
      "/automation/{id}": {
        put: {
          tags: ["Automation"],
          summary: "Update an automation rule",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, trigger: { type: "object" }, action: { type: "object" }, enabled: { type: "boolean" } } } } } },
          responses: { 200: { description: "Rule updated" } },
        },
        delete: {
          tags: ["Automation"],
          summary: "Delete an automation rule",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Rule deleted" } },
        },
      },
      "/documents/workspace/{workspaceId}": {
        get: {
          tags: ["Documents"],
          summary: "List documents in a workspace",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "workspaceId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Array of documents", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Document" } } } } } },
        },
        post: {
          tags: ["Documents"],
          summary: "Create a document in a workspace",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "workspaceId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title"], properties: { title: { type: "string" }, content: { type: "string" }, contentType: { type: "string", enum: ["richtext", "markdown"] }, icon: { type: "string" }, parent: { type: "string" }, project: { type: "string" } } } } } },
          responses: { 201: { description: "Document created" } },
        },
      },
      "/documents/{id}": {
        get: {
          tags: ["Documents"],
          summary: "Get a document by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Document", content: { "application/json": { schema: { $ref: "#/components/schemas/Document" } } } }, 404: { description: "Not found" } },
        },
        put: {
          tags: ["Documents"],
          summary: "Update a document",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, contentType: { type: "string", enum: ["richtext", "markdown"] }, icon: { type: "string" } } } } } },
          responses: { 200: { description: "Document updated" } },
        },
        delete: {
          tags: ["Documents"],
          summary: "Delete a document",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Document deleted" } },
        },
      },
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check endpoint",
          responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } } },
        },
      },
    },
  },
  apis: [],
});

export { swaggerSpec };
