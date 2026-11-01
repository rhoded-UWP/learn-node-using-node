// Try it live: runs in the visitor's browser, not on the server.
//
// Every lesson page has one or more demo boxes like this:
//
//   <div class="demo">
//     <p class="demo-endpoint">GET /demo/echo</p>
//     <button type="button" data-demo="/demo/echo">Run the demo</button>
//     <pre class="demo-output" aria-live="polite"></pre>
//   </div>
//
// Clicking the button asks THIS server for the demo URL and shows the HTTP
// status, how long the request took, and the JSON the server sent back.
// You should not need to edit this file.

for (const button of document.querySelectorAll('[data-demo]')) {
  button.addEventListener('click', () => runDemo(button));
}

async function runDemo(button) {
  const box = button.closest('.demo');
  const output = box.querySelector('.demo-output');
  const url = button.dataset.demo;
  const label = button.textContent;

  button.disabled = true;
  button.textContent = 'Running...';
  output.textContent = `Asking the server for ${url} ...`;

  const started = performance.now();
  try {
    const response = await fetch(url);
    const ms = Math.round(performance.now() - started);
    const text = await response.text();

    // Error status codes (400, 404, 500) are still real answers from the
    // server, so we show them instead of treating them as a failure.
    let body = text;
    try {
      body = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      // Not JSON: show the text as it came.
    }
    showResult(output, `HTTP ${response.status} ${response.statusText} in ${ms} ms`, body);
  } catch (error) {
    // fetch only rejects when no answer came back at all.
    showResult(output, 'No response', 'Could not reach the server. Is it running?');
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

function showResult(output, statusLine, body) {
  output.textContent = '';
  const status = document.createElement('span');
  status.className = 'demo-status';
  status.textContent = statusLine;
  output.append(status, '\n\n', body);
}
