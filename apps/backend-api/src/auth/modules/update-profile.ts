import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class UpdateProfile {
  constructor(private prisma: PrismaService) {}

  async execute(dto: any, user: any) {
    return this.prisma.user.update({
      where: { id: user.id },
      data: dto,
    });
  }
}