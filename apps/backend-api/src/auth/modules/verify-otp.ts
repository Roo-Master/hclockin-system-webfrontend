import { Injectable } from "@nestjs/common";

@Injectable()
export class VerifyOtp {
  async execute(dto: any) {
    return {
      message: "OTP verification logic not implemented yet",
    };
  }
}