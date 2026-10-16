
import type { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";

export const requireAuth = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(userId).select("role status");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    // Attach verified user information to this request.
    req.authUser = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  }
);
