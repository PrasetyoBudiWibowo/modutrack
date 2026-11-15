import type { Menu } from "@/service/menu/menuService";
import type { MenuItem } from "@/src/config/menu";
import type { IconKey } from "@/src/config/iconMap";
import type { ModuleMenuItem } from "@/service/module/moduleService";

export type FlatMenu = {
  kd_menu: string;
  nama_menu: string;
  level: number;
  is_group: boolean;
};

export const flattenMenus = (
  menus: Menu[],
  kd_module: string,
  parentId: string | null = null,
  level = 0,
): FlatMenu[] =>
  menus
    .filter((m) => m.parent_menu === parentId && m.kd_module === kd_module)
    .flatMap((m) => [
      {
        kd_menu: m.kd_menu,
        nama_menu: m.nama_menu,
        level,
        is_group: !m.url_menu,
      },
      ...flattenMenus(menus, kd_module, m.kd_menu, level + 1),
    ]);

export const getDescendantIds = (menus: Menu[], kd_menu: string): string[] => {
  const children = menus.filter((m) => m.parent_menu === kd_menu);
  return children.flatMap((c) => [
    c.kd_menu,
    ...getDescendantIds(menus, c.kd_menu),
  ]);
};

export const buildSidebarMenu = (
  menus: ModuleMenuItem[],
  parent: string | null = null,
): MenuItem[] =>
  menus
    .filter((m) => m.parent_menu === parent)
    .map((m) => {
      const children = buildSidebarMenu(menus, m.kd_menu);
      return {
        name: m.nama_menu,
        url: m.url_menu ?? undefined,
        icon: (m.icon_menu ?? undefined) as IconKey | undefined,
        children: children.length > 0 ? children : undefined,
      };
    })
    .filter((item) => item.url || item.children);
