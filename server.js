// Learn Node on Node: the server (APC 440, Module 11)
//
// This file creates the server, routes each request, and serves the pages
// in public/. The live demos will live in demos.js.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { sendJson, echo } from './demos.js';

// Render tells your server which port to use through the PORT environment
// variable. On your own computer there is no PORT, so we fall back to 3000.
const PORT = process.env.PORT || 3000;

// The only folder the browser is allowed to read files from.
const PUBLIC_DIR = path.join(import.meta.dirname, 'public');

// File extension -> Content-Type. Anything else is sent as raw bytes.
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

// Each demo path and the function in demos.js that answers it.
const DEMOS = {
  '/demo/echo': echo,
};

// Reads one file and sends it. A file that is not there gets the 404 page.
async function serveFile(response, filePath, status = 200) {
  let body;
  try {
    body = await readFile(filePath);
  } catch (error) {
    const notThere = ['ENOENT', 'EISDIR', 'ENOTDIR'].includes(error.code);
    if (notThere && status !== 404) {
      return serveFile(response, path.join(PUBLIC_DIR, '404.html'), 404);
    }
    throw error; // A real problem (or 404.html is missing): let it become a 500.
  }
  const type = CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream';
  response.writeHead(status, { 'Content-Type': type });
  response.end(body);
}

async function handleRequest(request, response) {
  console.log(request.method, request.url);

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { error: 'Method not allowed. Use GET.' });
  }

  const url = new URL(request.url, 'http://localhost');

  if (url.pathname.startsWith('/demo/')) {
    const demo = DEMOS[url.pathname];
    if (!demo) return sendJson(response, 404, { error: 'Not found' });
    return demo(request, response, url);
  }

  // Turn the URL path into a file name: "/" is the home page, and a path
  // with no extension is an .html page (/lessons/errors -> errors.html).
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return serveFile(response, path.join(PUBLIC_DIR, '404.html'), 404);
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  if (path.extname(pathname) === '') pathname += '.html';

  // Safety check: the resolved path must stay inside public/. This stops
  // requests like /../server.js from reading files outside the folder.
  const filePath = path.join(PUBLIC_DIR, pathname);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) || pathname.includes('\0')) {
    return serveFile(response, path.join(PUBLIC_DIR, '404.html'), 404);
  }

  return serveFile(response, filePath);
}

const server = http.createServer((request, response) => {
  // If anything inside handleRequest throws, answer with a 500 instead of
  // crashing. The details go to the terminal, never to the browser.
  handleRequest(request, response).catch((error) => {
    console.error(error);
    if (!response.headersSent) {
      sendJson(response, 500, { error: 'Something went wrong on the server.' });
    } else {
      response.end();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
