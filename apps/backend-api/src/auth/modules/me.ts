import { Request, Response } from "express";
import { prisma } from "@chronos/database";

export const me = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tenantId: true,
        departmentId: true,
        payrollNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        hourlyRate: true,
        isActive: true,
        devicePin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};