import { Request, Response } from "express";
import { prisma } from "@chronos/database";

import { hashPassword } from "../utils/password/hashPassword";

import { verifyOtp } from "../utils/otp/verifyOtp";

export const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (
      !email ||
      !otp ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !user.otpCode ||
      !user.otpExpires
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP request",
      });
    }

    // Check OTP expiry
    if (new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // Verify OTP using utils
    const isValidOtp = verifyOtp(
      otp,
      user.otpCode
    );

    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Hash new password using utils
    const hashedPassword =
      await hashPassword(newPassword);

    // Update password + clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        otpCode: null,
        otpExpires: null,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to reset password",
    });
  }
};