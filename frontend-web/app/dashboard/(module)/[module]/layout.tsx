"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/src/components/layouts/AppLayout";
import type { MenuItem } from "@/src/config/menu";
import { buildSidebarMenu } from "@/src/lib/menuTree";
import { useModuleMenuStore } from "@/src/store/module/moduleMenu/moduleMenuSlice";

export default function ModuleLayout({ children }: { children: ReactNode }) {
  const { module: slug } = useParams<{ module: string }>();
  const { moduleInfo, menus, fetchModuleMenus } = useModuleMenuStore();

  useEffect(() => {
    fetchModuleMenus(slug);
  }, [slug, fetchModuleMenus]);

  const menuItems = useMemo<MenuItem[]>(
    () => [
      { name: "Dashboard Utama", url: "/dashboard", icon: "ArrowLeft" },
      {
        name: `Beranda ${moduleInfo?.nama_module ?? ""}`.trim(),
        url: `/dashboard/${slug}`,
        icon: "LayoutDashboard",
      },
      ...buildSidebarMenu(menus),
    ],
    [slug, moduleInfo, menus],
  );

  return (
    <AppLayout
      menuItems={menuItems}
      title={moduleInfo?.nama_module ?? "Module"}>
      {children}
    </AppLayout>
  );
}
