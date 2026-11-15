"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import { Plus } from "lucide-react";
import Toolbar from "@/src/components/data-table/toolbar";
import { DataTable } from "@/src/components/data-table/data-table";
import { menuColumns } from "@/src/components/data-table/columns/menu/menuColumns";
import ModalCreateMenu from "@/src/components/ui/menu/ModalCreateMenu";
import ModalEditMenu from "@/src/components/ui/menu/ModalEditMenu";
import { useMenuStore } from "@/src/store/menu/menuSlice";
import { useModuleStore } from "@/src/store/module/createModule/moduleSlice";
import type { Menu } from "@/service/menu/menuService";
import { toggleStatusMenu } from "@/service/menu/menuService";

export default function MenuPage() {
  const { menus, loadingMenu, fetchMenus } = useMenuStore();
  const { modules, fetchModules } = useModuleStore();

  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [showModalCreate, setShowModalCreate] = useState(false);

  const [editItem, setEditItem] = useState<Menu | null>(null);
  const [showModalEdit, setShowModalEdit] = useState(false);

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

  const handleToggle = useCallback(
    async (item: Menu) => {
      const isActive = item.status_akses === "AKTIF";

      const confirm = await Swal.fire({
        title: isActive ? "Nonaktifkan menu?" : "Aktifkan menu?",
        text: item.nama_menu,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
      });
      if (!confirm.isConfirmed) return;

      try {
        const result = await toggleStatusMenu(item.kd_menu);
        if (!result.status) {
          Swal.fire({ icon: "error", title: "Gagal", text: result.message });
          return;
        }
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: result.message,
          timer: 1500,
          showConfirmButton: false,
        });
        await fetchMenus();
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Terjadi kesalahan pada server",
        });
      }
    },
    [fetchMenus],
  );

  const columns = useMemo(
    () =>
      menuColumns({
        menus,
        onEdit: (item: Menu) => {
          setEditItem(item);
          setShowModalEdit(true);
        },
        onToggle: handleToggle,
      }),
    [menus, handleToggle],
  );

  return (
    <div className="space-y-6">
      <ModalCreateMenu
        show={showModalCreate}
        onClose={() => setShowModalCreate(false)}
        onSuccess={fetchMenus}
      />

      <ModalEditMenu
        key={editItem?.kd_menu ?? "none"}
        show={showModalEdit}
        menu={editItem}
        onClose={() => setShowModalEdit(false)}
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
