import { NextResponse } from "next/server";
import { toolRegistry } from "@/lib/toolRegistry";
import { TASKS, ADR_RECORDS, MEMORY_NODES } from "@/lib/data";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

export async function POST(request: Request) {
  try {
    const body: JsonRpcRequest = await request.json();

    if (!body || body.jsonrpc !== "2.0" || !body.method) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: body?.id || null,
          error: { code: -32600, message: "Invalid Request: Must follow JSON-RPC 2.0 protocol." },
        },
        { status: 400 }
      );
    }

    const { id, method, params } = body;

    switch (method) {
      // 1. MCP tools/list
      case "tools/list": {
        const defaultTools = toolRegistry.getToolDefinitions().map((t) => ({
          name: t.function.name,
          description: t.function.description,
          inputSchema: t.function.parameters,
        }));

        const mcpExtraTools = [
          {
            name: "search_engineering_memory",
            description: "Search Gravity Engineering Memory for architecture decisions, timeline events, and project history.",
            inputSchema: {
              type: "object",
              properties: {
                query: { type: "string", description: "Search query or natural language question" },
                category: { type: "string", description: "Filter by category (Architecture, Performance, Database, Security)" },
              },
              required: ["query"],
            },
          },
          {
            name: "query_tasks",
            description: "Query active tasks across sprints and backlogs.",
            inputSchema: {
              type: "object",
              properties: {
                status: { type: "string", description: "Task status (Todo, In Progress, Done, In Review)" },
                priority: { type: "string", description: "Priority level (Low, Medium, High, Critical)" },
              },
            },
          },
          {
            name: "query_adrs",
            description: "Query Architecture Decision Records (ADRs).",
            inputSchema: {
              type: "object",
              properties: {
                status: { type: "string", description: "ADR status (Approved, Proposed, Superseded)" },
              },
            },
          },
        ];

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            tools: [...defaultTools, ...mcpExtraTools],
          },
        });
      }

      // 2. MCP tools/call
      case "tools/call": {
        const toolName = params?.name;
        const toolArgs = params?.arguments || params?.args || {};

        if (!toolName) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "Invalid params: Missing tool 'name'." },
          });
        }

        // Custom MCP handlers
        if (toolName === "search_engineering_memory") {
          const query = (toolArgs?.query || "").toLowerCase();
          const matches = MEMORY_NODES.filter(
            (item) =>
              item.title.toLowerCase().includes(query) ||
              item.summary.toLowerCase().includes(query) ||
              item.tags.some((t) => t.toLowerCase().includes(query))
          );
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(matches.length > 0 ? matches : MEMORY_NODES.slice(0, 3), null, 2),
                },
              ],
            },
          });
        }

        if (toolName === "query_tasks") {
          const { status, priority } = toolArgs || {};
          let filtered = [...TASKS];
          if (status) filtered = filtered.filter((t) => t.status.toLowerCase() === status.toLowerCase());
          if (priority) filtered = filtered.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
            },
          });
        }

        if (toolName === "query_adrs") {
          const { status } = toolArgs || {};
          let filtered = [...ADR_RECORDS];
          if (status) filtered = filtered.filter((a) => a.status.toLowerCase() === status.toLowerCase());
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
            },
          });
        }

        // Fallback to registry execution
        try {
          const output = await toolRegistry.executeTool(toolName, toolArgs || {});
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            },
          });
        } catch (err: any) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            error: { code: -32603, message: `Tool execution failed: ${err.message}` },
          });
        }
      }

      // 3. MCP resources/list
      case "resources/list": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            resources: [
              {
                uri: "gravity://tasks/all",
                name: "All Active Tasks",
                description: "List of all active engineering tasks and backlog items",
                mimeType: "application/json",
              },
              {
                uri: "gravity://adrs/all",
                name: "Architecture Decision Records",
                description: "Searchable architecture records and decision rationale",
                mimeType: "application/json",
              },
              {
                uri: "gravity://memory/engineering",
                name: "Engineering Memory Log",
                description: "Historical timeline events and engineering knowledge base",
                mimeType: "application/json",
              },
            ],
          },
        });
      }

      // 4. MCP prompts/list
      case "prompts/list": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            prompts: [
              {
                name: "triage_issue",
                description: "Triage a raw bug report or user feedback item against existing backlog tasks.",
                arguments: [{ name: "issue_text", description: "Raw issue text", required: true }],
              },
              {
                name: "decompose_feature",
                description: "Decompose a high-level feature request into actionable engineering subtasks.",
                arguments: [{ name: "feature_desc", description: "Feature description", required: true }],
              },
            ],
          },
        });
      }

      default:
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method '${method}' not found.` },
        });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: `Parse error: ${error.message}` },
      },
      { status: 500 }
    );
  }
}
