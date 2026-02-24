# Estate Land – Stripe server

- **Secret key** must be in `server/.env` as `STRIPE_SECRET_KEY`. Never commit `.env`.
- **With `npm run dev`** (frontend): the API server starts automatically on port 3001. No need to run it separately.
- To run the server only: `cd server && node index.js` (listens on port 3001).
- If you get 500 on payment: use a **test key** (`sk_test_...`) from [Stripe Dashboard](https://dashboard.stripe.com/apikeys) for local testing. Live keys (`sk_live_...`) require an activated Stripe account.

## Discount coupons (1–30% off)

Create them once:

```bash
cd server && node create-coupons.js
```

This creates promotion codes: **SAVE1**, **SAVE5**, **SAVE10**, **SAVE15**, **SAVE20**, **SAVE25**, **SAVE30** (1%, 5%, 10%, 15%, 20%, 25%, 30% off). Customers enter the code (e.g. `SAVE10`) on the payment step.
