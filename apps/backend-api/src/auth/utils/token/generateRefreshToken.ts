import jwt from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt";

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpires,
  });
};