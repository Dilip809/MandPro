
import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getCurrentUser } from "./api";
import type { AuthUser } from "./types";

type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "failed";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

export const restoreSession = createAsyncThunk<
  AuthUser | null,
  void,
  { rejectValue: string }
>("auth/restoreSession", async (_, { rejectWithValue }) => {
  try {
    return await getCurrentUser();
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }

    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : error.message || "Unable to restore your session.",
      );
    }

    return rejectWithValue("Unable to restore your session.");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearSession(state) {
      state.user = null;
      state.status = "unauthenticated";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload
          ? "authenticated"
          : "unauthenticated";
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.user = null;
        state.status = "failed";
        state.error =
          action.payload ?? "Unable to restore your session.";
      });
  },
});

export const { clearAuthError, clearSession } = authSlice.actions;

export default authSlice.reducer;
