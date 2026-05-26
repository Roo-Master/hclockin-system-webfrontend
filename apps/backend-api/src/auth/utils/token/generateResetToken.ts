import crypto from "crypto";

export const generateResetToken = (): {
  rawToken: string;
  hashedToken: string;
} => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return {
    rawToken,
    hashedToken,
  };
};