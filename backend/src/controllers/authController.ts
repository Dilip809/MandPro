
import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { registerUser } from "../services/authService.js";
import { loginUser } from "../services/loginService.js";

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
