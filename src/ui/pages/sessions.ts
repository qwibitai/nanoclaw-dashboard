import { layout } from '../layout.js';

export function sessionsPage(): string {
  return layout('Sessions', '/dashboard/sessions', `
    <h2 class="page-title">Sessions</h2>
    <div id="content"><div class="loading">Loading...</div></div>
    <script>
    (async () => {
      try {
        const [sessions, ctxData] = await Promise.all([
          api('/api/sessions'),
          api('/api/context'),
        ]);
        // Build context lookup by agentGroupId
        const ctxMap = {};
        for (const c of (ctxData.sessions || [])) {
          ctxMap[c.agentGroupId] = c;
        }
        if (sessions.length === 0) {
          document.getElementById('content').innerHTML = '<div class="loading">No sessions</div>';
          return;
        }

        let html = '<table><tr><th>Agent Group</th><th>Channel</th><th>Destination</th><th>Status</th><th>Container</th><th>Context</th><th>Last Active</th><th></th></tr>';
        for (const s of sessions) {
          const statusBadge = s.status === 'active' ? badge('active', 'green') : badge(s.status, 'gray');
          const containerBadge = s.container_status === 'running' ? badge('running', 'green') :
            s.container_status === 'idle' ? badge('idle', 'yellow') : badge(s.container_status, 'gray');
          const channel = s.channel_type ? badge(s.channel_type, 'blue') : '<span style="color:#666">-</span>';
          const dest = s.messaging_group_name || friendlyId(s.channel_type, s.platform_id) || '-';

          // Context window mini bar
          const ctx = ctxMap[s.agent_group_id];
          let ctxCell = '<span style="color:#555">-</span>';
          if (ctx) {
            const pct = ctx.usagePercent;
            const barColor = pct > 80 ? '#f87171' : pct > 50 ? '#facc15' : '#4ade80';
            ctxCell = '<div style="display:flex;align-items:center;gap:6px">' +
              '<div style="width:60px;background:#2a2a2a;border-radius:3px;height:6px;overflow:hidden">' +
              '<div style="background:' + barColor + ';height:100%;width:' + Math.min(pct, 100) + '%"></div></div>' +
              '<span style="font-size:11px;color:' + barColor + '">' + pct + '%</span></div>';
          }

          html += '<tr>' +
            '<td><a href="/dashboard/agent-groups?id=' + esc(s.agent_group_id) + '">' + esc(s.agent_group_name || s.agent_group_folder || '?') + '</a></td>' +
            '<td>' + channel + '</td>' +
            '<td>' + esc(dest) + '</td>' +
            '<td>' + statusBadge + '</td>' +
            '<td>' + containerBadge + '</td>' +
            '<td>' + ctxCell + '</td>' +
            '<td>' + timeAgo(s.last_active) + '</td>' +
            '<td><a href="/dashboard/messages?agentGroupId=' + esc(s.agent_group_id) + '&sessionId=' + esc(s.id) + '">messages</a></td>' +
            '</tr>';
        }
        html += '</table>';
        document.getElementById('content').innerHTML = html;
      } catch (e) {
        document.getElementById('content').innerHTML = '<div class="loading">Error: ' + esc(e.message) + '</div>';
      }
    })();
    </script>
  `);
}
