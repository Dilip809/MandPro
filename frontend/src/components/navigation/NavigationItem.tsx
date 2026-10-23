
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavigationActive } from "./navigation.utils";
import type { NavigationItemConfig } from "./navigation.types";

type Props = {
  item: NavigationItemConfig;
  onNavigate?: () => void;
};

export default function NavigationItem({
  item,
  onNavigate,
}: Props) {
  const pathname = usePathname();

  const active = isNavigationActive(
    pathname,
    item.href,
    item.exact,
  );

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={[
        "flex items-center rounded-lg px-3 py-1",
        "text-sm font-medium transition-colors",
        active
          ? "bg-primary-soft text-primary border-b-2 border-primary-hover"
          : "text-text-muted hover:bg-primary-soft hover:text-primary",
      ].join(" ")}
    >
      {item.label}
    </Link>
  );
}
