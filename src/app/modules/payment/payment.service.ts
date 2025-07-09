import { ICreatePaymentIntent } from "./payment.interfaces";
import { stripe } from "./payment.utils";

const createPaymentIntent = async (payload: ICreatePaymentIntent) => {
  const { amount } = payload;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
};

export const PaymentService = {
  createPaymentIntent,
};
