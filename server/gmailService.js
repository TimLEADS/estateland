import { google } from "googleapis";
import crypto from "crypto";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.labels",
];

// ── Token Encryption (AES-256-GCM) ──
const ALGO = "aes-256-gcm";

function getEncryptionKey() {
  const key = process.env.TOKEN_ENCRYPTION_KEY || "estateland-dev-key-change-in-production!!";
  return crypto.createHash("sha256").update(key).digest();
}

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, getEncryptionKey(), iv);
  let enc = cipher.update(text, "utf8", "hex");
  enc += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return { encrypted: enc, iv: iv.toString("hex"), authTag };
}

function decrypt(encrypted, ivHex, authTagHex) {
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGO, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  let dec = decipher.update(encrypted, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

// ── OAuth2 Client ──
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/api/gmail/callback"
  );
}

export function getAuthUrl() {
  return createOAuth2Client().generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export async function handleOAuthCallback(code, db) {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);

  client.setCredentials(tokens);
  const gmail = google.gmail({ version: "v1", auth: client });
  const profile = await gmail.users.getProfile({ userId: "me" });
  const email = profile.data.emailAddress;

  const { encrypted, iv, authTag } = encrypt(JSON.stringify(tokens));
  const now = new Date().toISOString();

  db.prepare(
    `INSERT OR REPLACE INTO gmail_tokens (id, encrypted_tokens, iv, auth_tag, email, createdAt) VALUES (?, ?, ?, ?, ?, ?)`
  ).run("default", encrypted, iv, authTag, email, now);

  return { email };
}

export function getGmailClient(db) {
  const row = db.prepare("SELECT * FROM gmail_tokens WHERE id = ?").get("default");
  if (!row || !row.encrypted_tokens) return null;

  let tokens;
  try {
    tokens = JSON.parse(decrypt(row.encrypted_tokens, row.iv, row.auth_tag));
  } catch {
    return null;
  }

  const client = createOAuth2Client();
  client.setCredentials(tokens);

  // Auto-refresh tokens and persist
  client.on("tokens", (newTokens) => {
    try {
      const merged = { ...tokens, ...newTokens };
      const { encrypted, iv, authTag } = encrypt(JSON.stringify(merged));
      db.prepare("UPDATE gmail_tokens SET encrypted_tokens = ?, iv = ?, auth_tag = ? WHERE id = ?").run(
        encrypted, iv, authTag, "default"
      );
    } catch (e) {
      console.error("[Gmail] Token refresh persist error:", e.message);
    }
  });

  return google.gmail({ version: "v1", auth: client });
}

export function getConnectionStatus(db) {
  const row = db.prepare("SELECT email FROM gmail_tokens WHERE id = ?").get("default");
  return row ? { connected: true, email: row.email } : { connected: false, email: null };
}

export function disconnect(db) {
  db.prepare("DELETE FROM gmail_tokens WHERE id = ?").run("default");
}

// ── Message Helpers ──
function getHeader(headers, name) {
  return (headers || []).find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

function parseEmailAddress(raw) {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].replace(/"/g, "").trim(), email: match[2].trim() };
  return { name: raw.trim(), email: raw.trim() };
}

function extractBody(payload) {
  if (!payload) return { html: "", text: "" };

  if (payload.mimeType === "text/html" && payload.body?.data) {
    return { html: Buffer.from(payload.body.data, "base64").toString("utf8"), text: "" };
  }
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return { html: "", text: Buffer.from(payload.body.data, "base64").toString("utf8") };
  }

  let html = "";
  let text = "";
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "multipart/alternative" || part.mimeType === "multipart/mixed" || part.mimeType === "multipart/related") {
        const nested = extractBody(part);
        if (nested.html) html = nested.html;
        if (nested.text && !text) text = nested.text;
      } else if (part.mimeType === "text/html" && part.body?.data) {
        html = Buffer.from(part.body.data, "base64").toString("utf8");
      } else if (part.mimeType === "text/plain" && part.body?.data && !text) {
        text = Buffer.from(part.body.data, "base64").toString("utf8");
      }
    }
  }
  return { html, text };
}

