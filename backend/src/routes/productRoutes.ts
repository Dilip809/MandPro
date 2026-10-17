import { Router } from "express";
import { createProduct, getMyProducts, getProducts, restoreProduct, updateProduct, updateProductStatus } from "../controllers/productController.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createProductSchema, updateProductSchema, updateProductStatusSchema } from "../validators/productValidator.js";
import requireApprovedSeller from "../middlewares/requireApprovedSeller.js";

const router = Router();

// Protected: list products belonging to the authenticated seller
router.get(
  "/my-products",
  requireAuth,
  requireApprovedSeller,
  getMyProducts
);

// Update product details
router.patch(
  "/:id",
  requireAuth,
  requireApprovedSeller,
  validateRequest(updateProductSchema),
  updateProduct
);

// Change product status
router.patch(
  "/:id/status",
  requireAuth,
  requireApprovedSeller,
  validateRequest(updateProductStatusSchema),
  updateProductStatus
);

// Restore an archived product
router.patch(
  "/:id/restore",
  requireAuth,
  requireApprovedSeller,
  restoreProduct
);

// Public: list active products
router.get("/", getProducts);

// Create product
router.post(
  "/",
  requireAuth,
  requireApprovedSeller,
  validateRequest(createProductSchema),
  createProduct
);

export default router;