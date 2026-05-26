import { z } from "zod";

export const resetPasswordValidation = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email is required")
      .email("Invalid email format"),

    otp: z
      .string()
      .min(1, "OTP is required")
      .length(6, "OTP must be 6 digits"),

    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(6, "Password must be at least 6 characters"),
  }),
});