function extractAttachments(payload) {
  const attachments = [];
  function walk(parts) {
    if (!parts) return;
    for (const part of parts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size || 0,
          attachmentId: part.body.attachmentId,
        });
      }
      if (part.parts) walk(part.parts);
    }
  }
  walk(payload.parts);
  return attachments;
}

function parseMessage(msg) {
  const h = msg.payload?.headers || [];
  const body = extractBody(msg.payload);
  const fromRaw = getHeader(h, "From");
  const from = parseEmailAddress(fromRaw);

  return {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet || "",
    from,
    fromRaw: fromRaw,
    to: getHeader(h, "To"),
    cc: getHeader(h, "Cc"),
    subject: getHeader(h, "Subject"),
    date: getHeader(h, "Date"),
    messageId: getHeader(h, "Message-ID"),
    inReplyTo: getHeader(h, "In-Reply-To"),
    references: getHeader(h, "References"),
    labelIds: msg.labelIds || [],
    isUnread: (msg.labelIds || []).includes("UNREAD"),
    isStarred: (msg.labelIds || []).includes("STARRED"),
    bodyHtml: body.html,
    bodyText: body.text,
    attachments: extractAttachments(msg.payload),
  };
}

// ── Email Operations ──

export async function listMessages(db, { folder = "inbox", query = "", pageToken = "", maxResults = 30 } = {}) {
  const gmail = getGmailClient(db);
  if (!gmail) throw new Error("Gmail not connected");

  let q = query;
  let labelIds;
  if (!query) {
    if (folder === "inbox") { labelIds = ["INBOX"]; }
    else if (folder === "sent") { labelIds = ["SENT"]; }
    else if (folder === "starred") { q = "is:starred"; }
  }

  const params = { userId: "me", maxResults };
  if (labelIds) params.labelIds = labelIds;
  if (q) params.q = q;
  if (pageToken) params.pageToken = pageToken;

  const list = await gmail.users.messages.list(params);
  const messages = list.data.messages || [];

  // Fetch each message metadata
  const detailed = await Promise.all(
    messages.map(async (m) => {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: m.id,
        format: "metadata",
        metadataHeaders: ["From", "To", "Subject", "Date", "Cc"],
      });
      return {
        id: full.data.id,
        threadId: full.data.threadId,
        snippet: full.data.snippet || "",
        from: parseEmailAddress(getHeader(full.data.payload?.headers || [], "From")),
        to: getHeader(full.data.payload?.headers || [], "To"),
        subject: getHeader(full.data.payload?.headers || [], "Subject"),
        date: getHeader(full.data.payload?.headers || [], "Date"),
        labelIds: full.data.labelIds || [],
        isUnread: (full.data.labelIds || []).includes("UNREAD"),
        isStarred: (full.data.labelIds || []).includes("STARRED"),
      };
    })
  );

  return {
    messages: detailed,
    nextPageToken: list.data.nextPageToken || null,
    resultSizeEstimate: list.data.resultSizeEstimate || 0,
  };
}

export async function getMessage(db, messageId) {
  const gmail = getGmailClient(db);
  if (!gmail) throw new Error("Gmail not connected");

  const res = await gmail.users.messages.get({ userId: "me", id: messageId, format: "full" });
  return parseMessage(res.data);
}

export async function getThread(db, threadId) {
  const gmail = getGmailClient(db);
  if (!gmail) throw new Error("Gmail not connected");

  const res = await gmail.users.threads.get({ userId: "me", id: threadId, format: "full" });
  return (res.data.messages || []).map(parseMessage);
}

