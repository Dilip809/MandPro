
import { authApi } from "@/features/auth/authApi";

import type {
  ProductInput,
  ProductListParams,
  ProductListResponse,
  ProductMutationResponse,
  ProductStatus,
  UpdateProductInput,
  UpdateProductStatusInput,
} from "./types";

interface ProductStatusResponse {
  success: boolean;
  message?: string;
  data: {
    product: {
      id: string;
      sellerId: string;
      name: string;
      status: ProductStatus;
      updatedAt: string;
    };
  };
}

// Data sent when creating a product with an image.
export interface CreateProductFormData {
  data: ProductInput;
  image?: File | null;
}

// Data sent when updating a product with an optional new image.
export interface UpdateProductFormData {
  id: string;
  data: UpdateProductInput;
  image?: File | null;
}

function buildProductFormData(
  data: ProductInput | UpdateProductInput,
  image?: File | null,
): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (image) {
    formData.append("image", image);
  }

  return formData;
}

export const productsApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public marketplace listing.
    getProducts: builder.query<ProductListResponse, ProductListParams | void>({
      query: (params) => ({
        url: "/products",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: (result) => [
        { type: "Product", id: "PUBLIC_LIST" },
        ...(result?.data.products ?? []).map((product) => ({
          type: "Product" as const,
          id: product.id,
        })),
      ],
    }),

    // List products belonging to the authenticated seller.
    getMyProducts: builder.query<ProductListResponse, ProductListParams | void>({
      query: (params) => ({
        url: "/products/my-products",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: (result) => [
        { type: "Product", id: "SELLER_LIST" },
        ...(result?.data.products ?? []).map((product) => ({
          type: "Product" as const,
          id: product.id,
        })),
      ],
    }),

    // Create product with optional image.
    createProduct: builder.mutation<
      ProductMutationResponse,
      CreateProductFormData
    >({
      query: ({ data, image }) => ({
        url: "/products",
        method: "POST",
        data: buildProductFormData(data, image),
      }),
      invalidatesTags: [
        { type: "Product", id: "SELLER_LIST" },
        { type: "Product", id: "PUBLIC_LIST" },
      ],
    }),

    // Update product with optional replacement image.
    updateProduct: builder.mutation<
      ProductMutationResponse,
      UpdateProductFormData
    >({
      query: ({ id, data, image }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        data: buildProductFormData(data, image),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "SELLER_LIST" },
        { type: "Product", id: "PUBLIC_LIST" },
      ],
    }),

    updateProductStatus: builder.mutation<
      ProductStatusResponse,
      { id: string } & UpdateProductStatusInput
    >({
      query: ({ id, status }) => ({
        url: `/products/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "SELLER_LIST" },
        { type: "Product", id: "PUBLIC_LIST" },
      ],
    }),

    restoreProduct: builder.mutation<ProductStatusResponse, string>({
      query: (id) => ({
        url: `/products/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Product", id },
        { type: "Product", id: "SELLER_LIST" },
        { type: "Product", id: "PUBLIC_LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetMyProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useRestoreProductMutation,
} = productsApi;
