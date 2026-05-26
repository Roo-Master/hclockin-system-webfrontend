import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type Schema = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query) as any;
      }

      if (schema.params) {
        const parsedParams = schema.params.parse(req.params);
        (req as any).validatedParams = parsedParams;
      }

      next();
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.errors || [],
      });
    }
  };
};