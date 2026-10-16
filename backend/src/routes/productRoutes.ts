import { Router } from "express";
import { createProduct, getMyProducts, getProducts, restoreProduct, updateProduct, updateProductStatus } from "../controllers/productController.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createProductSchema, updateProductSchema, updateProductStatusSchema } from "../validators/productValidator.js";

const router = Router();

// Protected: list products of the authenticated seller
router.get(
  "/my-products",
  requireAuth,
  authorizeRoles("SELLER"),
  getMyProducts
);

router.patch(
  "/:id",
  requireAuth,
  authorizeRoles("SELLER"),
  validateRequest(updateProductSchema),
  updateProduct
);

router.patch(
  "/:id/status",
  requireAuth,
  authorizeRoles("SELLER"),
  validateRequest(updateProductStatusSchema),
  updateProductStatus
);

router.patch(
  "/:id/restore",
  requireAuth,
  authorizeRoles("SELLER"),
  restoreProduct
);

// Public: list active products
router.get("/", getProducts);

router.post(
  "/",
  requireAuth,
  authorizeRoles("SELLER"),
  validateRequest(createProductSchema),
  createProduct
);

export default router;