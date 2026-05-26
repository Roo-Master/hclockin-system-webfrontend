import { Response } from "express";
import { setAuthCookies } from "./cookie/setAuthCookies";

export const sendAuthResponse = (
  res: Response,
  user: any,
  accessToken: string,
  refreshToken: string
) => {
  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    user,
    accessToken,
  });
};