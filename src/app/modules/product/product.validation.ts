import { z } from 'zod';

const updateProductStockZodSchema = z.object({
  body: z.object({
    quantity: z.number({
      required_error: 'Quantity is required',
    }),
  }),
});

export const ProductValidation = {
  updateProductStockZodSchema,
};