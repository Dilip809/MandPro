
import { Router } from "express";
import { approveSellerApplication, getSellerApplications } from "../controllers/adminSellerApplicationController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

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

export default router;
