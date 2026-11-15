const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "costumecloset.db"));

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS costumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    era  TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hires (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id   INTEGER NOT NULL,
    costume_id INTEGER NOT NULL,
    hire_date  TEXT NOT NULL DEFAULT (date('now')),
    return_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id)   REFERENCES actors(id)   ON DELETE CASCADE,
    FOREIGN KEY (costume_id) REFERENCES costumes(id) ON DELETE CASCADE
  );
`);

module.exports = db;
