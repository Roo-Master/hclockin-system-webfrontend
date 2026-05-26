import { Request, Response } from "express";
import { prisma } from "@chronos/database";

import { hashPassword } from "../utils/password/hashPassword";
import { verifyResetToken } from "../utils/token/verifyResetToken";

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, token and new password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request",
      });
    }

    // check expiry
    if (new Date() > user.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: "Reset token expired",
      });
    }

    // verify token (via utils)
    const isValid = verifyResetToken(token, user.passwordResetToken);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    // hash new password (via utils)
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};