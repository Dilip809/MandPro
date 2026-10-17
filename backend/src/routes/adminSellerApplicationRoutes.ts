
import { Router } from "express";
import { approveSellerApplication, getSellerApplications, rejectSellerApplication } from "../controllers/adminSellerApplicationController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { rejectSellerApplicationSchema } from "../validators/adminSellerApplicationValidator.js";

const router = Router();

router.get(
  "/seller-applications",
  requireAuth,
  authorizeRoles("ADMIN"),
  getSellerApplications
);

router.patch(
  "/seller-applications/:id/approve",
  requireAuth,
  authorizeRoles("ADMIN"),
  approveSellerApplication
);

router.patch(
  "/seller-applications/:id/reject",
  requireAuth,
  authorizeRoles("ADMIN"),
  validateRequest(rejectSellerApplicationSchema),
  rejectSellerApplication,
);

export default router;
