
import { authApi } from "@/features/auth/authApi";

import type {
  CreateSellerApplicationInput,
  MySellerApplicationResponse,
  SellerApplicationResponse,
} from "./types";

export const sellerApplicationApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getMySellerApplication: builder.query<
      MySellerApplicationResponse,
      void
    >({
      query: () => ({
        url: "/seller-applications/me",
        method: "GET",
      }),
      providesTags: [{ type: "SellerApplication", id: "ME" }],
    }),

    createSellerApplication: builder.mutation<
      SellerApplicationResponse,
      CreateSellerApplicationInput
    >({
      query: (body) => ({
        url: "/seller-applications",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "SellerApplication", id: "ME" }],
    }),
  }),
});

export const {
  useGetMySellerApplicationQuery,
  useCreateSellerApplicationMutation,
} = sellerApplicationApi;
