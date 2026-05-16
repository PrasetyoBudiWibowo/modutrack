"use client";

import { useState } from "react";
import AppLayout from "@/src/components/layouts/AppLayout";
import { useProvinsi } from "@/src/store/wilayah/provinsiSlice";
import { Database, LoaderCircle } from "lucide-react";
import Toolbar from "@/src/components/data-table/toolbar";
import { DataTable } from "@/src/components/data-table/data-table";
import { provinsiColumns } from "@/src/components/data-table/columns/province/provinsiColumns";
import { syncProvince } from "@/service/wilayah/wilayahService";
import { useAuthStore } from "@/src/store/auth/authStore";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function ProvinsiPage() {
  const { filteredData, search, setSearch, loading, getProvinces, provinces } =
    useProvinsi();

  const { sessionUser } = useAuthStore();
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSyncProvinsi = async () => {
    if (!sessionUser?.kd_user) {
      Swal.fire({
        icon: "warning",
        title: "Session",
        text: "User tidak ditemukan",
      });
      return;
    }

    if (provinces.length === 0) {
      toast.warning("Tidak ada data untuk disync");
      return;
    }

    try {
      setSyncLoading(true);
      await syncProvince(sessionUser.kd_user, provinces);
      toast.success("Data provinsi berhasil disimpan");
      await getProvinces();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal Sync",
        text: "Terjadi kesalahan saat menyimpan data provinsi",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            onClick={handleSyncProvinsi}
            disabled={syncLoading || loading}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
            {syncLoading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Database size={18} />
            )}
            <span>{syncLoading ? "Menyimpan..." : "Sync Data"}</span>
          </button>
        </div>
        <Toolbar
          search={search}
          setSearch={setSearch}
          totalData={filteredData.length}
          loading={loading}
          onRefresh={getProvinces}
        />
        <DataTable
          columns={provinsiColumns}
          data={filteredData}
          loading={loading}
          title="Data Provinsi"
          description="Daftar seluruh provinsi di Indonesia"
        />
      </div>
    </AppLayout>
  );
}
