import { Request, Response, NextFunction } from "express";

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  next();
};