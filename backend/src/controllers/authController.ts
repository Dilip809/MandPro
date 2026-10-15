
import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { registerUser } from "../services/authService.js";

export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user,
      },
    });
  }
);
