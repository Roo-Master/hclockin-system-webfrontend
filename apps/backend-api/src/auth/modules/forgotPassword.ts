import { Request, Response } from "express";
import { prisma } from "@chronos/database";

import { sendEmail } from "../utils/email/sendEmail";
import { forgotPasswordTemplate } from "../templates/forgotPassword";
import { generateResetToken } from "../utils/token/generateResetToken";

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If email exists, reset link sent",
      });
    }

    // ONLY USE UTILS
    const { rawToken, hashedToken } = generateResetToken();

    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expires,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${email}`;

    const html = forgotPasswordTemplate({
      name: user.firstName,
      resetLink,
    });

    await sendEmail(user.email, "Password Reset Request", html);

    return res.status(200).json({
      success: true,
      message: "If email exists, reset link sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process request",
    });
  }
};