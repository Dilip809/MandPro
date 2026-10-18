
import api from "@/lib/api/client";
import type {
  ApiResponse,
  AuthUser,
  CurrentUserResponse,
} from "./types";

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<CurrentUserResponse>("auth/me", {
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  if (!response.data.success || !response.data.data?.user) {
    throw new Error(
      response.data.message || "Unable to restore your session.",
    );
  }

  return response.data.data.user;
}

export async function logout(): Promise<void> {
  const response = await api.post<ApiResponse<unknown>>("auth/logout");

  if (!response.data.success) {
    throw new Error(response.data.message || "Unable to log out.");
  }
}
