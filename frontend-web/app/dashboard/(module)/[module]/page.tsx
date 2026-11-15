"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useModuleMenuStore } from "@/src/store/module/moduleMenu/moduleMenuSlice";
import { buildSidebarMenu } from "@/src/lib/menuTree";
import { iconMap } from "@/src/config/iconMap";
import type { MenuItem } from "@/src/config/menu";

const leaves = (item: MenuItem): MenuItem[] =>
  item.children ? item.children.flatMap(leaves) : [item];

export default function ModuleHomePage() {
  const { moduleInfo, menus, loading, notFound, forbidden } =
    useModuleMenuStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-gray-500">
        <LoaderCircle size={20} className="animate-spin" />
        <span>Memuat module...</span>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="py-24 text-center text-gray-500">
        Anda tidak memiliki akses ke module ini
      </div>
    );
  }

  if (notFound || !moduleInfo) {
    return (
      <div className="py-24 text-center text-gray-500">
        Module tidak ditemukan atau tidak aktif
      </div>
    );
  }

  const tree = buildSidebarMenu(menus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {moduleInfo.nama_module}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Pilih menu untuk memulai</p>
      </div>

      {tree.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-500">
          Belum ada menu di module ini
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tree.map((group) => {
            const GroupIcon = group.icon ? iconMap[group.icon] : null;

            return (
              <div
                key={group.name}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  {GroupIcon && (
                    <GroupIcon size={18} className="text-blue-500" />
                  )}
                  <h2 className="font-semibold text-gray-800">{group.name}</h2>
                </div>

                <div className="space-y-1">
                  {leaves(group).map((leaf) => (
                    <Link
                      key={leaf.url}
                      href={leaf.url!}
                      className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100">
                      {leaf.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
