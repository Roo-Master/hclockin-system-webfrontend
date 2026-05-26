import { Request, Response } from "express";
import { prisma } from "@chronos/database";

import { sendEmail } from "../utils/email/sendEmail";

import { forgotPasswordTemplate } from "../templates/forgotPassword";

import { generateOtp } from "../utils/otp/generateOtp";
import { hashOtp } from "../utils/otp/hashOtp";

export const forgotPassword = async (
  req: Request,
  res: Response
) => {
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

    // Prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If email exists, OTP sent",
      });
    }

    // Generate OTP from utils
    const otp = generateOtp();

    // Hash OTP before saving
    const hashedOtp = hashOtp(otp);

    // OTP expiry (10 minutes)
    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Save hashed OTP in DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: hashedOtp,
        otpExpires,
      },
    });

    // Generate email HTML
    const html = forgotPasswordTemplate({
      name: user.firstName,
      otp,
    });

    // Send OTP email
    await sendEmail(
      user.email,
      "Password Reset OTP",
      html
    );

    return res.status(200).json({
      success: true,
      message: "If email exists, OTP sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process request",
    });
  }
};