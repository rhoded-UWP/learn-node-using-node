// Learn Node on Node: demo handlers (APC 440, Module 11)
//
// Each lesson's "Try it live" button calls one of these. server.js imports
// them and adds each one with app.get.

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

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
