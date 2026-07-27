/**
 * Simple metrics tracker for AI generations.
 */
export class ExperimentMetrics {
  private startTime: number = Date.now();
  private metrics: Record<string, any> = {};

  constructor(public modelName: string, public runId: string = Date.now().toString()) {}

  log(key: string, value: any) {
    this.metrics[key] = value;
  }

  summary() {
    return {
      runId: this.runId,
      model: this.modelName,
      durationMs: Date.now() - this.startTime,
      ...this.metrics
    };
  }
}
