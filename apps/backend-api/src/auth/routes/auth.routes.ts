import { Router } from "express";

import { login } from "../modules/login";
import { logout } from "../modules/logout";
import { refreshToken } from "../modules/refreshToken";
import { me } from "../modules/me";
import { changePassword } from "../modules/changePassword";
import { deleteAccount } from "../modules/deleteAccount";
import { forgotPassword } from "../modules/forgotPassword";
import { resetPassword } from "../modules/resetPassword";
import { updateProfile } from "../modules/updateProfile";

import {
  authRateLimiter,
  strictAuthLimiter,
  passwordResetLimiter,
} from "../middleware/rateLimit";

const router = Router();

router.post("/login", strictAuthLimiter, login);
router.post("/logout", authRateLimiter, logout);
router.post("/refresh-token", authRateLimiter, refreshToken);
router.get("/me", authRateLimiter, me);
router.post("/change-password", authRateLimiter, changePassword);
router.delete("/delete-account", authRateLimiter, deleteAccount);
router.put("/update-profile", authRateLimiter, updateProfile);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);

export default router;