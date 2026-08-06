import { z } from "zod";

const getDashboardAnalyticsZodSchema = z.object({
  query: z.object({
    range: z.enum(["7d", "30d", "90d"]).default("30d"),
  }),
});

export const AnalyticsValidation = {
  getDashboardAnalyticsZodSchema,
};
