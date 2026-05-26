import rateLimit from "express-rate-limit";

/**
 * GENERAL API LIMIT (default protection)
 */
export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * STRICT LIMIT (LOGIN / REGISTER / REFRESH TOKEN)
 */
export const strictAuthLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * PASSWORD RESET / OTP LIMITER
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP REQUEST LIMITER (optional but recommended)
 */
export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});