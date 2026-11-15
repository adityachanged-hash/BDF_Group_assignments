const express = require("express");
const router = express.Router();
const db = require("../database");

// ─── TOP 3 COSTUMES (Twist) ─────────────────────────────────────────────────
// MUST be declared before /:id so it doesn't get matched as an id route
router.get("/top", (req, res) => {
  try {
    const top = db
      .prepare(
        `SELECT c.id, c.name, c.era, COUNT(h.id) AS hire_count
         FROM costumes c
         JOIN hires h ON h.costume_id = c.id
         GROUP BY c.id
         ORDER BY hire_count DESC, c.name ASC
         LIMIT 3`
      )
      .all();
    res.status(200).json(top);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve top costumes", details: err.message });
  }
});

// ─── GET ALL (with optional ?era= search) ───────────────────────────────────
router.get("/", (req, res) => {
  try {
    const { era } = req.query;
    let costumes;
    if (era) {
      costumes = db
        .prepare("SELECT * FROM costumes WHERE LOWER(era) = LOWER(?) ORDER BY name")
        .all(era);
    } else {
      costumes = db.prepare("SELECT * FROM costumes ORDER BY name").all();
    }
    res.status(200).json(costumes);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve costumes", details: err.message });
  }
});

// ─── GET ONE ────────────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  try {
    const costume = db.prepare("SELECT * FROM costumes WHERE id = ?").get(req.params.id);
    if (!costume) return res.status(404).json({ error: "Costume not found" });
    res.status(200).json(costume);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve costume", details: err.message });
  }
});

// ─── POST ADD ───────────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  const { name, era } = req.body;

  const errors = [];
  if (!name || typeof name !== "string" || name.trim() === "")
    errors.push("'name' is required and must be a non-empty string");
  if (!era || typeof era !== "string" || era.trim() === "")
    errors.push("'era' is required and must be a non-empty string");

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  try {
    const result = db
      .prepare("INSERT INTO costumes (name, era) VALUES (?, ?)")
      .run(name.trim(), era.trim());
    const newCostume = db.prepare("SELECT * FROM costumes WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(newCostume);
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: `Costume with name '${name.trim()}' already exists` });
    }
    res.status(500).json({ error: "Failed to create costume", details: err.message });
  }
});

// ─── PUT UPDATE ─────────────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
  const { name, era } = req.body;

  const errors = [];
  if (!name || typeof name !== "string" || name.trim() === "")
    errors.push("'name' is required and must be a non-empty string");
  if (!era || typeof era !== "string" || era.trim() === "")
    errors.push("'era' is required and must be a non-empty string");

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  try {
    const existing = db.prepare("SELECT * FROM costumes WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Costume not found" });

    db.prepare("UPDATE costumes SET name = ?, era = ? WHERE id = ?").run(
      name.trim(),
      era.trim(),
      req.params.id
    );
    const updated = db.prepare("SELECT * FROM costumes WHERE id = ?").get(req.params.id);
    res.status(200).json(updated);
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: `Costume with name '${name.trim()}' already exists` });
    }
    res.status(500).json({ error: "Failed to update costume", details: err.message });
  }
});

// ─── DELETE ─────────────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM costumes WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Costume not found" });

    db.prepare("DELETE FROM costumes WHERE id = ?").run(req.params.id);
    res.status(200).json({ message: `Costume '${existing.name}' deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete costume", details: err.message });
  }
});

module.exports = router;
