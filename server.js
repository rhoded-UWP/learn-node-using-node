// Learn Node on Node: the server (APC 440, Module 11)
//
// This file creates the Express app, serves the pages in public/, adds each
// live demo, and ends with the 404 handlers and the error handler.
// The demo handlers live in demos.js.

import express from 'express';
import path from 'node:path';
import { echo, about, order, sequential, parallel, fail } from './demos.js';

// Render tells your server which port to use through the PORT environment
// variable. On your own computer there is no PORT, so we fall back to 3000.
const PORT = process.env.PORT || 3000;

// The only folder the browser is allowed to read files from.
const PUBLIC_DIR = path.join(import.meta.dirname, 'public');

const app = express();

// Log every request in the terminal.
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// This site only answers GET. Every other method gets a 405.
app.use((req, res, next) => {
  if (req.method === 'GET') return next();
  res.set('Allow', 'GET');
  res.status(405).json({ error: 'Method not allowed. Use GET.' });
});

// Pages and files from public/. "/" is index.html, and a path with no
// extension is an .html page (/lessons/errors -> errors.html).
// express.static sets Content-Type and refuses paths that leave public/.
app.use(express.static(PUBLIC_DIR, { extensions: ['html'], redirect: false }));

// Live demos. Each handler is in demos.js.
app.get('/demo/echo', echo);
app.get('/demo/about', about);
app.get('/demo/order', order);
app.get('/demo/sequential', sequential);
app.get('/demo/parallel', parallel);
app.get('/demo/fail', fail);

// Unknown /demo/ paths get JSON. Any other unknown path gets the 404 page.
app.use('/demo', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});
app.use((req, res) => {
  res.status(404).sendFile('404.html', { root: PUBLIC_DIR });
});

// The error handler has four parameters, so Express sends every error here.
// The details go to the terminal, never to the browser.
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// app.listen creates the Node.js HTTP server for us and starts it.
app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Server running at http://localhost:${PORT}`);
});
