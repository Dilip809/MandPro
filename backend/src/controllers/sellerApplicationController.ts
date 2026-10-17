
import type { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import HttpError from "../utils/HttpError.js";
import User from "../models/User.js";
import SellerApplication from "../models/SellerApplication.js";
import type { CreateSellerApplicationInput } from "../validators/sellerApplicationValidator.js";

// Customer submits an application to become a seller.
export const createSellerApplication: RequestHandler = asyncHandler(
  async (req, res) => {
    const authUser = req.authUser;

    if (!authUser) {
      throw new HttpError(401, "Authentication required");
    }

    const userId = new Types.ObjectId(authUser.id);

    const {
      businessName,
      businessType,
      businessAddress,
      contactPhone,
    } = req.body as CreateSellerApplicationInput;

    const session = await mongoose.startSession();

    let applicationId: string | undefined;
    let applicationCreatedAt: Date | undefined;

    try {
      await session.withTransaction(async () => {
        // Read the latest user state inside the transaction.
        const user = await User.findById(userId).session(session);

        if (!user) {
          throw new HttpError(401, "User account not found");
        }

        if (user.status !== "ACTIVE") {
          throw new HttpError(403, "Your account is not active");
        }

        if (user.role !== "CUSTOMER" && user.role !== "SELLER") {
          throw new HttpError(
            403,
            "Only customer accounts can apply to become sellers",
          );
        }

        if (user.sellerApprovalStatus === "APPROVED") {
          throw new HttpError(409, "You are already an approved seller");
        }

        if (user.sellerApprovalStatus === "PENDING") {
          throw new HttpError(
            409,
            "Your seller application is already pending",
          );
        }

        const application = await SellerApplication.findOneAndUpdate(
          { userId },
          {
            $set: {
              businessName,
              businessType,
              businessAddress,
              contactPhone,
              status: "PENDING",
            },
            $unset: {
              reviewedBy: 1,
              reviewedAt: 1,
              rejectionReason: 1,
            },
            $setOnInsert: {
              userId,
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
            session,
          },
        );

        if (!application) {
          throw new HttpError(
            500,
            "Seller application could not be saved",
          );
        }

        user.sellerApprovalStatus = "PENDING";
        await user.save({ session });

        applicationId = application._id.toString();
        applicationCreatedAt = application.createdAt;
      });
    } finally {
      await session.endSession();
    }

    if (!applicationId || !applicationCreatedAt) {
      throw new HttpError(
        500,
        "Seller application submission could not be completed",
      );
    }

    res.status(201).json({
      success: true,
      message: "Seller application submitted successfully",
      data: {
        application: {
          id: applicationId,
          businessName,
          businessType,
          businessAddress,
          contactPhone,
          status: "PENDING",
          createdAt: applicationCreatedAt,
        },
      },
    });
  },
);


// Customer checks their own seller application status.
export const getMySellerApplication: RequestHandler = asyncHandler(
  async (req, res) => {
    const authUser = req.authUser;

    if (!authUser) {
      throw new HttpError(401, "Authentication required");
    }

    const application = await SellerApplication.findOne({
      userId: new Types.ObjectId(authUser.id),
    }).select("-reviewedBy");

    if (!application) {
      res.status(200).json({
        success: true,
        data: { application: null },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { application },
    });
  }
);
