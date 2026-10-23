
import type {
  NavigationItemConfig,
  UserRole,
} from "./navigation.types";

export function getVisibleNavigation(
  items: NavigationItemConfig[],
  role?: UserRole,
) {
  return items.filter((item) => {
    if (item.public) return true;

    return Boolean(role && item.roles?.includes(role));
  });
}

export function isNavigationActive(
  pathname: string,
  href: string,
  exact = false,
) {
  if (exact || href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
