
import mongoose, { type Model, type Types } from "mongoose";
import {
  CUSTOMER_TYPES,
  type CustomerType,
} from "./User.js";

const { Schema, model, models } = mongoose;

export const SELLER_APPLICATION_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export type SellerApplicationStatus =
  (typeof SELLER_APPLICATION_STATUSES)[number];

export interface ISellerApplication {
  userId: Types.ObjectId;
  businessName: string;
  businessType: CustomerType;
  businessAddress: string;
  contactPhone: string;
  status: SellerApplicationStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sellerApplicationSchema = new Schema<ISellerApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    businessType: {
      type: String,
      enum: CUSTOMER_TYPES,
      required: true,
    },

    businessAddress: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Invalid Indian mobile number"],
    },

    status: {
      type: String,
      enum: SELLER_APPLICATION_STATUSES,
      default: "PENDING",
      required: true,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// One application record per user.
// Rejected applications can later be resubmitted using the same record.
sellerApplicationSchema.index(
  { userId: 1 },
  { unique: true }
);

const SellerApplication: Model<ISellerApplication> =
  (models.SellerApplication as Model<ISellerApplication>) ||
  model<ISellerApplication>(
    "SellerApplication",
    sellerApplicationSchema
  );

export default SellerApplication;
