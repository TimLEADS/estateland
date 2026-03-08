# Gmail API Setup Guide for EstateLand Email Center

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it `EstateLand Email` (or any name)
4. Click **Create**

## Step 2: Enable the Gmail API

1. In your new project, go to **APIs & Services** → **Library**
2. Search for **Gmail API**
3. Click **Gmail API** → **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (or Internal if using Google Workspace)
3. Fill in:
   - App name: `EstateLand`
   - User support email: `support@estateland.us`
   - Developer contact email: `support@estateland.us`
4. Click **Save and Continue**
5. On the **Scopes** page, click **Add or Remove Scopes** and add:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/gmail.labels`
6. Click **Save and Continue**
7. On **Test users**, add your Gmail: `support@estateland.us`
8. Click **Save and Continue** → **Back to Dashboard**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `EstateLand Dashboard`
5. **Authorized redirect URIs** — add:
   - For local development: `http://localhost:3001/api/gmail/callback`
   - For production: `https://your-domain.com/api/gmail/callback`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

## Step 5: Configure Environment Variables

Edit your `server/.env` file:

```env
# Gmail API
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/gmail/callback

# Token encryption (generate with: openssl rand -hex 32)
TOKEN_ENCRYPTION_KEY=your_random_secret_here

# Frontend URL (for OAuth redirect back to dashboard)
FRONTEND_URL=http://localhost:5173
```

## Step 6: Connect Gmail from Dashboard

1. Start your server: `cd server && npm start`
2. Start the frontend: `npm run dev`
3. Log into the dashboard at `http://localhost:5173/dashboard`
4. Click **Email Center** in the sidebar
5. Click **Connect Gmail Account**
6. Sign in with `support@estateland.us` on the Google consent screen
7. Grant the requested permissions
8. You will be redirected back to the dashboard with Gmail connected

## Production Deployment

For production (Render, Vercel, etc.):

1. Update `GOOGLE_REDIRECT_URI` to your production URL:
   ```
   GOOGLE_REDIRECT_URI=https://your-api-domain.com/api/gmail/callback
   ```
2. Update `FRONTEND_URL` to your production frontend URL:
   ```
   FRONTEND_URL=https://your-frontend-domain.com
   ```
3. Add the production redirect URI in Google Cloud Console → Credentials → your OAuth client → Authorized redirect URIs
4. Set a strong `TOKEN_ENCRYPTION_KEY` (generate with `openssl rand -hex 32`)
5. If your app is still in "Testing" mode in Google Cloud, you can publish it or keep adding test users

## Publishing the OAuth App

While in "Testing" mode, only users added as test users can connect. To allow anyone:

1. Go to **OAuth consent screen**
2. Click **Publish App**
3. If using sensitive scopes (Gmail), Google may require verification (can take days/weeks)
4. For internal use with just your own Gmail, "Testing" mode is fine — just add your email as a test user

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Google OAuth credentials not configured" | Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` |
| "redirect_uri_mismatch" | The redirect URI in `.env` must exactly match what's in Google Cloud Console |
| "access_denied" | Add your email as a test user in OAuth consent screen |
| Tokens expired / not refreshing | Disconnect and reconnect Gmail from the dashboard |
| "Gmail not connected" on API calls | The OAuth tokens may have been revoked — reconnect Gmail |

## Security Notes

- OAuth tokens are encrypted with AES-256-GCM before storage
- Gmail passwords are NEVER stored — only OAuth tokens
- Tokens auto-refresh when expired
- The `TOKEN_ENCRYPTION_KEY` should be kept secret and not committed to git
- All token operations happen server-side; the frontend never sees raw tokens
