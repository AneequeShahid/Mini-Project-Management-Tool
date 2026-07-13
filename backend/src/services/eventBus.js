import { EventEmitter } from "events";
import { outboundWebhookService } from "./outboundWebhookService.js";

class EventBus extends EventEmitter {
  async publish(event) {
    console.log(`[EventBus] Publishing ${event.type} for ${event.aggregateId}`);
    
    // 1. Internal Listeners
    this.emit(event.type, event);
    
    // 2. Outbound Webhooks (n8n/External Automation)
    try {
      await outboundWebhookService.triggerEvent(event.type, event.payload);
    } catch (err) {
      console.error(`[EventBus] Webhook dispatch failed:`, err);
    }
  }

  subscribe(eventType, handler) {
    this.on(eventType, handler);
  }
}

export const eventBus = new EventBus();
