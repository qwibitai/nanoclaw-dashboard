/**
 * Dashboard route dispatch.
 * All data comes from the in-memory store (populated via POST /api/ingest).
 */
import type http from 'http';

import { getSnapshot, getLastUpdated } from './store.js';
import { overviewPage } from './ui/pages/overview.js';
import { agentGroupsPage } from './ui/pages/agent-groups.js';
import { sessionsPage } from './ui/pages/sessions.js';
import { channelsPage } from './ui/pages/channels.js';
import { messagesPage } from './ui/pages/messages.js';
import { usersPage } from './ui/pages/users.js';
import { logsPage } from './ui/pages/logs.js';

function json(res: http.ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function html(res: http.ServerResponse, content: string): void {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(content);
}

export async function dispatch(
  method: string,
  path: string,
  params: URLSearchParams,
  res: http.ServerResponse,
): Promise<void> {
  const s = getSnapshot();

  // --- API routes ---
  if (method === 'GET' && path === '/api/status') {
    return json(res, { ok: true, hasData: !!s, lastUpdated: getLastUpdated() });
  }

  if (method === 'GET' && path === '/api/overview') {
    if (!s) return json(res, { error: 'No data yet' }, 503);
    return json(res, {
      assistantName: s.assistant_name,
      uptime: s.uptime,
      agentGroups: {
        total: s.agent_groups.length,
        list: s.agent_groups.map((g) => ({ id: g.id, name: g.name, folder: g.folder })),
      },
      sessions: {
        active: s.sessions.filter((x) => x.status === 'active').length,
        running: s.sessions.filter((x) => x.container_status === 'running' || x.container_status === 'idle').length,
      },
      channels: {
        registered: s.channels.filter((c) => c.isRegistered).map((c) => c.channelType),
        live: s.channels.filter((c) => c.isLive).map((c) => c.channelType),
        messagingGroups: s.channels.reduce((n, c) => n + c.groups.length, 0),
        byType: Object.fromEntries(s.channels.map((c) => [c.channelType, c.groups.length])),
      },
      users: {
        total: s.users.length,
        owners: s.users.filter((u) => u.privilege === 'owner').length,
        globalAdmins: s.users.filter((u) => u.privilege === 'global_admin').length,
      },
      lastUpdated: getLastUpdated(),
    });
  }

  if (method === 'GET' && path === '/api/activity') {
    if (!s) return json(res, { error: 'No data yet' }, 503);
    return json(res, { buckets: s.activity });
  }

  if (method === 'GET' && path === '/api/agent-groups') {
    if (!s) return json(res, { error: 'No data yet' }, 503);
    return json(res, s.agent_groups);
  }

  if (method === 'GET' && path.startsWith('/api/agent-groups/')) {
    if (!s) return json(res, { error: 'No data yet' }, 503);
    const id = path.slice('/api/agent-groups/'.length);
    const group = s.agent_groups.find((g) => g.id === id);
    if (!group) return json(res, { error: 'Not found' }, 404);
    return json(res, {
      group,
      sessions: s.sessions.filter((x) => x.agent_group_id === id),
      wirings: group.wirings,
      destinations: group.destinations,
      members: group.members,
      admins: group.admins,
    });
  }

  if (method === 'GET' && path === '/api/sessions') {
    if (!s) return json(res, { error: 'No data yet' }, 503);
    return json(res, s.sessions);
  }

  if (method === 'GET' && path === '/api/channels') {
    if (!s) return json(res, { error: 'No data yet' }, 503);
    return json(res, {
      channels: s.channels,
      liveAdapters: s.channels.filter((c) => c.isLive).map((c) => c.channelType),
      registeredChannels: s.channels.filter((c) => c.isRegistered).map((c) => c.channelType),
    });
  }

  if (method === 'GET' && path === '/api/users') {
    if (!s) return json(res, { error: 'No data yet' }, 503);
    return json(res, s.users);
  }

  if (method === 'GET' && path === '/api/tokens/summary') {
    if (!s) return json(res, { error: 'No data yet' }, 503);
    return json(res, s.tokens);
  }

  if (method === 'GET' && path === '/api/context') {
    if (!s) return json(res, { error: 'No data yet' }, 503);
    return json(res, { sessions: s.context_windows });
  }

  // --- HTML pages ---
  if (method === 'GET') {
    if (path === '/dashboard') return html(res, overviewPage());
    if (path.startsWith('/dashboard/agent-groups')) return html(res, agentGroupsPage());
    if (path === '/dashboard/sessions') return html(res, sessionsPage());
    if (path === '/dashboard/channels') return html(res, channelsPage());
    if (path.startsWith('/dashboard/messages')) return html(res, messagesPage());
    if (path === '/dashboard/users') return html(res, usersPage());
    if (path === '/dashboard/logs') return html(res, logsPage());
    if (path === '/') {
      res.writeHead(302, { Location: '/dashboard' });
      res.end();
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}
