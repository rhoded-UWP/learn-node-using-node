// Learn Node on Node: demo handlers (APC 440, Module 11)
//
// Each lesson's "Try it live" button calls one of these. server.js imports
// them and decides which one answers each /demo/ path.

// Every JSON answer goes through here, so the status code and Content-Type
// are always set the same way.
export function sendJson(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

// The only request headers echo repeats back. Others, like cookies, stay private.
const SAFE_HEADERS = ['user-agent', 'accept', 'accept-language'];

// GET /demo/echo: answers with what the browser sent in its request.
export function echo(request, response, url) {
  const headers = {};
  for (const name of SAFE_HEADERS) {
    if (request.headers[name]) headers[name] = request.headers[name];
  }
  sendJson(response, 200, {
    method: request.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    headers,
  });
}
