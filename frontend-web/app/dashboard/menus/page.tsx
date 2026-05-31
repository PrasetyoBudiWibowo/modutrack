"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  LoaderCircle,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Toolbar from "@/src/components/data-table/toolbar";
import ModalCreateMenu from "@/src/components/ui/menu/ModalCreateMenu";
import { useMenuStore } from "@/src/store/menu/menuSlice";
import { useModuleStore } from "@/src/store/module/createModule/moduleSlice";

export default function MenuPage() {
  const { menus, loadingMenu, fetchMenus } = useMenuStore();
  const { modules, fetchModules } = useModuleStore();

  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [showModalCreate, setShowModalCreate] = useState(false);

  useEffect(() => {
    fetchMenus();
    fetchModules();
  }, [fetchMenus, fetchModules]);

  const filteredData = useMemo(() => {
    return menus.filter((item) => {
      const matchSearch = item.nama_menu
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchModule = filterModule ? item.kd_module === filterModule : true;
      return matchSearch && matchModule;
    });
  }, [search, filterModule, menus]);

  return (
    <div className="space-y-6">
      {/* MODAL CREATE */}
      <ModalCreateMenu
        show={showModalCreate}
        onClose={() => setShowModalCreate(false)}
        onSuccess={fetchMenus}
      />

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Menu</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola menu aplikasi</p>
        </div>

        <button
          onClick={() => setShowModalCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">
          <Plus size={18} />
          <span>Tambah Menu</span>
        </button>
      </div>

      {/* TOOLBAR + FILTER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1">
          <Toolbar
            search={search}
            setSearch={setSearch}
            totalData={filteredData.length}
            loading={loadingMenu}
            onRefresh={fetchMenus}>
            {/* FILTER MODULE */}
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white min-w-[160px]">
              <option value="">Semua Module</option>
              {modules.map((m) => (
                <option key={m.kd_module} value={m.kd_module}>
                  {m.nama_module}
                </option>
              ))}
            </select>
          </Toolbar>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  No
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Module
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Nama Menu
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Parent
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Icon
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  URL
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Urutan
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingMenu ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <LoaderCircle size={20} className="animate-spin" />
                      <span>Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-500">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.kd_menu}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.module?.nama_module ?? item.kd_module}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {item.nama_menu}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.parent?.nama_menu ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.icon_menu ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.url_menu ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.urutan}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.status_akses === "AKTIF"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {item.status_akses}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {}}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition">
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => {}}
                          className={`p-1.5 rounded-lg transition ${
                            item.status_akses === "AKTIF"
                              ? "text-green-500 hover:bg-green-50"
                              : "text-gray-400 hover:bg-gray-50"
                          }`}>
                          {item.status_akses === "AKTIF" ? (
                            <ToggleRight size={20} />
                          ) : (
                            <ToggleLeft size={20} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
