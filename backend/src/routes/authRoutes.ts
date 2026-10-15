
import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest.js";
import { registerSchema } from "../validators/authValidator.js";
import { login, logout, register } from "../controllers/authController.js";
import { loginRateLimiter, registerRateLimiter } from "../middlewares/authRateLimiter.js";
import { loginSchema } from "../validators/loginValidator.js";

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


export default router;
