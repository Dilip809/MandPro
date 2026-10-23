
"use client";

import { useState } from "react";
import { useLogoutMutation } from "@/features/auth/authApi";

export default function LogoutButton() {
  const [logout, { isLoading }] = useLogoutMutation();
  const [message, setMessage] = useState("");

  async function handleLogout() {
    setMessage("");

    try {
      // Only change the UI after the server confirms logout.
      await logout().unwrap();
    } catch {
      setMessage(
        "Logout failed. Your session may still be active. Please try again.",
      );
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className="rounded-lg border border-border px-4 py-2 font-medium disabled:opacity-50"
      >
        {isLoading ? "Logging out..." : "Logout"}
      </button>

      {message && (
        <p className="text-sm text-danger" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
