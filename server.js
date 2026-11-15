// Learn Node on Node: the server (APC 440, Module 11)
//
// This file creates the Express app, serves the pages in public/, adds each
// live demo, and ends with the 404 handlers and the error handler.
// The demo handlers live in demos.js, and the feedback API is in feedback.js.

import express from 'express';
import path from 'node:path';
import {
  echo, about, order, sequential, parallel, fail, countRequests, status,
} from './demos.js';
import { setupDatabase } from './db.js';
import {
  listFeedback, getFeedback, createFeedback, updateFeedback, deleteFeedback,
} from './feedback.js';

// Render tells your server which port to use through the PORT environment
// variable. On your own computer there is no PORT, so we fall back to 3000.
const PORT = process.env.PORT || 3000;

// The only folder the browser is allowed to read files from.
const PUBLIC_DIR = path.join(import.meta.dirname, 'public');

const app = express();

// Count every request, before anything else can answer it.
app.use(countRequests);

// Log every request in the terminal.
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// Pages and demos only answer GET. Every other method gets a 405.
// /api/ routes are checked later, each with its own list of methods.
app.use((req, res, next) => {
  if (req.method === 'GET' || req.path.startsWith('/api/')) return next();
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
app.get('/demo/status', status);

// Lesson 7: the feedback API. Each handler is in feedback.js.
// express.json() reads a JSON request body into req.body.
app.use('/api', express.json());

// Answers any method a route does not list, with the ones it does.
function onlyAllow(methods) {
  return (req, res) => {
    res.set('Allow', methods);
    res.status(405).json({ error: `Method not allowed. Use ${methods}.` });
  };
}

app.route('/api/feedback')
  .get(listFeedback)
  .post(createFeedback)
  .all(onlyAllow('GET, POST'));

app.route('/api/feedback/:id')
  .get(getFeedback)
  .put(updateFeedback)
  .delete(deleteFeedback)
  .all(onlyAllow('GET, PUT, DELETE'));

// Unknown /demo/ and /api/ paths get JSON. Any other unknown path gets the 404 page.
app.use(['/demo', '/api'], (req, res) => {
  res.status(404).json({ error: 'Not found' });
});
app.use((req, res) => {
  res.status(404).sendFile('404.html', { root: PUBLIC_DIR });
});

// The error handler has four parameters, so Express sends every error here.
// The details go to the terminal, never to the browser.
app.use((error, req, res, next) => {
  // express.json() could not read the body. That is the visitor's mistake: 400.
  if (error.type === 'entity.parse.failed') {
    console.error('Bad JSON body:', error.message);
    return res.status(400).json({ error: 'The body is not valid JSON.' });
  }
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Create the database tables before the server answers anyone. If the
// database is missing or down, the server still starts without it.
if (await setupDatabase()) {
  console.log('Database ready');
}

// app.listen creates the Node.js HTTP server for us and starts it.
app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Server running at http://localhost:${PORT}`);
});
