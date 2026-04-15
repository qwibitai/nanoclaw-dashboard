/**
 * Shared HTML layout for dashboard pages.
 * Dark theme, nav sidebar, api() helper for authenticated fetch calls.
 */
import { getDashboardSecret } from '../server.js';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '&#9632;' },
  { href: '/dashboard/agent-groups', label: 'Agent Groups', icon: '&#9654;' },
  { href: '/dashboard/sessions', label: 'Sessions', icon: '&#8635;' },
  { href: '/dashboard/channels', label: 'Channels', icon: '&#8644;' },
  { href: '/dashboard/messages', label: 'Messages', icon: '&#9993;' },
  { href: '/dashboard/users', label: 'Users', icon: '&#9679;' },
  { href: '/dashboard/logs', label: 'Logs', icon: '&#9776;' },
];

const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
    background: #0f0f0f;
    color: #e0e0e0;
    display: flex;
    min-height: 100vh;
  }
  a { color: #7eb8da; text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Sidebar */
  .sidebar {
    width: 220px;
    background: #1a1a1a;
    border-right: 1px solid #2a2a2a;
    padding: 20px 0;
    flex-shrink: 0;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    overflow-y: auto;
  }
  .sidebar h1 {
    font-size: 16px;
    padding: 0 20px 16px;
    color: #fff;
    border-bottom: 1px solid #2a2a2a;
    margin-bottom: 8px;
  }
  .sidebar nav a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    color: #999;
    font-size: 14px;
    transition: background 0.15s, color 0.15s;
  }
  .sidebar nav a:hover { background: #252525; color: #e0e0e0; text-decoration: none; }
  .sidebar nav a.active { background: #1e2a35; color: #7eb8da; border-right: 2px solid #7eb8da; }
  .sidebar nav a .icon { width: 18px; text-align: center; font-size: 12px; }

  /* Main */
  .main {
    margin-left: 220px;
    padding: 24px 32px;
    flex: 1;
    min-width: 0;
  }
  .page-title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #fff;
  }

  /* Cards */
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .card {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 16px;
  }
  .card .label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .card .value { font-size: 28px; font-weight: 700; color: #fff; margin-top: 4px; }
  .card .sub { font-size: 12px; color: #666; margin-top: 4px; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { text-align: left; padding: 10px 12px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #2a2a2a; }
  td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #1e1e1e; }
  tr:hover td { background: #151515; }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .badge-green { background: #1a3a1a; color: #4ade80; }
  .badge-yellow { background: #3a3a1a; color: #facc15; }
  .badge-red { background: #3a1a1a; color: #f87171; }
  .badge-blue { background: #1a2a3a; color: #7eb8da; }
  .badge-gray { background: #2a2a2a; color: #999; }
  .badge-purple { background: #2a1a3a; color: #c084fc; }

  /* Section headers */
  .section-title { font-size: 16px; font-weight: 600; margin: 24px 0 12px; color: #ccc; }

  /* Chart container */
  .chart-container { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
  .chart-bar-row { display: flex; align-items: center; gap: 8px; margin: 2px 0; }
  .chart-label { width: 40px; font-size: 11px; color: #888; text-align: right; }
  .chart-bar { height: 20px; border-radius: 3px; min-width: 2px; transition: width 0.3s; }
  .chart-bar-in { background: #3b82f6; }
  .chart-bar-out { background: #22c55e; }
  .chart-value { font-size: 11px; color: #666; }

  /* Log viewer */
  .log-container {
    background: #0a0a0a;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 12px;
    font-family: 'Cascadia Code', 'Fira Code', monospace;
    font-size: 12px;
    height: calc(100vh - 140px);
    overflow-y: auto;
    line-height: 1.6;
  }
  .log-line { white-space: pre-wrap; word-break: break-all; }
  .log-line:hover { background: #151515; }

  /* Detail panel */
  .detail-panel { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
  .detail-row { display: flex; gap: 8px; margin: 6px 0; }
  .detail-label { color: #888; min-width: 140px; font-size: 13px; }
  .detail-value { color: #e0e0e0; font-size: 13px; }

  /* Loading */
  .loading { color: #666; font-style: italic; padding: 20px; }

  /* Select */
  select {
    background: #1a1a1a;
    color: #e0e0e0;
    border: 1px solid #2a2a2a;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 13px;
  }

  /* Tabs */
  .tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1px solid #2a2a2a; }
  .tab {
    padding: 8px 16px;
    font-size: 13px;
    color: #888;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
  }
  .tab:hover { color: #e0e0e0; }
  .tab.active { color: #7eb8da; border-bottom-color: #7eb8da; }
`;

export function layout(title: string, activePath: string, bodyHtml: string): string {
  const token = getDashboardSecret() || '';

  const navHtml = NAV_ITEMS.map(
    (item) =>
      `<a href="${item.href}" class="${item.href === activePath ? 'active' : ''}">
        <span class="icon">${item.icon}</span>${item.label}
      </a>`,
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="dashboard-token" content="${token}">
  <title>${title} — NanoClaw Dashboard</title>
  <style>${CSS}</style>
  <script>
    const TOKEN = document.querySelector('meta[name="dashboard-token"]')?.content || '';
    async function api(path) {
      const headers = {};
      if (TOKEN) headers['Authorization'] = 'Bearer ' + TOKEN;
      const res = await fetch(path, { headers });
      if (!res.ok) throw new Error('API error: ' + res.status);
      return res.json();
    }
    function badge(text, color) {
      return '<span class="badge badge-' + color + '">' + esc(text) + '</span>';
    }
    function esc(s) {
      if (s == null) return '';
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    function timeAgo(ts) {
      if (!ts) return 'never';
      const d = new Date(ts);
      const s = Math.floor((Date.now() - d.getTime()) / 1000);
      if (s < 60) return s + 's ago';
      if (s < 3600) return Math.floor(s/60) + 'm ago';
      if (s < 86400) return Math.floor(s/3600) + 'h ago';
      return Math.floor(s/86400) + 'd ago';
    }
    function formatNum(n) {
      if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n/1000).toFixed(1) + 'K';
      return String(n);
    }
    function truncId(s, max) {
      if (!s || s.length <= max) return s || '';
      return s.slice(0, max) + '\u2026';
    }
    function friendlyId(channelType, pid) {
      if (!pid) return '?';
      if (channelType === 'discord' && pid.startsWith('discord:')) {
        var parts = pid.split(':');
        return '#' + (parts[2] || '').slice(-6);
      }
      if (channelType === 'whatsapp') return pid.replace(/@.*/, '');
      if (channelType === 'slack' && pid.startsWith('slack:')) return pid.slice(6);
      if (channelType === 'teams' && pid.startsWith('teams:')) return 'chat-' + pid.slice(6, 12);
      return truncId(pid, 20);
    }
  </script>
</head>
<body>
  <div class="sidebar">
    <h1>NanoClaw</h1>
    <nav>${navHtml}</nav>
  </div>
  <div class="main">
    ${bodyHtml}
  </div>
</body>
</html>`;
}
