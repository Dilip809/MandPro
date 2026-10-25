
import { authApi } from "@/features/auth/authApi";

import type {
  AdminSellerApplicationActionResponse,
  AdminSellerApplicationsResponse,
  CreateSellerApplicationInput,
  MySellerApplicationResponse,
  RejectSellerApplicationInput,
  SellerApplicationResponse,
} from "./types";

export const sellerApplicationApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get the current user's seller application
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

    // Create a seller application
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

    // Admin: get all seller applications
    getAdminSellerApplications: builder.query<
      AdminSellerApplicationsResponse,
      void
    >({
      query: () => ({
        url: "/admin/seller-applications",
        method: "GET",
      }),
      providesTags: (result) => [
        { type: "SellerApplication", id: "ADMIN_LIST" },
        ...(result?.data.applications ?? []).map((application) => ({
          type: "SellerApplication" as const,
          id: application._id ?? application.id ?? "",
        })),
      ],
    }),

    // Admin: approve a seller application
    approveSellerApplication: builder.mutation<
      AdminSellerApplicationActionResponse,
      string
    >({
      query: (id) => ({
        url: `/admin/seller-applications/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "SellerApplication", id: "ADMIN_LIST" },
        { type: "SellerApplication", id: "ME" },
      ],
    }),

    // Admin: reject a seller application
    rejectSellerApplication: builder.mutation<
      AdminSellerApplicationActionResponse,
      { id: string } & RejectSellerApplicationInput
    >({
      query: ({ id, rejectionReason }) => ({
        url: `/admin/seller-applications/${id}/reject`,
        method: "PATCH",
        data: { rejectionReason },
      }),
      invalidatesTags: [
        { type: "SellerApplication", id: "ADMIN_LIST" },
        { type: "SellerApplication", id: "ME" },
      ],
    }),
  }),
});

export const {
  useGetMySellerApplicationQuery,
  useCreateSellerApplicationMutation,
  useGetAdminSellerApplicationsQuery,
  useApproveSellerApplicationMutation,
  useRejectSellerApplicationMutation,
} = sellerApplicationApi;
