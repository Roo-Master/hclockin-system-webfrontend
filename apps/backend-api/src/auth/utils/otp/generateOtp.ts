import crypto from "crypto";

export const generateOtp = (): string => {
  const otp = crypto.randomInt(100000, 1000000); // 6-digit range
  return otp.toString();
};