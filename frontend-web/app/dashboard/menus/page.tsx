"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import Toolbar from "@/src/components/data-table/toolbar";
import { DataTable } from "@/src/components/data-table/data-table";
import { menuColumns } from "@/src/components/data-table/columns/menu/menuColumns";
import ModalCreateMenu from "@/src/components/ui/menu/ModalCreateMenu";
import { useMenuStore } from "@/src/store/menu/menuSlice";
import { useModuleStore } from "@/src/store/module/createModule/moduleSlice";
import type { Menu } from "@/service/menu/menuService";

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

  const columns = useMemo(
    () =>
      menuColumns({
        menus,
        onEdit: (item: Menu) => {
          // TODO: modal edit
          console.log("edit", item);
        },
        onToggle: (item: Menu) => {
          // TODO: toggle status
          console.log("toggle", item);
        },
      }),
    [menus],
  );

  return (
    <div className="space-y-6">
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
      <Toolbar
        search={search}
        setSearch={setSearch}
        totalData={filteredData.length}
        loading={loadingMenu}
        onRefresh={fetchMenus}>
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

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loadingMenu}
        title="Daftar Menu"
        description="Kelola menu aplikasi"
      />
    </div>
  );
}
