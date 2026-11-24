const path = require("path");
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const { DatabaseSync } = require("node:sqlite");

const app = express();
const port = Number(process.env.PORT || 3000);
const db = new DatabaseSync(path.join(__dirname, "4play.sqlite"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS preferences (
    user_id INTEGER PRIMARY KEY,
    games TEXT NOT NULL DEFAULT '[]',
    teams TEXT NOT NULL DEFAULT '[]',
    saved TEXT NOT NULL DEFAULT '[]',
    lead TEXT NOT NULL DEFAULT '15',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

app.use(express.json({ limit: "16kb" }));

function parseArray(value) {
  try {
    const result = JSON.parse(value);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email };
}

function getToken(req) {
  const header = req.get("authorization");
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

function auth(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Faça login para continuar." });

  const session = db.prepare("SELECT user_id FROM sessions WHERE token = ?").get(token);
  if (!session) return res.status(401).json({ error: "Sessão inválida ou expirada." });

  req.user = db.prepare("SELECT id, name, email FROM users WHERE id = ?").get(session.user_id);
  if (!req.user) return res.status(401).json({ error: "Usuário não encontrado." });
  req.token = token;
  next();
}

function preferencesFor(userId) {
  const row = db.prepare(
    "SELECT games, teams, saved, lead FROM preferences WHERE user_id = ?"
  ).get(userId);

  return row
    ? { games: parseArray(row.games), teams: parseArray(row.teams), saved: parseArray(row.saved), lead: row.lead }
    : { games: [], teams: [], saved: [], lead: "15" };
}

app.post("/api/auth/register", (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (name.length < 2) return res.status(400).json({ error: "Informe seu nome." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "E-mail inválido." });
  if (password.length < 6) return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
    return res.status(409).json({ error: "Este e-mail já está cadastrado." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const inserted = db.prepare(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
  ).run(name, email, passwordHash);

  db.prepare(
    "INSERT INTO preferences (user_id, games, teams, saved, lead) VALUES (?, '[]', '[]', '[]', '15')"
  ).run(inserted.lastInsertRowid);

  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, inserted.lastInsertRowid);

  const user = db.prepare("SELECT id, name, email FROM users WHERE id = ?").get(inserted.lastInsertRowid);
  res.status(201).json({ token, user: publicUser(user), preferences: preferencesFor(user.id) });
});

app.post("/api/auth/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = db.prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?").get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "E-mail ou senha incorretos." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, user.id);
  res.json({ token, user: publicUser(user), preferences: preferencesFor(user.id) });
});

app.post("/api/auth/logout", auth, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(req.token);
  res.json({ ok: true });
});

app.get("/api/me", auth, (req, res) => {
  res.json({ user: publicUser(req.user), preferences: preferencesFor(req.user.id) });
});

app.put("/api/preferences", auth, (req, res) => {
  const b = req.body;
  const games = Array.isArray(b.games) ? b.games : [];
  const teams = Array.isArray(b.teams) ? b.teams : [];
  const saved = Array.isArray(b.saved) ? b.saved : [];
  const lead = ["15", "30", "60"].includes(String(b.lead)) ? String(b.lead) : "15";

  db.prepare(`
    INSERT INTO preferences (user_id, games, teams, saved, lead)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      games = excluded.games,
      teams = excluded.teams,
      saved = excluded.saved,
      lead = excluded.lead
  `).run(req.user.id, JSON.stringify(games), JSON.stringify(teams), JSON.stringify(saved), lead);

  res.json({ preferences: preferencesFor(req.user.id) });
});

app.use(express.static(path.join(__dirname, "4play")));

app.listen(port, () => {
  console.log(`4PLAY disponível em http://localhost:${port}`);
});
