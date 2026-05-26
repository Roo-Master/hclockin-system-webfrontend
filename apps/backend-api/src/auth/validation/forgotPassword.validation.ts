import { z } from "zod";

export const forgotPasswordValidation = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email is required")
      .email("Invalid email format"),
  }),
});