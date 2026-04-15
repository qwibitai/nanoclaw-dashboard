import { layout } from '../layout.js';

export function channelsPage(): string {
  return layout('Channels', '/dashboard/channels', `
    <h2 class="page-title">Channels</h2>
    <div id="content"><div class="loading">Loading...</div></div>
    <script>
    (async () => {
      try {
        const data = await api('/api/channels');
        const channels = data.channels || [];

        if (channels.length === 0) {
          document.getElementById('content').innerHTML = '<div class="loading">No channels configured</div>';
          return;
        }

        let html = '';
        for (const ch of channels) {
          const statusBadge = ch.isLive ? badge('live', 'green') :
            ch.isRegistered ? badge('registered', 'yellow') : badge('offline', 'red');

          html += '<div class="detail-panel">';
          html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">';
          html += '<span style="font-size:16px;font-weight:600;color:#fff">' + esc(ch.channelType) + '</span>';
          html += statusBadge;
          html += '<span style="color:#666;font-size:12px">' + ch.groups.length + ' messaging group' + (ch.groups.length !== 1 ? 's' : '') + '</span>';
          html += '</div>';

          if (ch.groups.length > 0) {
            html += '<table><tr><th>Name / ID</th><th>Type</th><th>Policy</th><th>Agents</th></tr>';
            for (const g of ch.groups) {
              const mg = g.messagingGroup;
              const typeBadge = mg.is_group ? badge('group', 'blue') : badge('dm', 'gray');
              const policy = mg.unknown_sender_policy || 'strict';
              const policyBadge = badge(policy, policy === 'public' ? 'green' : policy === 'strict' ? 'red' : 'yellow');
              const agentLinks = g.agents.map(a =>
                '<a href="/dashboard/agent-groups?id=' + esc(a.agent_group_id) + '">' + esc(a.agent_group_name || a.agent_group_id) + '</a>'
              ).join(', ') || '<span style="color:#666">none</span>';

              const displayName = mg.name || friendlyPlatformId(ch.channelType, mg.platform_id);

              html += '<tr>' +
                '<td><span style="font-weight:500">' + esc(displayName) + '</span>' +
                '<div style="font-size:11px;color:#555;margin-top:2px" title="' + esc(mg.platform_id) + '">' + esc(truncId(mg.platform_id, 40)) + '</div></td>' +
                '<td>' + typeBadge + '</td>' +
                '<td>' + policyBadge + '</td>' +
                '<td>' + agentLinks + '</td>' +
                '</tr>';
            }
            html += '</table>';
          }
          html += '</div>';
        }

        document.getElementById('content').innerHTML = html;
      } catch (e) {
        document.getElementById('content').innerHTML = '<div class="loading">Error: ' + esc(e.message) + '</div>';
      }
    })();

    function friendlyPlatformId(channelType, pid) {
      if (!pid) return '?';
      // Discord: guild:channel -> just show last segment
      if (channelType === 'discord' && pid.startsWith('discord:')) {
        const parts = pid.split(':');
        return 'Channel ' + (parts[2] || '').slice(-6);
      }
      // WhatsApp: number@s.whatsapp.net -> just the number
      if (channelType === 'whatsapp') {
        return pid.replace(/@.*/, '');
      }
      // Slack: slack:XXXXX
      if (channelType === 'slack' && pid.startsWith('slack:')) {
        return pid.slice(6);
      }
      // Teams/others: truncate
      return truncId(pid, 24);
    }

    function truncId(s, max) {
      if (!s || s.length <= max) return s || '';
      return s.slice(0, max) + '...';
    }
    </script>
  `);
}
