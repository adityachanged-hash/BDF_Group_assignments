const express = require("express");
const router = express.Router();
const db = require("../database");

// GET all actors
router.get("/", (req, res) => {
  try {
    const actors = db.prepare("SELECT * FROM actors ORDER BY name").all();
    res.status(200).json(actors);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve actors", details: err.message });
  }
});

// GET one actor
router.get("/:id", (req, res) => {
  try {
    const actor = db.prepare("SELECT * FROM actors WHERE id = ?").get(req.params.id);
    if (!actor) return res.status(404).json({ error: "Actor not found" });
    res.status(200).json(actor);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve actor", details: err.message });
  }
});

// POST add actor
router.post("/", (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Validation failed: 'name' is required and must be a non-empty string" });
  }

  try {
    const result = db.prepare("INSERT INTO actors (name) VALUES (?)").run(name.trim());
    const newActor = db.prepare("SELECT * FROM actors WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(newActor);
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: `Actor with name '${name.trim()}' already exists` });
    }
    res.status(500).json({ error: "Failed to create actor", details: err.message });
  }
});

// PUT update actor
router.put("/:id", (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Validation failed: 'name' is required and must be a non-empty string" });
  }

  try {
    const existing = db.prepare("SELECT * FROM actors WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Actor not found" });

    db.prepare("UPDATE actors SET name = ? WHERE id = ?").run(name.trim(), req.params.id);
    const updated = db.prepare("SELECT * FROM actors WHERE id = ?").get(req.params.id);
    res.status(200).json(updated);
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: `Actor with name '${name.trim()}' already exists` });
    }
    res.status(500).json({ error: "Failed to update actor", details: err.message });
  }
});

// DELETE actor
router.delete("/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM actors WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Actor not found" });

    db.prepare("DELETE FROM actors WHERE id = ?").run(req.params.id);
    res.status(200).json({ message: `Actor '${existing.name}' deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete actor", details: err.message });
  }
});

module.exports = router;
