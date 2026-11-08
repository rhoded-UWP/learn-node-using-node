// Learn Node on Node: demo handlers (APC 440, Module 11)
//
// Each lesson's "Try it live" button calls one of these. server.js imports
// them and adds each one with app.get.

// The only request headers echo repeats back. Others, like cookies, stay private.
const SAFE_HEADERS = ['user-agent', 'accept', 'accept-language'];

// GET /demo/echo: answers with what the browser sent in its request.
export function echo(req, res) {
  const headers = {};
  for (const name of SAFE_HEADERS) {
    if (req.get(name)) headers[name] = req.get(name);
  }
  res.status(200).json({
    method: req.method,
    path: req.path,
    query: req.query,
    headers,
  });
}
