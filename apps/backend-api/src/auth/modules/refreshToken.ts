import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/token/generateAccessToken";

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as any;

    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      role: decoded.role,
      tenantId: decoded.tenantId,
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};