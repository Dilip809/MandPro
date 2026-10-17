
import { Router } from "express";
import { getSellerApplications } from "../controllers/adminSellerApplicationController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.get(
  "/seller-applications",
  requireAuth,
  authorizeRoles("ADMIN"),
  getSellerApplications
);

export default router;
