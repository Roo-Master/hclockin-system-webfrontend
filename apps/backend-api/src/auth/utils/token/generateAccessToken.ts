import jwt from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt";

export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpires as jwt.SignOptions["expiresIn"],
  });
};