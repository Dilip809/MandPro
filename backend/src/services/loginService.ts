import bcrypt from "bcryptjs";
import { LoginInput } from "../validators/loginValidator.js";
import User from "../models/User.js";
import HttpError from "../utils/HttpError.js";

export const loginUser = async (input: LoginInput) => {
  const identifier = input.identifier;

  const isPhone = /^[6-9]\d{9}$/.test(identifier);

  // passwordHash has select: false in the User schema,
  // so explicitly request it for password verification.
  const user = await User.findOne(
    isPhone
      ? { phone: identifier }
      : { email: identifier }
  ).select("+passwordHash");

  // Avoid revealing whether an account exists.
  if (!user) {
    throw new HttpError(
      401,
      "Invalid email/phone or password"
    );
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new HttpError(
      401,
      "Invalid email/phone or password"
    );
  }

  if (user.status !== "ACTIVE") {
    throw new HttpError(
      403,
      "This account is not currently available for login"
    );
  }

  // Return an allowlisted object, never the full Mongoose document.
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
};
