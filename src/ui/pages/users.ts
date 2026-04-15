import { layout } from '../layout.js';

export function usersPage(): string {
  return layout('Users', '/dashboard/users', `
    <h2 class="page-title">Users &amp; Access Control</h2>
    <div id="summary" class="cards"><div class="loading">Loading...</div></div>
    <h3 class="section-title">User List</h3>
    <div id="content"><div class="loading">Loading...</div></div>
    <script>
    (async () => {
      try {
        const users = await api('/api/users');

        // Summary cards
        const owners = users.filter(u => u.privilege === 'owner');
        const admins = users.filter(u => u.privilege === 'global_admin' || u.privilege === 'admin');
        const members = users.filter(u => u.privilege === 'member');
        document.getElementById('summary').innerHTML = [
          cardHtml('Total Users', users.length),
          cardHtml('Owners', owners.length),
          cardHtml('Admins', admins.length),
          cardHtml('Members', members.length),
        ].join('');

        if (users.length === 0) {
          document.getElementById('content').innerHTML = '<div class="loading">No users registered</div>';
          return;
        }

        // Privilege hierarchy legend
        let html = '<div style="margin-bottom:16px;font-size:12px;color:#888">' +
          'Privilege hierarchy: ' +
          badge('owner', 'purple') + ' &rarr; ' +
          badge('global_admin', 'blue') + ' &rarr; ' +
          badge('admin', 'yellow') + ' &rarr; ' +
          badge('member', 'gray') +
          '</div>';

        html += '<table><tr><th>User</th><th>Channel</th><th>Privilege</th><th>Roles</th><th>Groups</th><th>DMs</th></tr>';
        for (const u of users) {
          const privColor = u.privilege === 'owner' ? 'purple' :
            u.privilege === 'global_admin' ? 'blue' :
            u.privilege === 'admin' ? 'yellow' :
            u.privilege === 'member' ? 'gray' : 'gray';

          // Parse channel:handle from user ID
          const colonIdx = u.id.indexOf(':');
          const userChannel = colonIdx >= 0 ? u.id.slice(0, colonIdx) : '';
          const userHandle = colonIdx >= 0 ? u.id.slice(colonIdx + 1) : u.id;
          const friendlyHandle = userChannel === 'whatsapp' ? userHandle.replace(/@.*/, '') : truncId(userHandle, 20);

          const roles = u.roles.map(r => {
            if (r.role === 'owner') return badge('owner', 'purple');
            if (!r.agent_group_id) return badge('global admin', 'blue');
            return badge('admin', 'yellow');
          }).join(' ') || badge('none', 'gray');

          const groups = u.memberships.map(m =>
            '<a href="/dashboard/agent-groups?id=' + esc(m.agent_group_id) + '">' + esc(m.agent_group_name) + '</a>'
          ).join(', ') || '<span style="color:#555">-</span>';

          const dms = u.dmChannels.map(d => badge(d.channel_type, 'blue')).join(' ') || '<span style="color:#555">-</span>';

          html += '<tr>' +
            '<td><span style="font-weight:500">' + esc(u.display_name || friendlyHandle) + '</span>' +
            '<div style="font-size:11px;color:#555">' + esc(friendlyHandle) + '</div></td>' +
            '<td>' + badge(userChannel, 'blue') + '</td>' +
            '<td>' + badge(u.privilege, privColor) + '</td>' +
            '<td>' + roles + '</td>' +
            '<td>' + groups + '</td>' +
            '<td>' + dms + '</td>' +
            '</tr>';
        }
        html += '</table>';
        document.getElementById('content').innerHTML = html;
      } catch (e) {
        document.getElementById('content').innerHTML = '<div class="loading">Error: ' + esc(e.message) + '</div>';
      }
    })();

    function cardHtml(label, value) {
      return '<div class="card"><div class="label">' + esc(label) + '</div><div class="value">' + esc(String(value)) + '</div></div>';
    }
    </script>
  `);
}
