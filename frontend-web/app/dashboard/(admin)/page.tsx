"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { iconMap } from "@/src/config/iconMap";
import { useMyModuleStore } from "@/src/store/akses/myModuleSlice";

export default function DashboardPage() {
  const { modules, loading } = useMyModuleStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Pilih module untuk memulai</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-gray-500">
          <LoaderCircle size={20} className="animate-spin" />
          <span>Memuat module...</span>
        </div>
      ) : modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-sm text-gray-500">
          Anda belum memiliki akses ke module apa pun. Hubungi administrator.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((m) => {
            const Icon = m.icon_module ? iconMap[m.icon_module] : null;

            return (
              <Link
                key={m.kd_module}
                href={m.url_module ?? "#"}
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  {Icon && <Icon size={24} />}
                </div>
                <span className="font-semibold text-gray-800">
                  {m.nama_module}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
