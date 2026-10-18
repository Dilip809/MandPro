import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "@/lib/api/baseQuery";
import type {
  ApiResponse,
  AuthUser,
  CurrentUserResponse,
} from "./types";

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  customerType: AuthUser["customerType"];
  businessName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

type AuthMutationResponse = ApiResponse<{
  user: AuthUser;
}>;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["CurrentUser"],

  endpoints: (builder) => ({
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["CurrentUser"],
    }),

    register: builder.mutation<AuthMutationResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        data: body,
      }),
    }),

    login: builder.mutation<AuthMutationResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["CurrentUser"],
    }),

    logout: builder.mutation<
      ApiResponse<unknown>,
      void
    >({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.resetApiState());
        } catch {
          // Keep the API error available to the calling component.
        }
      },
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
} = authApi;