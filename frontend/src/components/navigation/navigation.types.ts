export type UserRole =
  | "CUSTOMER"
  | "SELLER"
  | "ADMIN"
  | "DELIVERY_AGENT"
  | "SUPPORT_AGENT";

export type NavigationItemConfig = {
  label: string;
  href: string;
  public?: boolean;
  roles?: UserRole[];
  exact?: boolean;
};

export type NavigationProps = {
  role?: UserRole;
  dashboardHref?: string;
  checkingSession?: boolean;
  isAuthenticated?: boolean;
  className?: string;
};