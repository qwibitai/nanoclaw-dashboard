/**
 * In-memory data store.
 * Holds the latest snapshot pushed by NanoClaw.
 * Can be swapped for Vercel KV later.
 */
import type { DashboardSnapshot } from './types.js';

let snapshot: DashboardSnapshot | null = null;
let lastUpdated: string | null = null;

export function setSnapshot(data: DashboardSnapshot): void {
  snapshot = data;
  lastUpdated = new Date().toISOString();
}

export function getSnapshot(): DashboardSnapshot | null {
  return snapshot;
}

export function getLastUpdated(): string | null {
  return lastUpdated;
}

// --- Log streaming ---
import type http from 'http';

const logClients = new Set<http.ServerResponse>();
const LOG_BUFFER_MAX = 500;
const logBuffer: string[] = [];

export function getLogBuffer(): string[] {
  return logBuffer;
}

export function addLogClient(res: http.ServerResponse): void {
  // Send buffered history first
  for (const line of logBuffer) {
    try { res.write(`data: ${JSON.stringify({ line })}\n\n`); } catch { /* skip */ }
  }
  logClients.add(res);
}

export function removeLogClient(res: http.ServerResponse): void {
  logClients.delete(res);
}

export function pushLogLines(lines: string[]): void {
  // Buffer lines for new clients
  logBuffer.push(...lines);
  while (logBuffer.length > LOG_BUFFER_MAX) logBuffer.shift();

  // Stream to connected clients
  for (const res of logClients) {
    for (const line of lines) {
      try {
        res.write(`data: ${JSON.stringify({ line })}\n\n`);
      } catch {
        logClients.delete(res);
      }
    }
  }
}
