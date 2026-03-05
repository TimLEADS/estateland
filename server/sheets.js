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

const PAYMENT_HEADERS = [
  'Payment ID', 'User ID', 'Name', 'Email', 'Amount', 'Currency',
  'Status', 'Description', 'Stripe Session ID', 'Created At',
];

export async function appendPayment(payment) {
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_PAYMENTS_ID;

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

    const row = [
      payment.id ?? '',
      payment.user_id ?? '',
      payment.name ?? '',
      payment.email ?? '',
      payment.amount ?? '',
      payment.currency ?? 'usd',
      payment.status ?? '',
      payment.description ?? '',
      payment.stripe_session_id ?? '',
      payment.created_at ?? new Date().toISOString(),
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

const RELATOR_HEADERS = [
  'User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Created At', 'Updated At',
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
      user.role ?? '',
      user.status ?? '',
      user.created_at ?? '',
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
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowNum - 1,
                endIndex: rowNum,
              },
            },
          },
        ],
      },
    });
  } catch (err) {
    console.error('[Sheets] removeRelator error:', err.message);
  }
}
