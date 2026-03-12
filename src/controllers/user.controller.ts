// user.controller.ts
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { errorResponse, successResponse } from "../utils/apiResponse";
import { deleteFromCloudinary } from "../utils/cloudinaryDelete";

export interface RequestWithUser extends Request {
  user?: { userId: string };
  file?: Express.Multer.File; // For file uploads
}

// ==========================
// GET PROFILE
// ==========================
export const getMeController = async (req: RequestWithUser, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, username: true, avatarUrl: true },
    });

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "User profile fetched", user);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Internal server error");
  }
};

// ==========================
// UPDATE PROFILE (name, username, avatar)
// ==========================
export const updateMeController = async (req: RequestWithUser, res: Response) => {
  try {
    const { name, username } = req.body;

    // Validate inputs
    if (name && typeof name !== "string") return errorResponse(res, "Invalid name", 400);
    if (username && typeof username !== "string") return errorResponse(res, "Invalid username", 400);

    // Fetch existing user
    const existingUser = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!existingUser) return errorResponse(res, "User not found", 404);

    let avatarUrl = existingUser.avatarUrl;

    // Handle avatar upload
    if (req.file) {
      if (existingUser.avatarUrl) {
        const publicId = existingUser.avatarUrl.split("/").slice(-2).join("/").split(".")[0];
        await deleteFromCloudinary(publicId, "image");
      }
      avatarUrl = req.file.path;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, username, avatarUrl },
      select: { id: true, name: true, email: true, username: true, avatarUrl: true },
    });

    return successResponse(res, "Profile updated", updatedUser);
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") return errorResponse(res, "Username already taken", 400);
    return errorResponse(res, "Internal server error");
  }
};

// ==========================
// DELETE ACCOUNT
// ==========================
export const deleteMeController = async (req: RequestWithUser, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return errorResponse(res, "User not found", 404);

    if (user.avatarUrl) {
      const publicId = user.avatarUrl.split("/").slice(-2).join("/").split(".")[0];
      await deleteFromCloudinary(publicId, "image");
    }

    await prisma.user.delete({ where: { id: req.user!.userId } });

    return successResponse(res, "Account deleted", null);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Internal server error");
  }
};