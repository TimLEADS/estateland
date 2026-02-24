/**
 * One-time script to create Stripe coupons and promotion codes (1%–30% off).
 * Run: node create-coupons.js
 * Requires STRIPE_SECRET_KEY in .env
 */
import "dotenv/config";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2023-10-16" });

const PERCENT_OFFS = [1, 5, 10, 15, 20, 25, 30];

async function main() {
  for (const pct of PERCENT_OFFS) {
    const name = `Estate Land ${pct}% off`;
    const code = `SAVE${pct}`;
    try {
      const coupon = await stripe.coupons.create({
        percent_off: pct,
        duration: "once",
        name,
      });
      await stripe.promotionCodes.create({
        coupon: coupon.id,
        code,
      });
      console.log(`Created: ${code} (${pct}% off)`);
    } catch (e) {
      if (e.code === "resource_already_exists" || e.message?.includes("already exists")) {
        console.log(`Skip (exists): ${code}`);
      } else {
        console.error(code, e.message);
      }
    }
  }
  console.log("Done. Coupon codes: SAVE1, SAVE5, SAVE10, SAVE15, SAVE20, SAVE25, SAVE30");
}

main();
