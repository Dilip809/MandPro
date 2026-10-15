import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export const USER_ROLES = [
  "CUSTOMER",
  "SELLER",
  "ADMIN",
  "DELIVERY_AGENT",
  "SUPPORT_AGENT",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = [
  "ACTIVE",
  "PENDING",
  "SUSPENDED",
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export const CUSTOMER_TYPES = [
  "INDIVIDUAL",
  "HOTEL_RESTAURANT",
  "FOOD_STALL",
  "CATERER",
  "STREET_VENDOR",
  "RETAIL_SHOP",
  "WHOLESALER",
  "OTHER_BUSINESS",
] as const;

export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export interface IUser {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  customerType: CustomerType;
  businessName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Invalid Indian mobile number"],
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    customerType: {
      type: String,
      enum: CUSTOMER_TYPES,
      required: true,
    },

    businessName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 150,
      required: function (this: IUser) {
        return this.customerType !== "INDIVIDUAL";
      },
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: "CUSTOMER",
      required: true,
    },

    status: {
      type: String,
      enum: USER_STATUSES,
      default: "ACTIVE",
      required: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Email must be unique, ignoring letter case.
userSchema.index(
  { email: 1 },
  { unique: true }
);

// Phone is optional, but must be unique when supplied.
userSchema.index(
  { phone: 1 },
  {
    unique: true,
  }
);

// const User =
//   models.User || model<IUser>("User", userSchema);

const User: Model<IUser> =
  (models.User as Model<IUser>) ||
  model<IUser>("User", userSchema);


export default User;
