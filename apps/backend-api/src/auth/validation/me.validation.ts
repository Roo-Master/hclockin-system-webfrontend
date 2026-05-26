import { z } from "zod";

export const meValidation = z.object({
  body: z.object({}).optional(),
});