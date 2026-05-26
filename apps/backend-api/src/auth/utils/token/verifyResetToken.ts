import crypto from "crypto";

export const verifyResetToken = (
  rawToken: string,
  hashedToken: string
): boolean => {
  const hash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return hash === hashedToken;
};