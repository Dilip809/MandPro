
"use client";

import { useGetCurrentUserQuery } from "@/features/auth/authApi";


export default function AuthBootstrap() {
  useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  return null;
}
