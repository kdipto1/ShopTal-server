import { z } from "zod";

const createPaymentIntentZodSchema = z.object({
  body: z.object({
    orderId: z.string({ required_error: "orderId is required" }),
  }),
});

export const PaymentValidation = {
  createPaymentIntentZodSchema,
};
