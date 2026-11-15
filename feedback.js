// Learn Node on Node: the feedback API (APC 440, Module 11, lesson 7)
//
// One resource, lesson feedback, stored in the feedback table. Each handler
// answers one route. server.js adds them under /api/feedback.

import { query } from './db.js';

// The biggest id a SERIAL column can hold. Postgres refuses bigger numbers.
const MAX_ID = 2147483647;

// Reads :id from the URL. Sends a 400 and returns null if it is not a whole number.
function readId(req, res) {
  const { id } = req.params;
  if (!/^\d+$/.test(id) || Number(id) > MAX_ID) {
    res.status(400).json({ error: `id must be a whole number up to ${MAX_ID}.` });
    return null;
  }
  return Number(id);
}

// Checks a POST or PUT body. Sends a 400 and returns null if anything is wrong.
function readBody(req, res) {
  const body = req.body;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    res.status(400).json({
      error: 'Send a JSON object like {"lesson": 7, "message": "..."} with Content-Type: application/json.',
    });
    return null;
  }
  const { lesson, message } = body;
  if (!Number.isInteger(lesson) || lesson < 1 || lesson > 7) {
    res.status(400).json({ error: 'lesson must be a whole number from 1 to 7.' });
    return null;
  }
  if (typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'message is missing or empty.' });
    return null;
  }
  if (message.trim().length > 500) {
    res.status(400).json({ error: 'message must be 500 characters or fewer.' });
    return null;
  }
  return { lesson, message: message.trim() };
}

// The answer when no row has that id.
function notFound(res, id) {
  res.status(404).json({ error: `No feedback with id ${id}.` });
}

// GET /api/feedback and GET /api/feedback?lesson=N: every row, newest first.
export async function listFeedback(req, res) {
  const { lesson } = req.query;
  if (lesson === undefined) {
    const result = await query(
      'SELECT id, lesson, message, created_at FROM feedback ORDER BY created_at DESC, id DESC',
    );
    return res.status(200).json(result.rows);
  }
  if (!/^[1-7]$/.test(lesson)) {
    return res.status(400).json({ error: 'lesson must be a whole number from 1 to 7.' });
  }
  const result = await query(
    'SELECT id, lesson, message, created_at FROM feedback WHERE lesson = $1 ORDER BY created_at DESC, id DESC',
    [Number(lesson)],
  );
  res.status(200).json(result.rows);
}

// GET /api/feedback/:id: one row.
export async function getFeedback(req, res) {
  const id = readId(req, res);
  if (id === null) return;
  const result = await query(
    'SELECT id, lesson, message, created_at FROM feedback WHERE id = $1',
    [id],
  );
  if (result.rows.length === 0) return notFound(res, id);
  res.status(200).json(result.rows[0]);
}

// POST /api/feedback: adds a row and answers with it, id and all.
export async function createFeedback(req, res) {
  const input = readBody(req, res);
  if (input === null) return;
  const result = await query(
    'INSERT INTO feedback (lesson, message) VALUES ($1, $2) RETURNING id, lesson, message, created_at',
    [input.lesson, input.message],
  );
  res.status(201).json(result.rows[0]);
}

// PUT /api/feedback/:id: replaces a row's lesson and message.
export async function updateFeedback(req, res) {
  const id = readId(req, res);
  if (id === null) return;
  const input = readBody(req, res);
  if (input === null) return;
  const result = await query(
    'UPDATE feedback SET lesson = $1, message = $2 WHERE id = $3 RETURNING id, lesson, message, created_at',
    [input.lesson, input.message, id],
  );
  if (result.rows.length === 0) return notFound(res, id);
  res.status(200).json(result.rows[0]);
}

// DELETE /api/feedback/:id: removes a row. 204 means "done, nothing to send".
export async function deleteFeedback(req, res) {
  const id = readId(req, res);
  if (id === null) return;
  const result = await query('DELETE FROM feedback WHERE id = $1', [id]);
  if (result.rowCount === 0) return notFound(res, id);
  res.status(204).end();
}
