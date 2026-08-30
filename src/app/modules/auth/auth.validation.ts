// Define  validations here
import { z } from "zod";

const refreshTokenZodSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
  cookies: z.object({
    refreshToken: z.string().optional(),
  }),
});

const forgotPasswordZodSchema = z.object({
  body: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
    .refine(data => data.email || data.phone, {
      message: "Either email or phone is required",
    }),
});

const resetPasswordZodSchema = z.object({
  body: z.object({
    token: z.string({ required_error: "Token is required" }),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const AuthValidation = {
  refreshTokenZodSchema,
  forgotPasswordZodSchema,
  resetPasswordZodSchema,
};
