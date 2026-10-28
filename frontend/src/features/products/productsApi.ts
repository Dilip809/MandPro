
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

    createProduct: builder.mutation<ProductMutationResponse, ProductInput>({
      query: (data) => ({
        url: "/products",
        method: "POST",
        data,
      }),
      invalidatesTags: [
        { type: "Product", id: "SELLER_LIST" },
        { type: "Product", id: "PUBLIC_LIST" },
      ],
    }),

    updateProduct: builder.mutation<
      ProductMutationResponse,
      { id: string; data: UpdateProductInput }
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        data,
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
