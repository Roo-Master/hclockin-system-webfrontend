import { Controller, Post, Body, Req, UseGuards, } from "@nestjs/common";

import { Login } from "./modules/login";
import { Register } from "./modules/register";
import { RefreshToken } from "./modules/refresh-token";
import { ChangePassword } from "./modules/change-password";
import { UpdateProfile } from "./modules/update-profile";
import { ForgotPassword } from "./modules/forgot-password";
import { ResetPassword } from "./modules/reset-password";
import { VerifyOtp } from "./modules/verify-otp";

import { JwtAuthGuard } from "./guards/jwt-auth.guard";

// DTOs
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly loginModule: Login,
    private readonly registerModule: Register,
    private readonly refreshTokenModule: RefreshToken,
    private readonly changePasswordModule: ChangePassword,
    private readonly updateProfileModule: UpdateProfile,
    private readonly forgotPasswordModule: ForgotPassword,
    private readonly resetPasswordModule: ResetPassword,
    private readonly verifyOtpModule: VerifyOtp,
  ) {}

  // =========================
  // USER LOGIN
  // =========================
  @Post("login")
  public async loginUser(
    @Body() loginDto: LoginDto,
    @Req() request: any,
  ) {
    return this.loginModule.execute(loginDto, request);
  }

  // =========================
  // USER REGISTRATION
  // =========================
  @Post("register")
  public async registerUser(
    @Body() registerDto: RegisterDto,
  ) {
    return this.registerModule.execute(registerDto);
  }

  // =========================
  // REFRESH ACCESS TOKEN
  // =========================
  @Post("refresh-token")
  public async refreshAccessToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    return this.refreshTokenModule.execute(refreshTokenDto);
  }

  // =========================
  // CHANGE USER PASSWORD
  // =========================
  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  public async changeUserPassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() request: any,
  ) {
    return this.changePasswordModule.execute(
      changePasswordDto,
      request.user,
    );
  }

  // =========================
  // UPDATE USER PROFILE
  // =========================
  @Post("update-profile")
  @UseGuards(JwtAuthGuard)
  public async updateUserProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() request: any,
  ) {
    return this.updateProfileModule.execute(
      updateProfileDto,
      request.user,
    );
  }

  // =========================
  // FORGOT PASSWORD REQUEST
  // =========================
  @Post("forgot-password")
  public async forgotPasswordRequest(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.forgotPasswordModule.execute(forgotPasswordDto);
  }

  // =========================
  // RESET PASSWORD
  // =========================
  @Post("reset-password")
  public async resetUserPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.resetPasswordModule.execute(resetPasswordDto);
  }

  // =========================
  // VERIFY OTP CODE
  // =========================
  @Post("verify-otp")
  public async verifyOtpCode(
    @Body() verifyOtpDto: VerifyOtpDto,
  ) {
    return this.verifyOtpModule.execute(verifyOtpDto);
  }
}