import mongoose, { Types } from "mongoose";
import type { RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import HttpError from "../utils/HttpError.js";
import SellerApplication, {
  SELLER_APPLICATION_STATUSES,
} from "../models/SellerApplication.js";
import User from "../models/User.js";
import { RejectSellerApplicationInput } from "../validators/adminSellerApplicationValidator.js";

export const getSellerApplications: RequestHandler = asyncHandler(
  async (req, res) => {
    const status = req.query.status;
    const pageValue = req.query.page ?? "1";
    const limitValue = req.query.limit ?? "10";

    // Validate the optional status filter.
    if (
      status !== undefined &&
      (typeof status !== "string" ||
        !SELLER_APPLICATION_STATUSES.includes(
          status as (typeof SELLER_APPLICATION_STATUSES)[number]
        ))
    ) {
      throw new HttpError(
        400,
        "Invalid status. Use PENDING, APPROVED, or REJECTED"
      );
    }

    // Validate pagination values.
    const page = Number(pageValue);
    const limit = Number(limitValue);

    if (
      typeof pageValue !== "string" ||
      !/^[1-9]\d*$/.test(pageValue) ||
      !Number.isSafeInteger(page)
    ) {
      throw new HttpError(400, "Page must be a positive integer");
    }

    if (
      typeof limitValue !== "string" ||
      !/^[1-9]\d*$/.test(limitValue) ||
      !Number.isSafeInteger(limit) ||
      limit > 100
    ) {
      throw new HttpError(
        400,
        "Limit must be a positive integer no greater than 100"
      );
    }

    const filter =
      status === undefined
        ? {}
        : {
          status:
            status as (typeof SELLER_APPLICATION_STATUSES)[number],
        };

    const skip = (page - 1) * limit;

    if (!Number.isSafeInteger(skip)) {
      throw new HttpError(400, "Page value is too large");
    }

    const [applications, total] = await Promise.all([
      SellerApplication.find(filter)
        .select("-__v")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "userId",
          select: "name email phone customerType businessName status",
        })
        .lean(),
      SellerApplication.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }
);



export const approveSellerApplication: RequestHandler = asyncHandler(
  async (req, res) => {
    if (!req.authUser) {
      throw new HttpError(401, "Authentication required");
    }

    const applicationId = req.params.id;

    if (
      typeof applicationId !== "string" ||
      !Types.ObjectId.isValid(applicationId)
    ) {
      throw new HttpError(400, "Invalid seller application ID");
    }

    const session = await mongoose.startSession();
    let approvedApplicationId: string | undefined;

    try {
      await session.withTransaction(async () => {
        const application = await SellerApplication.findOneAndUpdate(
          {
            _id: applicationId,
            status: "PENDING",
          },
          {
            $set: {
              status: "APPROVED",
              reviewedBy: new Types.ObjectId(req.authUser!.id),
              reviewedAt: new Date(),
            },
            $unset: {
              rejectionReason: 1,
            },
          },
          {
            new: true,
            runValidators: true,
            session,
          }
        );

        if (!application) {
          const existingApplication = await SellerApplication.findById(
            applicationId
          ).session(session);

          if (!existingApplication) {
            throw new HttpError(404, "Seller application not found");
          }

          throw new HttpError(
            409,
            "Only pending seller applications can be approved"
          );
        }

        const user = await User.findById(application.userId).session(session);

        if (!user) {
          throw new HttpError(
            409,
            "The applicant's user account was not found"
          );
        }

        if (user.status !== "ACTIVE") {
          throw new HttpError(
            409,
            "Cannot approve a seller with an inactive account"
          );
        }

        if (user.sellerApprovalStatus !== "PENDING") {
          throw new HttpError(
            409,
            "User seller approval status does not match the pending application"
          );
        }

        user.sellerApprovalStatus = "APPROVED";
        await user.save({ session });

        approvedApplicationId = application._id.toString();
      });
    } finally {
      await session.endSession();
    }

    if (!approvedApplicationId) {
      throw new HttpError(500, "Seller approval could not be completed");
    }

    res.status(200).json({
      success: true,
      message: "Seller application approved successfully",
      data: {
        applicationId: approvedApplicationId,
        status: "APPROVED",
        sellerApprovalStatus: "APPROVED",
      },
    });
  }
);


export const rejectSellerApplication: RequestHandler = asyncHandler(
  async (req, res) => {
    const authUser = req.authUser;

    if (!authUser) {
      throw new HttpError(401, "Authentication required");
    }

    const applicationId = req.params.id;

    if (
      typeof applicationId !== "string" ||
      !Types.ObjectId.isValid(applicationId)
    ) {
      throw new HttpError(400, "Invalid seller application ID");
    }

    const { rejectionReason } =
      req.body as RejectSellerApplicationInput;

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const application = await SellerApplication.findOneAndUpdate(
          {
            _id: applicationId,
            status: "PENDING",
          },
          {
            $set: {
              status: "REJECTED",
              rejectionReason,
              reviewedBy: new Types.ObjectId(authUser.id),
              reviewedAt: new Date(),
            },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );

        if (!application) {
          const existingApplication = await SellerApplication.findById(
            applicationId,
          ).session(session);

          if (!existingApplication) {
            throw new HttpError(404, "Seller application not found");
          }

          throw new HttpError(
            409,
            "Only pending seller applications can be rejected",
          );
        }

        const user = await User.findById(application.userId).session(session);

        if (!user) {
          throw new HttpError(
            409,
            "The applicant's user account was not found"
          );
        }

        if (user.sellerApprovalStatus !== "PENDING") {
          throw new HttpError(
            409,
            "User seller approval status does not match the pending application"
          );
        }

        user.sellerApprovalStatus = "REJECTED";
        await user.save({ session });
      });
    } finally {
      await session.endSession();
    }

    res.status(200).json({
      success: true,
      message: "Seller application rejected successfully",
      data: {
        applicationId,
        status: "REJECTED",
        sellerApprovalStatus: "REJECTED",
        rejectionReason,
      },
    });
  },
);
