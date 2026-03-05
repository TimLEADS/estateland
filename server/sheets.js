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

// ── Payments Sheet ──
// Columns: Payment ID | Customer Email | Plan | Amount | Currency | Status | Stripe Session ID | Date
const PAYMENT_HEADERS = [
    'Payment ID',
    'Customer Email',
    'Plan',
    'Amount (USD)',
    'Currency',
    'Status',
    'Stripe Session ID',
    'Date',
  ];

export async function appendPayment(payment) {
    try {
          const auth = await getAuth();
          const sheets = google.sheets({ version: 'v4', auth });
          const spreadsheetId = process.env.GOOGLE_SHEETS_PAYMENTS_ID;

      // Ensure header row exists
      const res = await sheets.spreadsheets.values.get({
              spreadsheetId,
              range: 'Payments!A1:Z1',
      });
          if (!res.data.values || res.data.values.length === 0) {
                  await sheets.spreadsheets.values.update({
                            spreadsheetId,
                            range: 'Payments!A1',
                            valueInputOption: 'RAW',
                            requestBody: { values: [PAYMENT_HEADERS] },
                  });
                  const meta = await sheets.spreadsheets.get({ spreadsheetId });
                  const sheetId = meta.data.sheets.find(s => s.properties.title === 'Payments')?.properties.sheetId ?? 0;
                  await formatHeaderRow(sheets, spreadsheetId, sheetId);
          }

      // Format amount as dollars
      const amountDollars = payment.amountTotal ? (payment.amountTotal / 100).toFixed(2) : '0.00';
          const status = payment.status || (payment.amountTotal > 0 ? 'approved' : 'pending');

      const row = [
              payment.id ?? '',
              payment.customerEmail ?? '',
              payment.planId ?? '',
              amountDollars,
              (payment.currency ?? 'usd').toUpperCase(),
              status,
              payment.stripeSessionId ?? '',
              payment.paidAt ?? new Date().toISOString(),
            ];

      await sheets.spreadsheets.values.append({
              spreadsheetId,
              range: 'Payments!A1',
              valueInputOption: 'RAW',
              insertDataOption: 'INSERT_ROWS',
              requestBody: { values: [row] },
      });
    } catch (err) {
          console.error('[Sheets] appendPayment error:', err.message);
    }
}

// ── Onboarding Sheet ──
// Written when someone submits the onboarding form (before or after payment)
const ONBOARDING_HEADERS = [
    'Session ID',
    'Name',
    'Email',
    'Phone',
    'State',
    'Primary Areas',
    'Secondary Areas',
    'Radius (mi)',
    'Lead Type',
    'Plan',
    'Note',
    'Status',
    'Submitted At',
  ];

async function findRowBySessionId(sheets, spreadsheetId, sheetName, sessionId) {
    const res = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A:A`,
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

      // Ensure Onboarding sheet exists with headers
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
              spreadsheetId,
              range: `${sheetName}!A1:Z1`,
      });
          if (!headerRes.data.values || headerRes.data.values.length === 0) {
                  await sheets.spreadsheets.values.update({
                            spreadsheetId,
                            range: `${sheetName}!A1`,
                            valueInputOption: 'RAW',
                            requestBody: { values: [ONBOARDING_HEADERS] },
                  });
                  await formatHeaderRow(sheets, spreadsheetId, sheetId);
          }

      const contact = session.contact || {};
          const plan = session.plan || {};
          const territory = session.territory || {};

      const row = [
              session.id ?? '',
              contact.name ?? '',
              contact.email ?? '',
              contact.phone ?? '',
              contact.state ?? '',
              contact.primaryAreas ?? '',
              contact.secondaryAreas ?? '',
              contact.radius ?? '',
              contact.leadType ?? '',
              plan.name ?? plan.id ?? '',
              contact.note ?? '',
              session.status ?? '',
              session.submittedAt ?? session.lastActivityAt ?? new Date().toISOString(),
            ];

      const existingRow = await findRowBySessionId(sheets, spreadsheetId, sheetName, session.id);
          if (existingRow) {
                  await sheets.spreadsheets.values.update({
                            spreadsheetId,
                            range: `${sheetName}!A${existingRow}`,
                            valueInputOption: 'RAW',
                            requestBody: { values: [row] },
                  });
          } else {
                  await sheets.spreadsheets.values.append({
                            spreadsheetId,
                            range: `${sheetName}!A1`,
                            valueInputOption: 'RAW',
                            insertDataOption: 'INSERT_ROWS',
                            requestBody: { values: [row] },
                  });
          }
    } catch (err) {
          console.error('[Sheets] upsertOnboarding error:', err.message);
    }
}

// ── All Relators Sheet ──
const RELATOR_HEADERS = [
    'User ID', 'Name', 'Email', 'Phone', 'Brokerage',
    'Plan', 'State', 'Primary Area', 'Secondary Area',
    'Lead Type', 'Radius', 'Sign-up Date', 'Created At', 'Updated At',
  ];

async function findRelatorRow(sheets, spreadsheetId, userId) {
    const res = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'All Relators!A:A',
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
              spreadsheetId,
              range: 'All Relators!A1:Z1',
      });
          if (!res.data.values || res.data.values.length === 0) {
                  await sheets.spreadsheets.values.update({
                            spreadsheetId,
                            range: 'All Relators!A1',
                            valueInputOption: 'RAW',
                            requestBody: { values: [RELATOR_HEADERS] },
                  });
                  const meta = await sheets.spreadsheets.get({ spreadsheetId });
                  const sheetId = meta.data.sheets.find(s => s.properties.title === 'All Relators')?.properties.sheetId ?? 0;
                  await formatHeaderRow(sheets, spreadsheetId, sheetId);
          }

      const row = [
              user.id ?? '',
              user.name ?? '',
              user.email ?? '',
              user.phone ?? '',
              user.brokerage ?? '',
              user.planId ?? '',
              user.state ?? '',
              user.primaryArea ?? '',
              user.secondaryArea ?? '',
              user.leadType ?? '',
              user.primarySMR ?? '',
              user.signupDate ?? '',
              user.createdAt ?? '',
              new Date().toISOString(),
            ];

      const existingRow = await findRelatorRow(sheets, spreadsheetId, user.id);
          if (existingRow) {
                  await sheets.spreadsheets.values.update({
                            spreadsheetId,
                            range: `All Relators!A${existingRow}`,
                            valueInputOption: 'RAW',
                            requestBody: { values: [row] },
                  });
          } else {
                  await sheets.spreadsheets.values.append({
                            spreadsheetId,
                            range: 'All Relators!A1',
                            valueInputOption: 'RAW',
                            insertDataOption: 'INSERT_ROWS',
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
                        requests: [
                          {
                                        deleteDimension: {
                                                        range: { sheetId, dimension: 'ROWS', startIndex: rowNum - 1, endIndex: rowNum },
                                        },
                          },
                                  ],
              },
      });
    } catch (err) {
          console.error('[Sheets] removeRelator error:', err.message);
    }
}
