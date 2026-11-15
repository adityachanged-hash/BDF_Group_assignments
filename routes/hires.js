const express = require("express");
const router = express.Router();
const db = require("../database");

// ─── GET ALL HIRES (Join: actor name + costume name) ────────────────────────
router.get("/", (req, res) => {
  try {
    const hires = db
      .prepare(
        `SELECT h.id,
                a.name  AS actor_name,
                c.name  AS costume_name,
                c.era,
                h.hire_date,
                h.return_date,
                h.created_at
         FROM hires h
         JOIN actors   a ON a.id = h.actor_id
         JOIN costumes c ON c.id = h.costume_id
         ORDER BY h.id`
      )
      .all();
    res.status(200).json(hires);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve hires", details: err.message });
  }
});

// ─── GET ONE HIRE ────────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  try {
    const hire = db
      .prepare(
        `SELECT h.id,
                a.name  AS actor_name,
                c.name  AS costume_name,
                c.era,
                h.hire_date,
                h.return_date,
                h.created_at
         FROM hires h
         JOIN actors   a ON a.id = h.actor_id
         JOIN costumes c ON c.id = h.costume_id
         WHERE h.id = ?`
      )
      .get(req.params.id);

    if (!hire) return res.status(404).json({ error: "Hire not found" });
    res.status(200).json(hire);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve hire", details: err.message });
  }
});

// ─── POST CREATE HIRE ────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  const { actor_id, costume_id, hire_date, return_date } = req.body;

  const errors = [];
  if (!actor_id || isNaN(Number(actor_id)))
    errors.push("'actor_id' is required and must be a valid number");
  if (!costume_id || isNaN(Number(costume_id)))
    errors.push("'costume_id' is required and must be a valid number");
  if (hire_date && !/^\d{4}-\d{2}-\d{2}$/.test(hire_date))
    errors.push("'hire_date' must be in YYYY-MM-DD format");
  if (return_date && !/^\d{4}-\d{2}-\d{2}$/.test(return_date))
    errors.push("'return_date' must be in YYYY-MM-DD format");

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  // Verify actor and costume exist
  const actor = db.prepare("SELECT id FROM actors WHERE id = ?").get(actor_id);
  if (!actor) return res.status(404).json({ error: `Actor with id ${actor_id} not found` });

  const costume = db.prepare("SELECT id FROM costumes WHERE id = ?").get(costume_id);
  if (!costume) return res.status(404).json({ error: `Costume with id ${costume_id} not found` });

  try {
    const result = db
      .prepare(
        `INSERT INTO hires (actor_id, costume_id, hire_date, return_date)
         VALUES (?, ?, ?, ?)`
      )
      .run(
        Number(actor_id),
        Number(costume_id),
        hire_date || new Date().toISOString().split("T")[0],
        return_date || null
      );

    const newHire = db
      .prepare(
        `SELECT h.id,
                a.name  AS actor_name,
                c.name  AS costume_name,
                c.era,
                h.hire_date,
                h.return_date,
                h.created_at
         FROM hires h
         JOIN actors   a ON a.id = h.actor_id
         JOIN costumes c ON c.id = h.costume_id
         WHERE h.id = ?`
      )
      .get(result.lastInsertRowid);

    res.status(201).json(newHire);
  } catch (err) {
    res.status(500).json({ error: "Failed to create hire", details: err.message });
  }
});

// ─── PUT UPDATE HIRE ─────────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
  const { actor_id, costume_id, hire_date, return_date } = req.body;

  const errors = [];
  if (!actor_id || isNaN(Number(actor_id)))
    errors.push("'actor_id' is required and must be a valid number");
  if (!costume_id || isNaN(Number(costume_id)))
    errors.push("'costume_id' is required and must be a valid number");
  if (hire_date && !/^\d{4}-\d{2}-\d{2}$/.test(hire_date))
    errors.push("'hire_date' must be in YYYY-MM-DD format");
  if (return_date && !/^\d{4}-\d{2}-\d{2}$/.test(return_date))
    errors.push("'return_date' must be in YYYY-MM-DD format");

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  try {
    const existing = db.prepare("SELECT * FROM hires WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Hire not found" });

    const actor = db.prepare("SELECT id FROM actors WHERE id = ?").get(actor_id);
    if (!actor) return res.status(404).json({ error: `Actor with id ${actor_id} not found` });

    const costume = db.prepare("SELECT id FROM costumes WHERE id = ?").get(costume_id);
    if (!costume) return res.status(404).json({ error: `Costume with id ${costume_id} not found` });

    db.prepare(
      `UPDATE hires SET actor_id = ?, costume_id = ?, hire_date = ?, return_date = ? WHERE id = ?`
    ).run(
      Number(actor_id),
      Number(costume_id),
      hire_date || existing.hire_date,
      return_date !== undefined ? return_date : existing.return_date,
      req.params.id
    );

    const updated = db
      .prepare(
        `SELECT h.id,
                a.name  AS actor_name,
                c.name  AS costume_name,
                c.era,
                h.hire_date,
                h.return_date,
                h.created_at
         FROM hires h
         JOIN actors   a ON a.id = h.actor_id
         JOIN costumes c ON c.id = h.costume_id
         WHERE h.id = ?`
      )
      .get(req.params.id);

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update hire", details: err.message });
  }
});

// ─── DELETE HIRE ─────────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM hires WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Hire not found" });

    db.prepare("DELETE FROM hires WHERE id = ?").run(req.params.id);
    res.status(200).json({ message: `Hire record #${req.params.id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete hire", details: err.message });
  }
});

module.exports = router;
