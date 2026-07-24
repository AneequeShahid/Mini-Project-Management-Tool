import { NextResponse } from "next/server";
import { EventBus } from "@/lib/eventBus";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requirement, title, projectId = "proj-1" } = body;

    if (!requirement && !title) {
      return NextResponse.json(
        { error: "Requirement or title field is required for feature decomposition." },
        { status: 400 }
      );
    }

    const featureTitle = title || requirement.slice(0, 60);

    // AI Feature Decomposition Generator Logic
    const decomposedSpec = {
      featureTitle,
      summary: `Decomposed technical architecture and breakdown for feature: ${featureTitle}`,
      estimatedTotalStoryPoints: 13,
      recommendedPriority: "High",
      suggestedAssignee: "Alex Vance (Lead Architect)",
      acceptanceCriteria: [
        "All API endpoints must return typed JSON responses with 200 OK or explicit 4xx/5xx status error details.",
        "Include unit test coverage for happy paths and edge cases using Vitest.",
        "Publish events to EventBus upon key state transitions.",
        "Ensure compliance with project Human Approval Guardrails for high-impact actions.",
      ],
      subtasks: [
        {
          id: `task-sub-${Date.now()}-1`,
          title: `[Backend] Design API routes & data models for ${featureTitle}`,
          description: `Create typed Next.js route handlers and Supabase RLS schemas required for ${featureTitle}.`,
          priority: "High",
          storyPoints: 5,
          assignee: "Morgan Lee",
          type: "backend",
        },
        {
          id: `task-sub-${Date.now()}-2`,
          title: `[Frontend] Build UI components & state hooks for ${featureTitle}`,
          description: `Implement responsive Tailwind CSS v4 React components and TanStack Query / Zustand hooks.`,
          priority: "High",
          storyPoints: 5,
          assignee: "Taylor White",
          type: "frontend",
        },
        {
          id: `task-sub-${Date.now()}-3`,
          title: `[QA/Test] Write Vitest specs & integration tests for ${featureTitle}`,
          description: `Add automated unit and integration tests covering backend routes and state hooks.`,
          priority: "Medium",
          storyPoints: 3,
          assignee: "Jordan Casey",
          type: "testing",
        },
      ],
      draftADR: {
        title: `ADR: Technical Architecture & Strategy for ${featureTitle}`,
        status: "Proposed",
        context: `The engineering team requires a standardized approach to implement ${featureTitle} while preserving system scalability and security.`,
        decision: `We will implement ${featureTitle} using modular Next.js route handlers, event-driven state updates via EventBus, and vector-backed memory search.`,
        consequences: `Improves system modularity and feature tracking; requires lightweight maintenance of API schemas.`,
      },
    };

    // Publish event to EventBus
    await EventBus.publish({
      action: "FEATURE_DECOMPOSED",
      details: {
        featureTitle,
        subtaskCount: decomposedSpec.subtasks.length,
        totalPoints: decomposedSpec.estimatedTotalStoryPoints,
        projectId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Feature '${featureTitle}' decomposed into ${decomposedSpec.subtasks.length} technical sub-tasks and draft ADR.`,
      data: decomposedSpec,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
