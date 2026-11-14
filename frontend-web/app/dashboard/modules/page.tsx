"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import Toolbar from "@/src/components/data-table/toolbar";
import Swal from "sweetalert2";
import { DataTable } from "@/src/components/data-table/data-table";
import { moduleColumns } from "@/src/components/data-table/columns/module/moduleColumns";
import ModalCreateModule from "@/src/components/ui/module/modal/createModule/ModalCreateModule";
import ModalEditModule from "@/src/store/module/editeModule/ModalEditModule";
import { useModuleStore } from "@/src/store/module/createModule/moduleSlice";
import type { Module } from "@/service/module/moduleService";
import { useAuthStore } from "@/src/store/auth/authStore";
import { toggleStatusModule } from "@/service/module/moduleService";

export default function ModulePage() {
  const { modules, loadingModule, fetchModules } = useModuleStore();
  const { sessionUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [editItem, setEditItem] = useState<Module | null>(null);
  const [showModalEdit, setShowModalEdit] = useState(false);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const filteredData = useMemo(() => {
    return modules.filter((item) =>
      item.nama_module.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, modules]);

  const handleToggle = async (item: Module) => {
    if (!sessionUser?.kd_user) {
      Swal.fire({
        icon: "warning",
        title: "Session",
        text: "User tidak ditemukan",
      });
      return;
    }

    const isActive = item.status_module === "AKTIF";

    const confirm = await Swal.fire({
      title: isActive ? "Nonaktifkan module?" : "Aktifkan module?",
      text: item.nama_module,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const result = await toggleStatusModule(
        item.kd_module,
        sessionUser.kd_user,
      );

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

      await fetchModules();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan pada server",
      });
    }
  };

  const columns = useMemo(
    () =>
      moduleColumns({
        onEdit: (item: Module) => {
          setEditItem(item);
          setShowModalEdit(true);
        },
        onToggle: handleToggle,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionUser],
  );

  return (
    <div className="space-y-6">
      <ModalCreateModule
        show={showModalCreate}
        onClose={() => setShowModalCreate(false)}
        onSuccess={fetchModules}
      />

      <ModalEditModule
        key={editItem?.kd_module ?? "none"}
        show={showModalEdit}
        module={editItem}
        onClose={() => setShowModalEdit(false)}
        onSuccess={fetchModules}
      />

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Module</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola module aplikasi</p>
        </div>

        <button
          onClick={() => setShowModalCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">
          <Plus size={18} />
          <span>Tambah Module</span>
        </button>
      </div>

      {/* TOOLBAR */}
      <Toolbar
        search={search}
        setSearch={setSearch}
        totalData={filteredData.length}
        loading={loadingModule}
        onRefresh={fetchModules}
      />

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loadingModule}
        title="Daftar Module"
        description="Kelola module aplikasi"
      />
    </div>
  );
}
