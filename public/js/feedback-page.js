// Lesson 7: the feedback form and list. Runs in the visitor's browser.
//
// Each action sends requests to this server's /api/feedback routes and shows
// every request's method, URL, HTTP status, and body, like the other demos.
// Anything a visitor typed is shown with textContent, never innerHTML, so
// text like <b>hi</b> appears as text and never runs as HTML.

const form = document.querySelector('#feedback-form');
const formHeading = document.querySelector('#form-heading');
const lessonInput = document.querySelector('#feedback-lesson');
const messageInput = document.querySelector('#feedback-message');
const saveButton = document.querySelector('#feedback-save');
const cancelButton = document.querySelector('#feedback-cancel');
const output = document.querySelector('#feedback-output');
const listHeading = document.querySelector('#list-heading');
const list = document.querySelector('#feedback-list');

// The id of the feedback being edited, or null when the form adds new feedback.
let editingId = null;

// Sends one request and adds it to the output box. Returns { ok, data }.
async function send(method, url, body) {
  const options = { method };
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  const started = performance.now();
  try {
    const response = await fetch(url, options);
    const ms = Math.round(performance.now() - started);
    const text = await response.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      // No body (204) or not JSON: show the text as it came.
    }
    let shown = text === '' ? '(no body)' : JSON.stringify(data ?? text, null, 2);
    if (Array.isArray(data)) shown = `(${data.length} items, shown in the list below)`;
    log(`${method} ${url}`, `HTTP ${response.status} ${response.statusText} in ${ms} ms`, shown);
    return { ok: response.ok, data };
  } catch {
    // fetch only rejects when no answer came back at all.
    log(`${method} ${url}`, 'No response', 'Could not reach the server. Is it running?');
    return { ok: false, data: null };
  }
}

// Adds one request to the output box: the request, its status, and the body.
function log(request, statusLine, body) {
  const status = document.createElement('span');
  status.className = 'demo-status';
  status.textContent = `${request}\n${statusLine}`;
  if (output.textContent !== '') output.append('\n\n');
  output.append(status, '\n', body);
}

// GET every row and draw the list again.
async function loadList() {
  const { ok, data } = await send('GET', '/api/feedback');
  list.textContent = '';
  if (!ok) {
    addListText('Could not load the feedback. See the request above.');
    return;
  }
  if (data.length === 0) addListText('No feedback yet. Be the first.');
  for (const row of data) list.append(makeItem(row));
}

function addListText(text) {
  const item = document.createElement('li');
  item.textContent = text;
  list.append(item);
}

// One list item: who, when, the message, and Edit and Delete buttons.
function makeItem(row) {
  const item = document.createElement('li');

  const meta = document.createElement('p');
  meta.className = 'feedback-meta';
  meta.textContent = `#${row.id}, lesson ${row.lesson}, ${new Date(row.created_at).toLocaleString()}`;

  const message = document.createElement('p');
  message.textContent = row.message;

  const edit = document.createElement('button');
  edit.type = 'button';
  edit.textContent = 'Edit';
  edit.setAttribute('aria-label', `Edit feedback #${row.id}`);
  edit.addEventListener('click', () => startEditing(row));

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = 'Delete';
  remove.setAttribute('aria-label', `Delete feedback #${row.id}`);
  remove.addEventListener('click', () => deleteRow(row.id));

  item.append(meta, message, edit, ' ', remove);
  return item;
}

// Edit: copy the row into the form. Saving sends PUT instead of POST.
function startEditing(row) {
  editingId = row.id;
  lessonInput.value = row.lesson;
  messageInput.value = row.message;
  formHeading.textContent = `Edit feedback #${row.id}`;
  saveButton.textContent = 'Save changes';
  cancelButton.hidden = false;
  messageInput.focus();
}

function stopEditing() {
  editingId = null;
  form.reset();
  formHeading.textContent = 'Add feedback';
  saveButton.textContent = 'Send feedback';
  cancelButton.hidden = true;
}

async function deleteRow(id) {
  output.textContent = '';
  await send('DELETE', `/api/feedback/${id}`);
  if (editingId === id) stopEditing();
  await loadList();
  // The button that had focus is gone, so move focus to the list.
  listHeading.focus();
}

// Send the form. The browser does not check it first (novalidate), so the
// server's 400 answers can be seen.
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  output.textContent = '';
  const body = {
    lesson: lessonInput.value === '' ? null : Number(lessonInput.value),
    message: messageInput.value,
  };
  const { ok } = editingId === null
    ? await send('POST', '/api/feedback', body)
    : await send('PUT', `/api/feedback/${editingId}`, body);
  // On a 400, keep what was typed so it can be fixed.
  if (!ok) return;
  stopEditing();
  await loadList();
});

cancelButton.addEventListener('click', () => {
  stopEditing();
  lessonInput.focus();
});

loadList();
