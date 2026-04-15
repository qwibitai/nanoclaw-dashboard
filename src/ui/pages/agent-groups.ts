import { layout } from '../layout.js';

export function agentGroupsPage(): string {
  return layout('Agent Groups', '/dashboard/agent-groups', `
    <h2 class="page-title">Agent Groups</h2>
    <div id="content"><div class="loading">Loading...</div></div>
    <div id="detail" style="display:none"></div>
    <script>
    (async () => {
      const params = new URLSearchParams(location.search);
      const detailId = params.get('id');

      if (detailId) {
        await loadDetail(detailId);
      } else {
        await loadList();
      }
    })();

    async function loadList() {
      try {
        const groups = await api('/api/agent-groups');
        if (groups.length === 0) {
          document.getElementById('content').innerHTML = '<div class="loading">No agent groups configured</div>';
          return;
        }
        document.getElementById('content').innerHTML =
          '<table><tr><th>Name</th><th>Folder</th><th>Sessions</th><th>Running</th><th>Created</th></tr>' +
          groups.map(g =>
            '<tr><td><a href="/dashboard/agent-groups?id=' + esc(g.id) + '">' + esc(g.name) + '</a></td>' +
            '<td>' + esc(g.folder) + '</td>' +
            '<td>' + g.sessionCount + '</td>' +
            '<td>' + (g.runningSessions > 0 ? badge(g.runningSessions, 'green') : badge('0', 'gray')) + '</td>' +
            '<td style="color:#666">' + esc(g.created_at) + '</td></tr>'
          ).join('') + '</table>';
      } catch (e) {
        document.getElementById('content').innerHTML = '<div class="loading">Error: ' + esc(e.message) + '</div>';
      }
    }

    async function loadDetail(id) {
      document.getElementById('content').innerHTML = '<a href="/dashboard/agent-groups">&larr; Back to list</a>';
      document.getElementById('detail').style.display = 'block';
      try {
        const data = await api('/api/agent-groups/' + encodeURIComponent(id));
        const g = data.group;
        let html = '<h2 class="page-title">' + esc(g.name) + '</h2>';

        // Info panel
        html += '<div class="detail-panel">';
        html += detailRow('ID', g.id);
        html += detailRow('Folder', g.folder);
        html += detailRow('Provider', g.agent_provider || 'default');
        html += detailRow('Created', g.created_at);
        if (g.container_config) {
          const cc = g.container_config;
          if (cc.packages) {
            const pkgs = [...(cc.packages.apt || []), ...(cc.packages.npm || [])];
            if (pkgs.length) html += detailRow('Packages', pkgs.join(', '));
          }
          if (cc.mcpServers) {
            html += detailRow('MCP Servers', Object.keys(cc.mcpServers).join(', '));
          }
        }
        html += '</div>';

        // Sessions
        html += '<h3 class="section-title">Sessions (' + data.sessions.length + ')</h3>';
        if (data.sessions.length > 0) {
          html += '<table><tr><th>ID</th><th>Status</th><th>Container</th><th>Last Active</th></tr>';
          for (const s of data.sessions) {
            const statusBadge = s.status === 'active' ? badge('active', 'green') : badge(s.status, 'gray');
            const containerBadge = s.container_status === 'running' ? badge('running', 'green') :
              s.container_status === 'idle' ? badge('idle', 'yellow') : badge(s.container_status, 'gray');
            html += '<tr><td style="font-size:11px;color:#666" title="' + esc(s.id) + '">' + esc(truncId(s.id, 28)) + '</td><td>' + statusBadge + '</td><td>' + containerBadge + '</td><td>' + timeAgo(s.last_active) + '</td></tr>';
          }
          html += '</table>';
        }

        // Messaging groups (wirings)
        html += '<h3 class="section-title">Channel Wirings (' + data.wirings.length + ')</h3>';
        if (data.wirings.length > 0) {
          html += '<table><tr><th>Channel</th><th>Name / ID</th><th>Policy</th><th>Priority</th></tr>';
          for (const w of data.wirings) {
            const wName = w.mg_name || friendlyId(w.channel_type, w.platform_id);
            const policy = w.unknown_sender_policy || 'strict';
            html += '<tr><td>' + badge(w.channel_type, 'blue') + '</td>' +
              '<td><span style="font-weight:500">' + esc(wName) + '</span><div style="font-size:11px;color:#555" title="' + esc(w.platform_id) + '">' + esc(truncId(w.platform_id, 35)) + '</div></td>' +
              '<td>' + badge(policy, policy === 'public' ? 'green' : policy === 'strict' ? 'red' : 'yellow') + '</td>' +
              '<td>' + w.priority + '</td></tr>';
          }
          html += '</table>';
        }

        // Destinations
        html += '<h3 class="section-title">Destinations (' + data.destinations.length + ')</h3>';
        if (data.destinations.length > 0) {
          html += '<table><tr><th>Name</th><th>Type</th><th>Target</th></tr>';
          for (const d of data.destinations) {
            html += '<tr><td>' + esc(d.local_name) + '</td><td>' + badge(d.target_type, d.target_type === 'channel' ? 'blue' : 'purple') + '</td><td style="font-size:11px" title="' + esc(d.target_id) + '">' + esc(truncId(d.target_id, 30)) + '</td></tr>';
          }
          html += '</table>';
        }

        // Members & Admins
        html += '<h3 class="section-title">Members (' + data.members.length + ') &amp; Admins (' + data.admins.length + ')</h3>';
        if (data.admins.length > 0 || data.members.length > 0) {
          html += '<table><tr><th>User</th><th>Role</th><th>Since</th></tr>';
          for (const a of data.admins) {
            html += '<tr><td>' + esc(a.display_name || a.user_id) + '</td><td>' + badge('admin', 'purple') + '</td><td>' + esc(a.granted_at) + '</td></tr>';
          }
          for (const m of data.members) {
            html += '<tr><td>' + esc(m.display_name || m.user_id) + '</td><td>' + badge('member', 'gray') + '</td><td>' + esc(m.added_at) + '</td></tr>';
          }
          html += '</table>';
        }

        document.getElementById('detail').innerHTML = html;
      } catch (e) {
        document.getElementById('detail').innerHTML = '<div class="loading">Error: ' + esc(e.message) + '</div>';
      }
    }

    function detailRow(label, value) {
      return '<div class="detail-row"><span class="detail-label">' + esc(label) + '</span><span class="detail-value">' + esc(String(value || '')) + '</span></div>';
    }
    </script>
  `);
}
