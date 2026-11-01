# Learn Node on Node: Project Instructions for Claude Code

This is a student project for APC 440 (Web Development), Module 11.
The student is learning Node.js on the server. The site is a tutorial about
Node.js that is served by the Node.js code it teaches. Keep code readable,
keep it short, and explain your choices in plain words.

## The rule that matters most: every claim has a live demo
- Each lesson page teaches one idea and has at least one live demo endpoint
  on this server that proves it.
- The lesson text must match what the demo really returns. Before writing
  or changing "What just happened", start the server, call the demo, and read
  the actual output. If the output disagrees with what you expected, the
  text changes, not the demo.
- Do not make claims about Node.js that the page's code or demo does not show.

## Stack
- Node.js 24 or newer. ES modules only: `import`, never `require()`.
  package.json already has "type": "module".
- Core modules only, imported with the `node:` prefix (node:http,
  node:fs/promises, node:path, node:os, node:timers/promises).
  No npm packages, no Express, no frameworks. Express arrives in Module 12.
  If the student asks to install a package, remind them of this rule first.
- Use `import.meta.dirname` for the project folder. ES modules have no
  __dirname.
- server.js creates the server, routes requests, and serves static files.
- demos.js holds the demo handlers. server.js imports them. Create demos.js
  the first time a demo is added.
- Listen on `process.env.PORT`, falling back to 3000. Render sets PORT.
- Pages are static files in public/. Browser JavaScript lives in public/js/.
  Use public/styles.css for all styling. Do not add CSS frameworks.
  Add a CSS rule only if no existing class fits, at the bottom of styles.css.

## Pages (static files from public/)
- "/" serves public/index.html.
- A path with no file extension is served as .html:
  /lessons/event-loop serves public/lessons/event-loop.html.
- Lesson files, in lesson order (the home page already links to all six):
  1. public/lessons/http-server.html
  2. public/lessons/modules-and-npm.html
  3. public/lessons/event-loop.html
  4. public/lessons/async-await.html
  5. public/lessons/errors.html
  6. public/lessons/server-status.html
- Build every lesson by copying public/lessons/_lesson-template.html.
  Keep its four sections in order: The idea, The code, Try it live,
  What just happened. Keep the header, nav, footer, and the try-it.js script.
- "The code" shows the real handler from this project, copied exactly, with
  < > & escaped. If you change that handler later, update the page too.
- Demo buttons use the markup in the template. public/js/try-it.js wires
  them up. Do not rewrite try-it.js.

## Demo endpoints (JSON, all GET, all under /demo/)
Use these exact paths. Later steps depend on them.
- /demo/about: name, version, type, and dependency count, read from this
  project's package.json with node:fs/promises.
- /demo/echo: the request's method, path, query parameters, and only these
  headers: user-agent, accept, accept-language. Never include IP addresses,
  cookies, authorization, or any x-forwarded-* header.
- /demo/order: runs synchronous code, process.nextTick, a resolved promise's
  .then, setTimeout with 0 ms, and setImmediate, records each label when it
  runs, and responds once all have run with { "order": [...] }.
- /demo/sequential: awaits three 1000 ms waits one after another and returns
  the elapsed milliseconds.
- /demo/parallel: starts the same three waits at once with Promise.all and
  returns the elapsed milliseconds.
- /demo/slow?ms=: waits without blocking (await setTimeout from
  node:timers/promises). Cap ms at 3000. Missing or invalid ms is a 400.
- /demo/block?ms=: a busy loop that blocks the event loop, for a local
  demonstration only. When `process.env.RENDER` is set (Render sets it), this
  route must return 404. Cap ms at 3000.
- /demo/fail?type=: shows handled errors. type=reject (a rejected promise
  caught with try/catch, 500), type=missing-file (reading a file that does
  not exist, 404), type=bad-json (JSON.parse of broken text, 500). Any other
  type is a 400 that lists the valid types. The server keeps running after
  every one of these.
- /demo/status: Node version, platform, uptime in seconds, requests served
  since the server started, memory used in MB, and when the server started.

## Errors and status codes
- One bad request must never crash the server. Wrap request handling so a
  thrown error or rejected promise becomes a 500 JSON response.
- Unknown page paths: 404 with public/404.html. Unknown /demo/ paths: 404
  with JSON { "error": "Not found" }.
- Bad input in a query string: 400 with JSON that says what was wrong.
- Only GET is supported. Other methods get 405.
- Always set Content-Type. JSON uses "application/json; charset=utf-8".
- Log errors on the server with console.error. Never send stack traces or
  file system paths to the browser.

## Static file safety
- Serve files only from public/. Build the file path with node:path, and if
  the resolved path is not inside public/, respond 404 without reading it.
- Content types: .html, .css, .js, .json, .svg, .png, .ico, .txt. Anything
  else is application/octet-stream.

## Accessibility
- One h1 per page and logical heading order
- Every button has text; everything works with the keyboard alone
- Demo output uses aria-live="polite" (already in the template)
- Never use color alone to show meaning
- Text contrast of at least 5:1

## Before reporting completion
- Start the server, request every route you added or changed (with curl or
  fetch), and check the status code and body. Then stop the server.
- List which files changed and why.
- Explain any new Node.js idea you used in one or two plain sentences.
