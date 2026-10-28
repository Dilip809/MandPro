
export const PRODUCT_UNITS = ["KG", "QUINTAL", "BAG"] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export const PRODUCT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  id: string;
  sellerId?: string;
  name: string;
  description?: string;
  category: string;
  unit: ProductUnit;
  price: number;
  stockQuantity: number;
  status?: ProductStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  category: string;
  unit: ProductUnit;
  price: number;
  stockQuantity: number;
}

export type UpdateProductInput = Partial<ProductInput>;

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type ProductMutationResponse = ApiResponse<{
  product: Product;
}>;

export type ProductListResponse = ApiResponse<{
  products: Product[];
  pagination: ProductPagination;
}>;

export type ProductResponse = ApiResponse<{
  product: Product;
}>;

export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  unit?: ProductUnit;
}

export interface UpdateProductStatusInput {
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}
