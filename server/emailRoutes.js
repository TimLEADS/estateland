import { Router } from "express";
import {
  getAuthUrl,
  handleOAuthCallback,
  getConnectionStatus,
  disconnect,
  listMessages,
  getMessage,
  getThread,
  sendEmail,
  toggleStar,
  markAsRead,
  getAttachment,
  getUnreadCount,
  autoCreateContact,
} from "./gmailService.js";

export default function createEmailRoutes(db) {
  const router = Router();

  // ── Gmail OAuth ──

  router.get("/gmail/auth-url", (req, res) => {
    try {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(503).json({ error: "Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." });
      }
      const url = getAuthUrl();
      res.json({ url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/gmail/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) return res.status(400).send("Missing authorization code.");
      await handleOAuthCallback(code, db);
      // Redirect back to dashboard email center
      const origin = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(origin + "/dashboard/email?gmail=connected");
    } catch (err) {
      console.error("[Gmail] OAuth callback error:", err);
      const origin = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(origin + "/dashboard/email?gmail=error&msg=" + encodeURIComponent(err.message));
    }
  });

  router.get("/gmail/status", (req, res) => {
    try {
      const status = getConnectionStatus(db);
      res.json(status);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/gmail/disconnect", (req, res) => {
    try {
      disconnect(db);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Emails ──

  router.get("/emails/inbox", async (req, res) => {
    try {
      const { pageToken, maxResults } = req.query;
      const result = await listMessages(db, { folder: "inbox", pageToken, maxResults: Number(maxResults) || 30 });
      // Auto-create contacts for inbox senders
      for (const msg of result.messages) {
        try { autoCreateContact(db, msg.from); } catch (_) {}
      }
      res.json(result);
    } catch (err) {
      console.error("[Email] inbox error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/emails/sent", async (req, res) => {
    try {
      const { pageToken, maxResults } = req.query;
      const result = await listMessages(db, { folder: "sent", pageToken, maxResults: Number(maxResults) || 30 });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/emails/starred", async (req, res) => {
    try {
      const { pageToken, maxResults } = req.query;
      const result = await listMessages(db, { folder: "starred", pageToken, maxResults: Number(maxResults) || 30 });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/emails/search", async (req, res) => {
    try {
      const { q, pageToken, maxResults } = req.query;
      if (!q) return res.json({ messages: [], nextPageToken: null });
      const result = await listMessages(db, { query: q, pageToken, maxResults: Number(maxResults) || 30 });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/emails/unread-count", async (req, res) => {
    try {
      const count = await getUnreadCount(db);
      res.json({ count });
    } catch (err) {
      res.json({ count: 0 });
    }
  });

  router.get("/emails/:id", async (req, res) => {
    try {
      const msg = await getMessage(db, req.params.id);
      // Mark as read
      try { await markAsRead(db, req.params.id); } catch (_) {}
      // Auto-create contact
      try { autoCreateContact(db, msg.from); } catch (_) {}
      res.json(msg);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/emails/:id/thread", async (req, res) => {
    try {
      const msg = await getMessage(db, req.params.id);
      const thread = await getThread(db, msg.threadId);
      res.json(thread);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/emails/:messageId/attachments/:attachmentId", async (req, res) => {
    try {
      const data = await getAttachment(db, req.params.messageId, req.params.attachmentId);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/emails/send", async (req, res) => {
    try {
      const { to, subject, body, attachments, inReplyTo, references } = req.body;
      if (!to || !subject) return res.status(400).json({ error: "To and Subject are required." });
      const result = await sendEmail(db, { to, subject, body: body || "", attachments: attachments || [], inReplyTo, references });
      res.json(result);
    } catch (err) {
      console.error("[Email] send error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/emails/:id/star", async (req, res) => {
    try {
      const result = await toggleStar(db, req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Contacts ──

  router.get("/contacts", (req, res) => {
    try {
      const contacts = db.prepare("SELECT * FROM email_contacts ORDER BY lastMessageDate DESC").all();
      res.json(contacts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
