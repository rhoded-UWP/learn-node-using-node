# Learn Node on Node: Starter (APC 440, Module 11)

This is the starting point for **Learn Node on Node**, a tutorial site about
Node.js that is served by the Node.js code it teaches. In Lab 11 you build the
server, the lesson pages, and the live demos, then deploy the site to Render.

The site uses **no npm packages**. Everything comes from modules that ship
with Node.js.

## What's in this repository

| File | Purpose |
|---|---|
| `CLAUDE.md` | Project instructions that Claude Code reads automatically. Do not delete it. |
| `.node-version` | Tells Render which Node.js version to run. |
| `package.json` / `package-lock.json` | Project name, scripts, and the Node.js version. No dependencies. |
| `server.js` | The starter server. You grow it in Lab 11. |
| `public/index.html` | The home page, with links to all six lessons. |
| `public/404.html` | The page the server sends when a file is not found. |
| `public/lessons/_lesson-template.html` | The layout every lesson page copies. |
| `public/styles.css` | Finished styles for the whole site. |
| `public/js/try-it.js` | Browser code that runs the "Try it live" demo buttons. |

## Get started

1. On GitHub, click **Use this template** and create your own repository.
2. Clone your new repository, then in VS Code choose **File > Open Folder**
   and open the repository's own folder. Cloning always creates a new folder
   named after your repository, so open that one, not the folder you cloned
   into.
3. Open a terminal (**Terminal > New Terminal**) and check that you are in the
   right place. This should list `package.json` and `server.js` (on a Mac, use
   `ls`):

   ```
   dir
   ```

   If it doesn't, run `cd` followed by your repository's name.

4. Check your Node.js version (24 or higher):

   ```
   node -v
   ```

5. Check the install. There is nothing to download, but this confirms the
   lockfile is valid, the same way Render will:

   ```
   npm ci
   ```

6. Start the server and open http://localhost:3000:

   ```
   npm run dev
   ```

   `npm run dev` restarts the server every time you save a file. Press
   `Ctrl + C` in the terminal to stop it.

## Deploy to Render

Create a new **Web Service** on Render (not a Static Site) connected to your
repository, with:

| Setting | Value |
|---|---|
| Language | Node |
| Build command | `npm ci` |
| Start command | `npm start` |
| Instance type | Free |

Every push to your main branch redeploys the site automatically.

**Two things to know about free Render web services:**
- After 15 minutes with no visitors the service goes to sleep. The next visit
  takes about a minute to wake it up. That is normal, not a broken site.
- Anything the server keeps in memory or writes to its own disk is lost
  whenever it sleeps, restarts, or redeploys. You will see this on the
  Server status lesson.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Runs the server locally and restarts it when you save |
| `npm start` | Runs the server once, the way Render does |
| `npm ci` | Installs exactly what package-lock.json lists (nothing yet) |
