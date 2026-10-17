
import { Router } from "express";
import {
  createSellerApplication,
  getMySellerApplication,
} from "../controllers/sellerApplicationController.js";
import {
  createSellerApplicationSchema,
} from "../validators/sellerApplicationValidator.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  validateRequest(createSellerApplicationSchema),
  createSellerApplication
);

router.get(
  "/me",
  requireAuth,
  getMySellerApplication
);

export default router;
