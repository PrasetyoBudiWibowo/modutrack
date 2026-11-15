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
    icon: "LayoutDashboard",
  },
  {
    name: "Management",
    icon: "Settings",
    children: [
      {
        name: "Module",
        url: "/dashboard/modules",
      },
      {
        name: "Menu",
        url: "/dashboard/menus",
      },
      {
        name: "Hak Akses",
        url: "/dashboard/akses",
      },
    ],
  },
  {
    name: "Wilayah",
    icon: "MapPinned",
    children: [
      {
        name: "Provinsi",
        url: "/provinsi",
      },
      {
        name: "Kota / Kabupaten",
        url: "/kota",
      },
      {
        name: "Kecamatan",
        url: "/kecamatan",
      },
      {
        name: "Kelurahan / Desa",
        url: "/kelurahan",
      },
    ],
  },
];
