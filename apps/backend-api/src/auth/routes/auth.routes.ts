import { Router } from "express";

import { login } from "../modules/login";
import { logout } from "../modules/logout";
import { refreshToken } from "../modules/refreshToken";
import { me } from "../modules/me";

import { changePassword } from "../modules/changePassword";
import { deleteAccount } from "../modules/deleteAccount";
import { forgotPassword } from "../modules/forgotPassword";
import { resetPassword } from "../modules/resetPassword";
import { sendOtp } from "../modules/sendOtp";
import { verifyOtp } from "../modules/verifyOtp";
import { verifyEmail } from "../modules/verifyEmail";
import { updateProfile } from "../modules/updateProfile";

import { loginValidation } from "../validation/login.validation";
import { registerValidation } from "../validation/register.validation";
import { logoutValidation } from "../validation/logout.validation";
import { logoutAllValidation } from "../validation/logoutAll.validation";
import { refreshTokenValidation } from "../validation/refreshToken.validation";
import { meValidation } from "../validation/me.validation";

import { changePasswordValidation } from "../validation/changePassword.validation";
import { deleteAccountValidation } from "../validation/deleteAccount.validation";
import { forgotPasswordValidation } from "../validation/forgotPassword.validation";
import { resetPasswordValidation } from "../validation/resetPassword.validation";
import { sendOtpValidation } from "../validation/sendOtp.validation";
import { verifyOtpValidation } from "../validation/verifyOtp.validation";
import { verifyEmailValidation } from "../validation/verifyEmail.validation";
import { updateProfileValidation } from "../validation/updateProfile.validation";

import { validate } from "../middleware/validate";
import { authRateLimiter } from "../middleware/rateLimit";

const router = Router();

router.use(authRateLimiter);

router.post("/login", validate(loginValidation), login);
router.post("/logout", validate(logoutValidation), logout);
router.post("/refresh-token", validate(refreshTokenValidation), refreshToken);
router.get("/me", validate(meValidation), me);

router.post("/change-password", validate(changePasswordValidation), changePassword);
router.delete("/delete-account", validate(deleteAccountValidation), deleteAccount);
router.put("/update-profile", validate(updateProfileValidation), updateProfile);

router.post("/forgot-password", validate(forgotPasswordValidation), forgotPassword);
router.post("/reset-password", validate(resetPasswordValidation), resetPassword);

router.post("/send-otp", validate(sendOtpValidation), sendOtp);
router.post("/verify-otp", validate(verifyOtpValidation), verifyOtp);

router.post("/verify-email", validate(verifyEmailValidation), verifyEmail);

export default router;