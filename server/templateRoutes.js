import { Router } from "express";

export default function createTemplateRoutes(db) {
  const router = Router();

  // List all templates
  router.get("/", (req, res) => {
    try {
      const templates = db.prepare("SELECT * FROM email_templates ORDER BY createdAt ASC").all();
      res.json(templates);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create template
  router.post("/", (req, res) => {
    try {
      const { name, subject, body } = req.body;
      const id = "tpl_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
      const now = new Date().toISOString();
      db.prepare(
        "INSERT INTO email_templates (id, name, subject, body, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(id, name || "", subject || "", body || "", now, now);
      res.json({ id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update template
  router.put("/:id", (req, res) => {
    try {
      const { name, subject, body } = req.body;
      const now = new Date().toISOString();
      db.prepare(
        "UPDATE email_templates SET name = ?, subject = ?, body = ?, updatedAt = ? WHERE id = ?"
      ).run(name || "", subject || "", body || "", now, req.params.id);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete template
  router.delete("/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM email_templates WHERE id = ?").run(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
