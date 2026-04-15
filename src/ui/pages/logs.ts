import { layout } from '../layout.js';

export function logsPage(): string {
  return layout('Logs', '/dashboard/logs', `
    <h2 class="page-title">Logs</h2>
    <div style="margin-bottom:12px;display:flex;gap:12px;align-items:center">
      <label style="font-size:12px;color:#888">Filter:</label>
      <select id="level-filter" onchange="applyFilter()">
        <option value="">All</option>
        <option value="error">Errors</option>
        <option value="warn">Warnings</option>
        <option value="info">Info</option>
      </select>
      <label style="font-size:12px;color:#888;margin-left:8px">
        <input type="checkbox" id="auto-scroll" checked> Auto-scroll
      </label>
      <span id="status" style="font-size:12px;color:#666"></span>
    </div>
    <div id="log-viewer" class="log-container"></div>
    <script>
    var viewer = document.getElementById('log-viewer');
    var statusEl = document.getElementById('status');
    var allLines = [];
    var MAX_LINES = 2000;

    function connect() {
      statusEl.textContent = 'Connecting...';
      var logUrl = '/api/logs?token=' + encodeURIComponent(TOKEN);
      fetch(logUrl).then(function(response) {
        if (!response.ok) {
          statusEl.textContent = 'Log streaming unavailable';
          statusEl.style.color = '#f87171';
          return;
        }
        statusEl.textContent = 'Connected';
        statusEl.style.color = '#4ade80';
        var reader = response.body.getReader();
        var decoder = new TextDecoder();
        var buffer = '';

        function read() {
          reader.read().then(function(result) {
            if (result.done) {
              statusEl.textContent = 'Disconnected';
              statusEl.style.color = '#f87171';
              setTimeout(connect, 3000);
              return;
            }
            buffer += decoder.decode(result.value, { stream: true });
            var lines = buffer.split(String.fromCharCode(10));
            buffer = lines.pop() || '';
            for (var i = 0; i < lines.length; i++) {
              if (lines[i].indexOf('data: ') === 0) {
                try {
                  var data = JSON.parse(lines[i].slice(6));
                  if (data.line) addLine(data.line);
                } catch(e) {}
              }
            }
            read();
          }).catch(function() {
            statusEl.textContent = 'Disconnected';
            statusEl.style.color = '#f87171';
            setTimeout(connect, 3000);
          });
        }
        read();
      }).catch(function() {
        statusEl.textContent = 'Failed to connect';
        statusEl.style.color = '#f87171';
        setTimeout(connect, 5000);
      });
    }

    function stripAnsi(s) {
      return s.replace(/\\x1b\\[[0-9;]*m/g, '');
    }

    function addLine(text) {
      text = text.replace(/\\x1b\\[[0-9;]*m/g, '');
      allLines.push(text);
      if (allLines.length > MAX_LINES) allLines.shift();
      var filter = document.getElementById('level-filter').value;
      if (filter && text.toLowerCase().indexOf(filter) < 0) return;
      appendLine(text);
      if (document.getElementById('auto-scroll').checked) {
        viewer.scrollTop = viewer.scrollHeight;
      }
    }

    function appendLine(text) {
      var div = document.createElement('div');
      div.className = 'log-line';
      div.textContent = text;
      if (text.indexOf('ERROR') >= 0) div.style.color = '#f87171';
      else if (text.indexOf('WARN') >= 0) div.style.color = '#facc15';
      else if (text.indexOf('DEBUG') >= 0) div.style.color = '#666';
      viewer.appendChild(div);
      while (viewer.children.length > MAX_LINES) viewer.removeChild(viewer.firstChild);
    }

    function applyFilter() {
      viewer.innerHTML = '';
      var filter = document.getElementById('level-filter').value;
      for (var i = 0; i < allLines.length; i++) {
        if (!filter || allLines[i].toLowerCase().indexOf(filter) >= 0) {
          appendLine(allLines[i]);
        }
      }
      viewer.scrollTop = viewer.scrollHeight;
    }

    connect();
    </script>
  `);
}
