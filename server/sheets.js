import { google } from 'googleapis';

function getAuth() {
  const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

const GOLD_BG = { red: 0.8, green: 0.6, blue: 0.0 };
const WHITE_TEXT = { red: 1, green: 1, blue: 1 };

async function formatHeaderRow(sheets, spreadsheetId, sheetId) {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: GOLD_BG,
                textFormat: { foregroundColor: WHITE_TEXT, bold: true },
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
          },
        },
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    },
  });
}

// ── Restore DB from Sheets on startup ──
// Reads "All Relators" and "Onboarding" tabs back into SQLite so data
// survives Render free-tier restarts (ephemeral disk).
export async function restoreFromSheets(db) {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
      !process.env.GOOGLE_SHEETS_RELATORS_ID) return;
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_RELATORS_ID;

    // ── Restore users from "All Relators" sheet ──
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'All Relators!A2:N',
      });
      const rows = res.data.values ?? [];
      // Columns: User ID(0) Name(1) Email(2) Phone(3) Brokerage(4) Plan(5)
      //          State(6) PrimaryArea(7) SecondaryArea(8) LeadType(9)
      //          Radius/primarySMR(10) SignupDate(11) CreatedAt(12) UpdatedAt(13)
      const insert = db.prepare(`
        INSERT OR IGNORE INTO users
          (id, name, email, phone, brokerage, planId, state,
           primaryArea, secondaryArea, leadType, primarySMR,
           signupDate, createdAt, password)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'')
      `);
      let count = 0;
      for (const r of rows) {
        const id = (r[0] || '').trim();
        if (!id) continue;
        insert.run(
          id,
          r[1] || '', r[2] || '', r[3] || '', r[4] || '',
          r[5] || '', r[6] || '', r[7] || '', r[8] || '',
          r[9] || '', r[10] || '', r[11] || '', r[12] || ''
        );
        count++;
      }
      console.log(`[Restore] Loaded ${count} users from All Relators sheet.`);
    } catch (e) {
      console.error('[Restore] users error:', e.message);
    }

    // ── Restore onboarding sessions from "Onboarding" sheet ──
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Onboarding!A2:M',
      });
      const rows = res.data.values ?? [];
      // Columns: SessionID(0) Name(1) Email(2) Phone(3) State(4)
      //          PrimaryAreas(5) SecondaryAreas(6) Radius(7) LeadType(8)
      //          Plan(9) Note(10) Status(11) SubmittedAt(12)
      const insert = db.prepare(`
        INSERT OR IGNORE INTO onboarding_sessions
          (id, step, plan, territory, contact,
           startedAt, lastActivityAt, submittedAt, status)
        VALUES (?, 1, ?, '{}', ?, ?, ?, ?, ?)
      `);
      let count = 0;
      for (const r of rows) {
        const id = (r[0] || '').trim();
        if (!id) continue;
        const planObj = r[9] ? { name: r[9] } : {};
        const contactObj = {
          name: r[1] || '',
          email: r[2] || '',
          phone: r[3] || '',
          state: r[4] || '',
          primaryAreas: r[5] || '',
          secondaryAreas: r[6] || '',
          radius: r[7] || '',
          leadType: r[8] || '',
          note: r[10] || '',
        };
        const submittedAt = r[12] || '';
        const status = r[11] || 'in_progress';
        insert.run(
          id,
          JSON.stringify(planObj),
          JSON.stringify(contactObj),
          submittedAt || new Date().toISOString(),
          submittedAt || new Date().toISOString(),
          submittedAt,
          status
        );
        count++;
      }
      console.log(`[Restore] Loaded ${count} onboarding sessions from Onboarding sheet.`);
    } catch (e) {
      console.error('[Restore] onboarding error:', e.message);
    }

    // ── Restore payments from Payments sheet ──
    if (process.env.GOOGLE_SHEETS_PAYMENTS_ID) {
      try {
        const pRes = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_PAYMENTS_ID,
          range: 'Payments!A2:H',
        });
        const rows = pRes.data.values ?? [];
        // Columns: PaymentID(0) CustomerEmail(1) Plan(2) Amount(3)
        //          Currency(4) Status(5) StripeSessionID(6) Date(7)
        const insert = db.prepare(`
          INSERT OR IGNORE INTO payments
            (id, amountTotal, currency, customerEmail, planId, stripeSessionId, paidAt)
          VALUES (?,?,?,?,?,?,?)
        `);
        let count = 0;
        for (const r of rows) {
          const id = (r[0] || '').trim();
          if (!id) continue;
          const amountCents = Math.round(parseFloat(r[3] || '0') * 100);
          insert.run(
            id, amountCents, (r[4] || 'usd').toLowerCase(),
            r[1] || '', r[2] || '', r[6] || '', r[7] || ''
          );
          count++;
        }
        console.log(`[Restore] Loaded ${count} payments from Payments sheet.`);
      } catch (e) {
        console.error('[Restore] payments error:', e.message);
      }
    }
  } catch (err) {
    console.error('[Restore] top-level error:', err.message);
  }
}

// ── Payments Sheet ──
const PAYMENT_HEADERS = [
  'Payment ID', 'Customer Email', 'Plan', 'Amount (USD)',
  'Currency', 'Status', 'Stripe Session ID', 'Date',
];

