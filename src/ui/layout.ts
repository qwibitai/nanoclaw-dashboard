/**
 * Shared HTML layout for dashboard pages.
 * Themeable via CSS variables: defaults to dark; light override applies when
 * <body data-theme="light">.
 */
import { getDashboardSecret, getDashboardTheme } from '../server.js';

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
  :root {
    --bg-base: #0f0f0f;
    --bg-card: #1a1a1a;
    --bg-deep: #0a0a0a;
    --bg-hover: #252525;
    --bg-row-hover: #151515;
    --bg-accent: #1e2a35;
    --border: #2a2a2a;
    --border-faint: #1e1e1e;
    --text-strong: #ffffff;
    --text-primary: #e0e0e0;
    --text-secondary: #999;
    --text-muted: #888;
    --text-faint: #666;
    --text-section: #ccc;
    --accent: #7eb8da;
    --badge-green-bg: #1a3a1a;  --badge-green-fg: #4ade80;
    --badge-yellow-bg: #3a3a1a; --badge-yellow-fg: #facc15;
    --badge-red-bg: #3a1a1a;    --badge-red-fg: #f87171;
    --badge-blue-bg: #1a2a3a;   --badge-blue-fg: #7eb8da;
    --badge-gray-bg: #2a2a2a;   --badge-gray-fg: #999;
    --badge-purple-bg: #2a1a3a; --badge-purple-fg: #c084fc;
    --chart-in: #3b82f6;
    --chart-out: #22c55e;
  }
  /* Light palette: Flexoki (kepano/flexoki) */
  [data-theme="light"] {
    --bg-base: #FFFCF0;        /* paper */
    --bg-card: #FFFCF0;        /* paper */
    --bg-deep: #F2F0E5;        /* base-50 */
    --bg-hover: #E6E4D9;       /* base-100 */
    --bg-row-hover: #F2F0E5;   /* base-50 */
    --bg-accent: #E1ECEB;      /* blue-50 */
    --border: #DAD8CE;         /* base-150 */
    --border-faint: #E6E4D9;   /* base-100 */
    --text-strong: #100F0F;    /* black */
    --text-primary: #1C1B1A;   /* base-950 */
    --text-secondary: #403E3C; /* base-800 */
    --text-muted: #575653;     /* base-700 */
    --text-faint: #6F6E69;     /* base-600 */
    --text-section: #282726;   /* base-900 */
    --accent: #205EA6;         /* blue-600 */
    --badge-green-bg: #EDEECF;  --badge-green-fg: #3D4C07;  /* green-50 / green-800 */
    --badge-yellow-bg: #FAEEC6; --badge-yellow-fg: #664D01; /* yellow-50 / yellow-700 */
    --badge-red-bg: #FFE1D5;    --badge-red-fg: #6C201C;    /* red-50 / red-700 */
    --badge-blue-bg: #E1ECEB;   --badge-blue-fg: #1A4F8C;   /* blue-50 / blue-700 */
    --badge-gray-bg: #E6E4D9;   --badge-gray-fg: #575653;   /* base-100 / base-700 */
    --badge-purple-bg: #F0EAEC; --badge-purple-fg: #4F3685; /* purple-50 / purple-700 */
    --chart-in: #205EA6;       /* blue-600 */
    --chart-out: #66800B;      /* green-600 */
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
    background: var(--bg-base);
    color: var(--text-primary);
    display: flex;
    min-height: 100vh;
  }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Sidebar */
  .sidebar {
    width: 220px;
    background: var(--bg-card);
    border-right: 1px solid var(--border);
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
    color: var(--text-strong);
    border-bottom: 1px solid var(--border);
    margin-bottom: 8px;
  }
  .sidebar nav a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    color: var(--text-secondary);
    font-size: 14px;
    transition: background 0.15s, color 0.15s;
  }
  .sidebar nav a:hover { background: var(--bg-hover); color: var(--text-primary); text-decoration: none; }
  .sidebar nav a.active { background: var(--bg-accent); color: var(--accent); border-right: 2px solid var(--accent); }
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
    color: var(--text-strong);
  }

  /* Cards */
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
  }
  .card .label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .card .value { font-size: 28px; font-weight: 700; color: var(--text-strong); margin-top: 4px; }
  .card .sub { font-size: 12px; color: var(--text-faint); margin-top: 4px; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { text-align: left; padding: 10px 12px; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
  td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid var(--border-faint); }
  tr:hover td { background: var(--bg-row-hover); }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .badge-green { background: var(--badge-green-bg); color: var(--badge-green-fg); }
  .badge-yellow { background: var(--badge-yellow-bg); color: var(--badge-yellow-fg); }
  .badge-red { background: var(--badge-red-bg); color: var(--badge-red-fg); }
  .badge-blue { background: var(--badge-blue-bg); color: var(--badge-blue-fg); }
  .badge-gray { background: var(--badge-gray-bg); color: var(--badge-gray-fg); }
  .badge-purple { background: var(--badge-purple-bg); color: var(--badge-purple-fg); }

  /* Section headers */
  .section-title { font-size: 16px; font-weight: 600; margin: 24px 0 12px; color: var(--text-section); }

  /* Chart container */
  .chart-container { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 24px; }
  .chart-bar-row { display: flex; align-items: center; gap: 8px; margin: 2px 0; }
  .chart-label { width: 40px; font-size: 11px; color: var(--text-muted); text-align: right; }
  .chart-bar { height: 20px; border-radius: 3px; min-width: 2px; transition: width 0.3s; }
  .chart-bar-in { background: var(--chart-in); }
  .chart-bar-out { background: var(--chart-out); }
  .chart-value { font-size: 11px; color: var(--text-faint); }

  /* Log viewer */
  .log-container {
    background: var(--bg-deep);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
    font-family: 'Cascadia Code', 'Fira Code', monospace;
    font-size: 12px;
    height: calc(100vh - 140px);
    overflow-y: auto;
    line-height: 1.6;
  }
  .log-line { white-space: pre-wrap; word-break: break-all; }
  .log-line:hover { background: var(--bg-row-hover); }

  /* Detail panel */
  .detail-panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 20px; margin-bottom: 16px; }
  .detail-row { display: flex; gap: 8px; margin: 6px 0; }
  .detail-label { color: var(--text-muted); min-width: 140px; font-size: 13px; }
  .detail-value { color: var(--text-primary); font-size: 13px; }

  /* Loading */
  .loading { color: var(--text-faint); font-style: italic; padding: 20px; }

  /* Select */
  select {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 13px;
  }

  /* Tabs */
  .tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
  .tab {
    padding: 8px 16px;
    font-size: 13px;
    color: var(--text-muted);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
  }
  .tab:hover { color: var(--text-primary); }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
`;

export function layout(title: string, activePath: string, bodyHtml: string): string {
  const token = getDashboardSecret() || '';
  const theme = getDashboardTheme();

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
<body data-theme="${theme}">
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
