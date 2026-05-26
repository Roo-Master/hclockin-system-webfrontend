import { z } from "zod";

export const updateProfileValidation = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .optional(),

    lastName: z
      .string()
      .min(1, "Last name is required")
      .optional(),

    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .optional(),

    departmentId: z
      .string()
      .min(1, "Department ID is required")
      .optional(),
  }),
});