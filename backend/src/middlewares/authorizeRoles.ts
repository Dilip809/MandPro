
import type { RequestHandler } from "express";
import type { UserRole } from "../models/User.js";

export const authorizeRoles = (
  ...allowedRoles: UserRole[]
): RequestHandler => {
  return (req, res, next) => {
    // requireAuth must run first.
    if (!req.authUser) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this resource",
      });
      return;
    }

    next();
  };
};