export async function sendEmail(db, { to, subject, body, attachments = [], inReplyTo = "", references = "" }) {
  const gmail = getGmailClient(db);
  if (!gmail) throw new Error("Gmail not connected");

  const status = getConnectionStatus(db);
  const from = status.email || "me";

  let raw;
  if (attachments.length > 0) {
    const boundary = "boundary_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    const parts = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
    ];
    if (inReplyTo) {
      parts.push(`In-Reply-To: ${inReplyTo}`);
      parts.push(`References: ${references || inReplyTo}`);
    }
    parts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`, "", `--${boundary}`);
    parts.push("Content-Type: text/html; charset=utf-8", "", body, "");

    for (const att of attachments) {
      parts.push(
        `--${boundary}`,
        `Content-Type: ${att.mimeType || "application/octet-stream"}`,
        `Content-Disposition: attachment; filename="${att.filename}"`,
        "Content-Transfer-Encoding: base64",
        "",
        att.data, // already base64
        ""
      );
    }
    parts.push(`--${boundary}--`);
    raw = Buffer.from(parts.join("\r\n")).toString("base64url");
  } else {
    const lines = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
    ];
    if (inReplyTo) {
      lines.push(`In-Reply-To: ${inReplyTo}`);
      lines.push(`References: ${references || inReplyTo}`);
    }
    lines.push("Content-Type: text/html; charset=utf-8", "", body);
    raw = Buffer.from(lines.join("\r\n")).toString("base64url");
  }

  const res = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
  return { id: res.data.id, threadId: res.data.threadId, labelIds: res.data.labelIds };
}

export async function toggleStar(db, messageId) {
  const gmail = getGmailClient(db);
  if (!gmail) throw new Error("Gmail not connected");

  const msg = await gmail.users.messages.get({ userId: "me", id: messageId, format: "minimal" });
  const isStarred = (msg.data.labelIds || []).includes("STARRED");

  if (isStarred) {
    await gmail.users.messages.modify({ userId: "me", id: messageId, requestBody: { removeLabelIds: ["STARRED"] } });
  } else {
    await gmail.users.messages.modify({ userId: "me", id: messageId, requestBody: { addLabelIds: ["STARRED"] } });
  }
  return { starred: !isStarred };
}

export async function markAsRead(db, messageId) {
  const gmail = getGmailClient(db);
  if (!gmail) throw new Error("Gmail not connected");
  await gmail.users.messages.modify({ userId: "me", id: messageId, requestBody: { removeLabelIds: ["UNREAD"] } });
}

export async function getAttachment(db, messageId, attachmentId) {
  const gmail = getGmailClient(db);
  if (!gmail) throw new Error("Gmail not connected");

  const res = await gmail.users.messages.attachments.get({ userId: "me", messageId, id: attachmentId });
  return res.data; // { size, data (base64) }
}

export async function getUnreadCount(db) {
  const gmail = getGmailClient(db);
  if (!gmail) return 0;
  try {
    const res = await gmail.users.messages.list({ userId: "me", labelIds: ["INBOX", "UNREAD"], maxResults: 1 });
    return res.data.resultSizeEstimate || 0;
  } catch {
    return 0;
  }
}

// ── Contact Auto-Creation ──
export function autoCreateContact(db, from) {
  if (!from?.email || from.email === "me") return;
  const existing = db.prepare("SELECT id FROM email_contacts WHERE email = ?").get(from.email);
  const now = new Date().toISOString();
  if (!existing) {
    const id = "ec_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    db.prepare(
      "INSERT INTO email_contacts (id, name, email, lastMessageDate, messageCount, createdAt) VALUES (?, ?, ?, ?, 1, ?)"
    ).run(id, from.name || from.email, from.email, now, now);
  } else {
    db.prepare("UPDATE email_contacts SET lastMessageDate = ?, messageCount = messageCount + 1, name = CASE WHEN name = email THEN ? ELSE name END WHERE email = ?").run(
      now, from.name || from.email, from.email
    );
  }
}
