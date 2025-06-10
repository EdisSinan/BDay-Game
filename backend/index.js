import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./game.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS scenes (
    id TEXT PRIMARY KEY,
    text TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS choices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id TEXT,
    text TEXT,
    next_scene TEXT,
    action TEXT
  )`);
});

app.get("/api/scenes", (req, res) => {
  db.all("SELECT * FROM scenes", (err, scenes) => {
    if (err) return res.status(500).send("Greška pri preuzimanju scena");
    res.json(scenes);
  });
});

app.get("/api/scene/:id", (req, res) => {
  const sceneId = req.params.id;
  db.get("SELECT * FROM scenes WHERE id = ?", [sceneId], (err, scene) => {
    if (err || !scene) return res.status(404).send("Scene not found");
    db.all("SELECT * FROM choices WHERE scene_id = ?", [sceneId], (err, choices) => {
      res.json({ scene, choices });
    });
  });
});

app.get("/api/choices/:scene_id", (req, res) => {
  const sceneId = req.params.scene_id;
  db.all("SELECT * FROM choices WHERE scene_id = ?", [sceneId], (err, choices) => {
    if (err) return res.status(500).send("Greška pri preuzimanju odgovora");
    if (!choices || choices.length === 0) return res.status(404).send("Nema odgovora za ovu scenu");
    res.json(choices);
  });
});

app.post("/api/scene", (req, res) => {
  const { id, text, choices } = req.body;

  db.run("INSERT INTO scenes (id, text) VALUES (?, ?)", [id, text], function (err) {
    if (err) return res.status(500).send("Greška pri unosu scene");

    const stmt = db.prepare("INSERT INTO choices (scene_id, text, next_scene, action) VALUES (?, ?, ?, ?)");

    for (const choice of choices) {
      stmt.run(id, choice.text, choice.next_scene, choice.action || null);
    }

    stmt.finalize();
    res.send("Scena i izbori uspješno dodani");
  });
});

app.put("/api/scene/:id", (req, res) => {
  const sceneId = req.params.id;
  const { text, choices } = req.body;

  db.run("UPDATE scenes SET text = ? WHERE id = ?", [text, sceneId], function (err) {
    if (err) return res.status(500).send("Error updating scene");
    if (this.changes === 0) return res.status(404).send("Scene not found");

    db.run("DELETE FROM choices WHERE scene_id = ?", [sceneId], (err) => {
      if (err) return res.status(500).send("Error deleting old choices");

      const stmt = db.prepare("INSERT INTO choices (scene_id, text, next_scene, action) VALUES (?, ?, ?, ?)");

      for (const choice of choices) {
        stmt.run(sceneId, choice.text, choice.next_scene, choice.action || null);
      }

      stmt.finalize();
      res.send("Scene and choices updated successfully");
    });
  });
});

app.put("/api/choice/:id", (req, res) => {
  const choiceId = req.params.id;
  const { text } = req.body;

  db.run("UPDATE choices SET text = ? WHERE id = ?", [text, choiceId], function (err) {
    if (err) return res.status(500).send("Error updating choice");
    if (this.changes === 0) return res.status(404).send("Choice not found");
    res.send("Choice updated successfully");
  });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
