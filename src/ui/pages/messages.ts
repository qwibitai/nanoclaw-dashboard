import { layout } from '../layout.js';

export function messagesPage(): string {
  return layout('Messages', '/dashboard/messages', `
    <h2 class="page-title">Messages</h2>
    <div id="selector" style="margin-bottom:16px">
      <span style="color:#888;font-size:13px">Select a session from the </span>
      <a href="/dashboard/sessions">Sessions page</a>
      <span style="color:#888;font-size:13px"> to view messages, or use query params: ?agentGroupId=X&sessionId=Y</span>
    </div>
    <div id="content"></div>
    <script>
    (async () => {
      const params = new URLSearchParams(location.search);
      const agentGroupId = params.get('agentGroupId');
      const sessionId = params.get('sessionId');

      if (!agentGroupId || !sessionId) {
        // Load session list for quick selection
        try {
          const sessions = await api('/api/sessions');
          const active = sessions.filter(s => s.status === 'active');
          if (active.length > 0) {
            let html = '<h3 class="section-title">Active Sessions</h3><table><tr><th>Agent</th><th>Channel</th><th>Last Active</th><th></th></tr>';
            for (const s of active) {
              html += '<tr><td>' + esc(s.agent_group_name || s.agent_group_id) + '</td>' +
                '<td>' + (s.channel_type ? badge(s.channel_type, 'blue') : '-') + '</td>' +
                '<td>' + timeAgo(s.last_active) + '</td>' +
                '<td><a href="/dashboard/messages?agentGroupId=' + esc(s.agent_group_id) + '&sessionId=' + esc(s.id) + '">View messages</a></td></tr>';
            }
            html += '</table>';
            document.getElementById('content').innerHTML = html;
          }
        } catch (e) {}
        return;
      }

      document.getElementById('selector').innerHTML =
        '<a href="/dashboard/messages">&larr; Back</a> ' +
        '<span style="color:#666;font-size:12px">Session: ' + esc(sessionId) + '</span>';

      document.getElementById('content').innerHTML = '<div class="loading">Loading messages...</div>';

      try {
        const data = await api('/api/messages?agentGroupId=' + encodeURIComponent(agentGroupId) + '&sessionId=' + encodeURIComponent(sessionId));

        // Interleave inbound and outbound by timestamp
        const all = [
          ...data.inbound.map(m => ({ ...m, direction: 'inbound' })),
          ...data.outbound.map(m => ({ ...m, direction: 'outbound' })),
        ].sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));

        if (all.length === 0) {
          document.getElementById('content').innerHTML = '<div class="loading">No messages in this session</div>';
          return;
        }

        let html = '<table><tr><th>Time</th><th>Direction</th><th>Kind</th><th>Content</th></tr>';
        for (const m of all) {
          const dirBadge = m.direction === 'inbound' ? badge('IN', 'blue') : badge('OUT', 'green');
          let content = m.content || '';
          try {
            const parsed = JSON.parse(content);
            if (parsed.text) content = parsed.text;
            else if (parsed.type) content = '[' + parsed.type + '] ' + (parsed.text || JSON.stringify(parsed).slice(0, 200));
            else content = JSON.stringify(parsed).slice(0, 300);
          } catch { content = content.slice(0, 300); }

          html += '<tr>' +
            '<td style="white-space:nowrap;font-size:12px;color:#888">' + esc(m.timestamp || '') + '</td>' +
            '<td>' + dirBadge + '</td>' +
            '<td style="font-size:12px">' + esc(m.kind || '') + '</td>' +
            '<td style="font-size:12px;max-width:500px;overflow:hidden;text-overflow:ellipsis">' + esc(content) + '</td>' +
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
