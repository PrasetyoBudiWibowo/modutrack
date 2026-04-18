import type { IconKey } from "./iconMap";

export interface MenuItem {
  name: string;
  url?: string;
  icon?: IconKey;
  children?: MenuItem[];
}

export const staticMenu: MenuItem[] = [
  {
    name: "Dashboard",
    url: "/dashboard",
    icon: "dashboard",
  },
  {
    name: "Management",
    icon: "settings",
    children: [
      {
        name: "User",
        url: "/dashboard/users",
      },
      {
        name: "Module",
        url: "/dashboard/modules",
      },
    ],
  },
];