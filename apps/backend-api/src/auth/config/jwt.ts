import jwt from "jsonwebtoken";

export const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET as string,
  refreshSecret: process.env.JWT_REFRESH_SECRET as string,

  accessExpires: (process.env.JWT_ACCESS_EXPIRES || "15m") as jwt.SignOptions["expiresIn"],
  refreshExpires: (process.env.JWT_REFRESH_EXPIRES || "7d") as jwt.SignOptions["expiresIn"],
};