export async function appendPayment(payment) {
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_PAYMENTS_ID;

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId, range: 'Payments!A1:Z1',
    });
    if (!res.data.values || res.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId, range: 'Payments!A1',
        valueInputOption: 'RAW',
        requestBody: { values: [PAYMENT_HEADERS] },
      });
      const meta = await sheets.spreadsheets.get({ spreadsheetId });
      const sheetId = meta.data.sheets.find(s => s.properties.title === 'Payments')?.properties.sheetId ?? 0;
      await formatHeaderRow(sheets, spreadsheetId, sheetId);
    }

    const amountDollars = payment.amountTotal ? (payment.amountTotal / 100).toFixed(2) : '0.00';
    const status = payment.status || (payment.amountTotal > 0 ? 'approved' : 'pending');
    const row = [
      payment.id ?? '', payment.customerEmail ?? '', payment.planId ?? '',
      amountDollars, (payment.currency ?? 'usd').toUpperCase(), status,
      payment.stripeSessionId ?? '', payment.paidAt ?? new Date().toISOString(),
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: 'Payments!A1',
      valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });
  } catch (err) {
    console.error('[Sheets] appendPayment error:', err.message);
  }
}

// ── Onboarding Sheet ──
const ONBOARDING_HEADERS = [
  'Session ID', 'Name', 'Email', 'Phone', 'State',
  'Primary Areas', 'Secondary Areas', 'Radius (mi)', 'Lead Type',
  'Plan', 'Note', 'Status', 'Submitted At',
];

async function findRowBySessionId(sheets, spreadsheetId, sheetName, sessionId) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId, range: `${sheetName}!A:A`,
  });
  const rows = res.data.values ?? [];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(sessionId)) return i + 1;
  }
  return null;
}

export async function upsertOnboarding(session) {
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_RELATORS_ID;
    const sheetName = 'Onboarding';

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    let onboardingSheet = meta.data.sheets.find(s => s.properties.title === sheetName);
    if (!onboardingSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
      });
      const meta2 = await sheets.spreadsheets.get({ spreadsheetId });
      onboardingSheet = meta2.data.sheets.find(s => s.properties.title === sheetName);
    }
    const sheetId = onboardingSheet?.properties.sheetId ?? 0;

    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId, range: `${sheetName}!A1:Z1`,
    });
    if (!headerRes.data.values || headerRes.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId, range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [ONBOARDING_HEADERS] },
      });
      await formatHeaderRow(sheets, spreadsheetId, sheetId);
    }

    const contact = session.contact || {};
    const plan = session.plan || {};
    const row = [
      session.id ?? '', contact.name ?? '', contact.email ?? '',
      contact.phone ?? '', contact.state ?? '', contact.primaryAreas ?? '',
      contact.secondaryAreas ?? '', contact.radius ?? '', contact.leadType ?? '',
      plan.name ?? plan.id ?? '', contact.note ?? '', session.status ?? '',
      session.submittedAt ?? session.lastActivityAt ?? new Date().toISOString(),
    ];

    const existingRow = await findRowBySessionId(sheets, spreadsheetId, sheetName, session.id);
    if (existingRow) {
      await sheets.spreadsheets.values.update({
        spreadsheetId, range: `${sheetName}!A${existingRow}`,
        valueInputOption: 'RAW', requestBody: { values: [row] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId, range: `${sheetName}!A1`,
        valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [row] },
      });
    }
  } catch (err) {
    console.error('[Sheets] upsertOnboarding error:', err.message);
  }
}

// ── All Relators Sheet ──
const RELATOR_HEADERS = [
  'User ID', 'Name', 'Email', 'Phone', 'Brokerage', 'Plan', 'State',
  'Primary Area', 'Secondary Area', 'Lead Type', 'Radius',
  'Sign-up Date', 'Created At', 'Updated At',
];

async function findRelatorRow(sheets, spreadsheetId, userId) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId, range: 'All Relators!A:A',
  });
  const rows = res.data.values ?? [];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(userId)) return i + 1;
  }
  return null;
}

export async function upsertRelator(user) {
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_RELATORS_ID;

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId, range: 'All Relators!A1:Z1',
    });
    if (!res.data.values || res.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId, range: 'All Relators!A1',
        valueInputOption: 'RAW',
        requestBody: { values: [RELATOR_HEADERS] },
      });
      const meta = await sheets.spreadsheets.get({ spreadsheetId });
      const sheetId = meta.data.sheets.find(s => s.properties.title === 'All Relators')?.properties.sheetId ?? 0;
      await formatHeaderRow(sheets, spreadsheetId, sheetId);
    }

    const row = [
      user.id ?? '', user.name ?? '', user.email ?? '', user.phone ?? '',
      user.brokerage ?? '', user.planId ?? '', user.state ?? '',
      user.primaryArea ?? '', user.secondaryArea ?? '', user.leadType ?? '',
      user.primarySMR ?? '', user.signupDate ?? '', user.createdAt ?? '',
      new Date().toISOString(),
    ];

    const existingRow = await findRelatorRow(sheets, spreadsheetId, user.id);
    if (existingRow) {
      await sheets.spreadsheets.values.update({
        spreadsheetId, range: `All Relators!A${existingRow}`,
        valueInputOption: 'RAW', requestBody: { values: [row] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId, range: 'All Relators!A1',
        valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [row] },
      });
    }
  } catch (err) {
    console.error('[Sheets] upsertRelator error:', err.message);
  }
}

export async function removeRelator(userId) {
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_RELATORS_ID;

    const rowNum = await findRelatorRow(sheets, spreadsheetId, userId);
    if (!rowNum) return;

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetId = meta.data.sheets.find(s => s.properties.title === 'All Relators')?.properties.sheetId ?? 0;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: rowNum - 1, endIndex: rowNum },
          },
        }],
      },
    });
  } catch (err) {
    console.error('[Sheets] removeRelator error:', err.message);
  }
}
