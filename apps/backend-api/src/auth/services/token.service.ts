import * as jwt from "jsonwebtoken";

export class TokenService {
  generateAccessToken(user: any) {
    return jwt.sign(
      {
        sub: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );
  }

  generateRefreshToken(user: any) {
    return jwt.sign(
      {
        sub: user.id,
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );
  }

  refreshExpiry() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
}