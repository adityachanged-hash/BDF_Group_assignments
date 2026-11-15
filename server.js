const express = require("express");
const app = express();

const actorsRouter   = require("./routes/actors");
const costumesRouter = require("./routes/costumes");
const hiresRouter    = require("./routes/hires");

// Middleware
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "CostumeCloset Theatre API is running 🎭",
    endpoints: {
      actors:   "/actors",
      costumes: "/costumes",
      hires:    "/hires",
      top3:     "/costumes/top",
    },
  });
});

// Routes
app.use("/actors",   actorsRouter);
app.use("/costumes", costumesRouter);
app.use("/hires",    hiresRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.method} ${req.path}' not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎭 CostumeCloset Theatre server running on http://localhost:${PORT}`);
});

module.exports = app;
