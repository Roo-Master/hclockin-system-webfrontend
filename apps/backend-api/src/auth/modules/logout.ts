import { Request, Response } from "express";
import { clearAuthCookies } from "../utils/cookie/clearAuthCookies";

export const logout = async (req: Request, res: Response) => {
  try {
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};