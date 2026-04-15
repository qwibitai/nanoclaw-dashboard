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
