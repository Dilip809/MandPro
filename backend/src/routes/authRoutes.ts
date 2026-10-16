
import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest.js";
import { registerSchema } from "../validators/authValidator.js";
import { getCurrentUser, login, logout, register } from "../controllers/authController.js";
import { loginRateLimiter, registerRateLimiter } from "../middlewares/authRateLimiter.js";
import { loginSchema } from "../validators/loginValidator.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.post(
  "/register",
  registerRateLimiter,
  validateRequest(registerSchema),
  register
);

router.post(
  "/login",
  loginRateLimiter,
  validateRequest(loginSchema),
  login
);

router.post("/logout", logout);

router.get("/me", requireAuth, getCurrentUser);

router.get(
  "/test/customer",
  requireAuth,
  authorizeRoles("CUSTOMER"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Customer access granted",
    });
  }
);

router.get(
  "/test/admin",
  requireAuth,
  authorizeRoles("ADMIN"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
    });
  }
);


export default router;
