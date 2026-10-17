
import type { RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import HttpError from "../utils/HttpError.js";
import User from "../models/User.js";

const requireApprovedSeller: RequestHandler = asyncHandler(
  async (req, _res, next) => {
    if (!req.authUser) {
      throw new HttpError(401, "Authentication required");
    }

    const user = await User.findById(req.authUser.id)
      .select("role status sellerApprovalStatus");

    if (!user) {
      throw new HttpError(401, "User account not found");
    }

    if (user.status !== "ACTIVE") {
      throw new HttpError(403, "Your account is not active");
    }

    if (user.sellerApprovalStatus !== "APPROVED") {
      throw new HttpError(
        403,
        "Your seller account has not been approved"
      );
    }

    next();
  }
);

export default requireApprovedSeller;
