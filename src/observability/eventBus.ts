import { supabaseServer } from "./supabaseServer";

export interface SystemEvent {
  workspaceId?: string;
  action: string;
  details: Record<string, any>;
}

export class EventBus {
  static async publish(event: SystemEvent) {
    try {
      console.log(`[EventBus] Publishing event: ${event.action}`, event.details);

      // Write event to Supabase Audit Trail
      const { error } = await supabaseServer.from("audit_trail").insert([
        {
          workspace_id: event.workspaceId || null,
          action: event.action,
          details: event.details,
        }
      ]);

      if (error) {
        console.error("[EventBus] Failed to log audit trail:", error.message);
      }
    } catch (err: any) {
      console.error("[EventBus] Error publishing event:", err.message);
    }
  }
}
