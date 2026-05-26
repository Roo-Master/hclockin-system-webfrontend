import crypto from "crypto";

export const verifyOtp = (
  inputOtp: string,
  storedHashedOtp: string
): boolean => {
  const hashedInput = crypto
    .createHash("sha256")
    .update(inputOtp)
    .digest("hex");

  return hashedInput === storedHashedOtp;
};