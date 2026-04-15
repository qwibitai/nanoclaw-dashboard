import { layout } from '../layout.js';

export function logsPage(): string {
  return layout('Logs', '/dashboard/logs', `
    <h2 class="page-title">Logs</h2>
    <div class="detail-panel" style="color:#888;text-align:center;padding:40px">
      <p style="font-size:14px;margin-bottom:8px">Log streaming requires a direct connection to the NanoClaw host.</p>
      <p style="font-size:12px">The standalone dashboard receives periodic snapshots — live logs are available when running the dashboard locally on the same machine as NanoClaw.</p>
    </div>
  `);
}
