import { z } from "zod";

export const refreshTokenValidation = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});