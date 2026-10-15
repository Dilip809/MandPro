
import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { registerUser } from "../services/authService.js";
import { loginUser } from "../services/loginService.js";
import User from "../models/User.js";

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



// loginController.ts
export const login = asyncHandler(
  async (req: Request, res: Response) => {
    // Authenticate credentials first.
    const user = await loginUser(req.body);

    // Regenerate the session ID after authentication.
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    // Store only the authenticated user's ID in the session.
    req.session.userId = user.id;

    // Persist the session before responding.
    await new Promise<void>((resolve, reject) => {
      req.session.save((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
      },
    });
  }
);


// logoutController.ts
export const logout = asyncHandler(
  async (req: Request, res: Response) => {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    const cookieName =
      process.env.SESSION_COOKIE_NAME ?? "mandipro.sid";

    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  }
);

// getCurrentUserController.ts
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(userId)
      .select(
        "name email phone role status emailVerified customerType businessName createdAt updatedAt"
      )
      .lean();

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

    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: { user },
    });
  }
);