/**
 * Centralized logging for the Agentic Architecture.
 */
export function getLogger(name: string) {
  return {
    info: (msg: string, ...args: any[]) => console.log(`[${new Date().toISOString()}] [INFO] [${name}] ${msg}`, ...args),
    warn: (msg: string, ...args: any[]) => console.warn(`[${new Date().toISOString()}] [WARN] [${name}] ${msg}`, ...args),
    error: (msg: string, ...args: any[]) => console.error(`[${new Date().toISOString()}] [ERROR] [${name}] ${msg}`, ...args),
  };
}
