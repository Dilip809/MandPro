
import "express-session";
import type { UserRole } from "../models/User.js";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export {};
