
import bcrypt from "bcryptjs";
import { RegisterInput } from "../validators/authValidator.js";
import User, { type IUser } from "../models/User.js";
import HttpError from "../utils/HttpError.js";

export const registerUser = async (input: RegisterInput) => {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const customerType = input.customerType;

  const businessName =
    customerType === "INDIVIDUAL"
      ? undefined
      : input.businessName?.trim();

  // Early check for a friendlier error.
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  })
    .select("_id email phone")
    .lean();

  if (existingUser) {
    const duplicateEmail = existingUser.email === email;
    const duplicatePhone = existingUser.phone === phone;

    if (duplicateEmail && duplicatePhone) {
      throw new HttpError(
        409,
        "An account with this email and phone already exists"
      );
    }

    if (duplicateEmail) {
      throw new HttpError(
        409,
        "An account with this email already exists"
      );
    }

    throw new HttpError(
      409,
      "An account with this phone number already exists"
    );
  }

  // Hash only after validation and the preliminary duplicate check.
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      customerType,
      ...(businessName ? { businessName } : {}),
      role: "CUSTOMER",
    });

    if (!user) {
  throw new HttpError(500, "Failed to create user");
}

    // Explicit allowlist: never return passwordHash.
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      customerType: user.customerType,
      ...(user.businessName
        ? { businessName: user.businessName }
        : {}),
      createdAt: user.createdAt,
    };
  } catch (error: unknown) {
    // MongoDB unique indexes remain the final duplicate safeguard.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new HttpError(
        409,
        "An account with this email or phone already exists"
      );
    }

    throw error;
  }
};
