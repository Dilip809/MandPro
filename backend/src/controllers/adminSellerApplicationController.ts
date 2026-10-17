
import type { RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import HttpError from "../utils/HttpError.js";
import SellerApplication, {
  SELLER_APPLICATION_STATUSES,
} from "../models/SellerApplication.js";

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
