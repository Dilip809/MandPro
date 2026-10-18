
"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";

import AuthBootstrap from "@/components/providers/AuthBootstrap";
import { makeStore } from "@/lib/store/store";

export default function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [store] = useState(makeStore);

  return (
    <Provider store={store}>
      <AuthBootstrap />
      {children}
    </Provider>
  );
}
