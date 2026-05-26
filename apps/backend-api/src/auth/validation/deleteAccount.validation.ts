import { z } from "zod";

export const deleteAccountValidation = z.object({
  body: z.object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
  }),
});