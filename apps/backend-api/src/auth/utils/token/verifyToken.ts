import jwt from "jsonwebtoken";

export const verifyToken = (
  token: string,
  type: "access" | "refresh" = "access"
) => {
  const secret =
    type === "access"
      ? process.env.JWT_ACCESS_SECRET!
      : process.env.JWT_REFRESH_SECRET!;

  return jwt.verify(token, secret);
};