import { Router } from "express";
import { createProduct } from "../controllers/productController.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createProductSchema } from "../validators/productValidator.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  authorizeRoles("SELLER"),
  validateRequest(createProductSchema),
  createProduct
);

export default router;