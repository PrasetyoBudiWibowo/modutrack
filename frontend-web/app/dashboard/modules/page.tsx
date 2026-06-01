"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import Toolbar from "@/src/components/data-table/toolbar";
import { DataTable } from "@/src/components/data-table/data-table";
import { moduleColumns } from "@/src/components/data-table/columns/module/moduleColumns";
import ModalCreateModule from "@/src/components/ui/module/modal/createModule/ModalCreateModule";
import { useModuleStore } from "@/src/store/module/createModule/moduleSlice";
import type { Module } from "@/service/module/moduleService";

export default function ModulePage() {
  const { modules, loadingModule, fetchModules } = useModuleStore();
  const [search, setSearch] = useState("");
  const [showModalCreate, setShowModalCreate] = useState(false);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const filteredData = useMemo(() => {
    return modules.filter((item) =>
      item.nama_module.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, modules]);

  const columns = useMemo(
    () =>
      moduleColumns({
        onEdit: (item: Module) => {
          console.log("edit", item);
        },
        onToggle: (item: Module) => {
          console.log("toggle", item);
        },
      }),
    [],
  );

  return (
    <div className="space-y-6">
      <ModalCreateModule
        show={showModalCreate}
        onClose={() => setShowModalCreate(false)}
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
