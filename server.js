// Learn Node on Node: starter server (APC 440, Module 11)
//
// These lines are the whole server right now. In Lab 11 you grow it into a
// tutorial site: it will serve the lesson pages in public/ and run the live
// demos those pages teach with.

import http from 'node:http';

// Render tells your server which port to use through the PORT environment
// variable. On your own computer there is no PORT, so we fall back to 3000.
const PORT = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
  // Every request that reaches the server shows up in your terminal.
  console.log(request.method, request.url);

  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Learn Node on Node</title>
  </head>
  <body>
    <h1>Learn Node on Node</h1>
    <p>The starter server is running. Every page and demo on this site will
    come from server.js.</p>
  </body>
</html>`);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
