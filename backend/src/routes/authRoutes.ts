
import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema } from "../validators/authValidator.js";
import { register } from "../controllers/authController.js";
import { registerRateLimiter } from "../middleware/authRateLimiter.js";

const router = Router();

router.post(
  "/register",
  registerRateLimiter,
  validateRequest(registerSchema),
  register
);

export default router;
