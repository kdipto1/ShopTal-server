import Stripe from "stripe";
import config from "../../../config";

if (!config.stripe.secret_key) {
  throw new Error("Stripe secret key not found");
}

export const stripe = new Stripe(config.stripe.secret_key, {
  // apiVersion: '2025-06-30.basil',
});
