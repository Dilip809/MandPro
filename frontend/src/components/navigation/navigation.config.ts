import type { NavigationItemConfig } from "./navigation.types";

export const NAVIGATION_ITEMS: NavigationItemConfig[] = [
  {
    label: "Home",
    href: "/",
    public: true,
    exact: true,
  },
  {
    label: "Products",
    href: "/products",
    public: true,
  },
  {
    label: "About",
    href: "/about",
    public: true,
  },
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    roles: ["ADMIN"],
  },
  {
    label: "Dashboard",
    href: "/seller/dashboard",
    roles: ["SELLER"],
  },
  {
    label: "Dashboard",
    href: "/delivery/dashboard",
    roles: ["DELIVERY_AGENT"],
  },
];