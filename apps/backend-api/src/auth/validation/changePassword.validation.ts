import { z } from "zod";

export const changePasswordValidation = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .min(6, "Password must be at least 6 characters"),

    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(6, "Password must be at least 6 characters"),
  }),
});