#!/usr/bin/env node
/**
 * CLI entry point: nanoclaw-dashboard
 *
 * Starts the dashboard server. Expects data to be pushed
 * via POST /api/ingest from a NanoClaw instance.
 */
import { startDashboard } from './server.js';

const port = parseInt(process.env.DASHBOARD_PORT || '3100', 10);
const secret = process.env.DASHBOARD_SECRET || undefined;

startDashboard({ port, secret });

console.log(`Waiting for data from NanoClaw (POST /api/ingest)`);
