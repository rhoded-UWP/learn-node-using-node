// Learn Node on Node: demo handlers (APC 440, Module 11)
//
// Each lesson's "Try it live" button calls one of these. server.js imports
// them and adds each one with app.get.

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

// The project folder. demos.js sits next to package.json and node_modules.
const PROJECT_DIR = import.meta.dirname;

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

// GET /demo/about: facts about this project, read from its own files.
export async function about(req, res) {
  const text = await readFile(path.join(PROJECT_DIR, 'package.json'), 'utf8');
  const pkg = JSON.parse(text);

  // Every package npm installed has its own folder in node_modules.
  // Names that start with a dot, like .package-lock.json, are npm's notes.
  const entries = await readdir(path.join(PROJECT_DIR, 'node_modules'), { withFileTypes: true });
  const packagesInstalled = entries.filter(
    (entry) => entry.isDirectory() && !entry.name.startsWith('.'),
  ).length;

  res.status(200).json({
    name: pkg.name,
    version: pkg.version,
    type: pkg.type,
    dependencyCount: Object.keys(pkg.dependencies).length,
    packagesInstalled,
  });
}

// GET /demo/order: five ways to run code, and the order Node.js runs them in.
// They are scheduled in this order on purpose, so you can compare.
export function order(req, res) {
  const labels = [];

  // Each one records its label when it runs. The fifth one sends the answer.
  function record(label) {
    labels.push(label);
    if (labels.length === 5) res.status(200).json({ order: labels });
  }

  setTimeout(() => record('setTimeout 0 ms'), 0);
  setImmediate(() => record('setImmediate'));
  Promise.resolve().then(() => record('promise .then'));
  process.nextTick(() => record('process.nextTick'));
  record('synchronous code');
}

// GET /demo/sequential: three 1000 ms waits, one after another.
// Each await pauses this function until that wait is done.
export async function sequential(req, res) {
  const start = Date.now();
  await wait(1000);
  await wait(1000);
  await wait(1000);
  res.status(200).json({ waits: 3, eachMs: 1000, elapsedMs: Date.now() - start });
}

// GET /demo/parallel: the same three waits, all started at once.
// Promise.all waits until every one of them is done.
export async function parallel(req, res) {
  const start = Date.now();
  await Promise.all([wait(1000), wait(1000), wait(1000)]);
  res.status(200).json({ waits: 3, eachMs: 1000, elapsedMs: Date.now() - start });
}

// The kinds of error /demo/fail can show.
const FAIL_TYPES = ['reject', 'missing-file', 'bad-json', 'uncaught'];

// A file that does not exist, for the missing-file and uncaught demos.
const MISSING_FILE = path.join(PROJECT_DIR, 'no-such-file.txt');

// GET /demo/fail?type=: errors on purpose, and how the server handles them.
export async function fail(req, res) {
  const { type } = req.query;

  if (type === 'reject') {
    try {
      await Promise.reject(new Error('This promise was rejected on purpose.'));
    } catch (error) {
      console.error('fail reject:', error.message);
      return res.status(500).json({ type, caught: true, error: error.message });
    }
  }

  if (type === 'missing-file') {
    try {
      await readFile(MISSING_FILE, 'utf8');
    } catch (error) {
      // error.message names the full path on this computer, so it stays here.
      console.error('fail missing-file:', error.message);
      return res.status(404).json({ type, caught: true, code: error.code });
    }
  }

  if (type === 'bad-json') {
    try {
      JSON.parse('{"name": "Node"');
    } catch (error) {
      console.error('fail bad-json:', error.message);
      return res.status(500).json({ type, caught: true, error: error.message });
    }
  }

  if (type === 'uncaught') {
    // No try/catch. Express 5 sends the rejected promise to the error handler.
    await readFile(MISSING_FILE, 'utf8');
  }

  res.status(400).json({ error: 'type must be one of validTypes.', validTypes: FAIL_TYPES });
}
