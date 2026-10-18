import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/features/auth/authApi";

export const makeStore = () =>
  configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];