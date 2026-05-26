import { Request, Response } from "express";
import { prisma } from "../../../config/prisma"; // adjust path if needed
import { comparePassword } from "../utils/comparePassword";
import { generateAccessToken } from "../utils/token/generateAccessToken";
import { generateRefreshToken } from "../utils/token/generateRefreshToken";
import { sendAuthResponse } from "../utils/sendAuthResponse";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    const isPasswordValid = await comparePassword(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const payload = {
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
    };

    return sendAuthResponse(res, safeUser, accessToken, refreshToken);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};