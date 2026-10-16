import { Router } from "express";
import { createProduct, getMyProducts, getProducts } from "../controllers/productController.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createProductSchema } from "../validators/productValidator.js";

const router = Router();

// Protected: list products of the authenticated seller
router.get(
  "/my-products",
  requireAuth,
  authorizeRoles("SELLER"),
  getMyProducts
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