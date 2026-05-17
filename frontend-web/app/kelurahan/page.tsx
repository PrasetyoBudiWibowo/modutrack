"use client";

import { useState } from "react";
import AppLayout from "@/src/components/layouts/AppLayout";
import { Database } from "lucide-react";
import { LoaderCircle } from "lucide-react";
import Toolbar from "@/src/components/data-table/toolbar";
import { DataTable } from "@/src/components/data-table/data-table";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useVillage } from "@/src/store/wilayah/desaKelurahan";
import { villageColumns } from "@/src/components/data-table/columns/village/villageColumns";
import { syncVillage } from "@/service/wilayah/wilayahService";
import FetchProgressModal from "@/src/components/ui/FetchProgressModal";
import LoadingModal from "@/src/components/ui/LoadingModal";
import { useAuthStore } from "@/src/store/auth/authStore";

export default function VillagePage() {
  const {
    filteredData,
    search,
    setSearch,
    loading,
    getVillage,
    village,
    fetchProgress,
  } = useVillage();

  const { sessionUser } = useAuthStore();
  const [syncLoading, setSyncLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const handleSyncVillage = async () => {
    if (!sessionUser?.kd_user) {
      Swal.fire({
        icon: "warning",
        title: "Session",
        text: "User tidak ditemukan",
      });
      return;
    }

    if (village.length === 0) {
      toast.warning("Tidak ada data untuk disync");
      return;
    }

    try {
      setSyncLoading(true);
      setLoadingSave(true);
      await syncVillage(sessionUser.kd_user, village);
      toast.success("Data kelurahan/desa berhasil disimpan");
      await getVillage();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal Sync",
        text: "Terjadi kesalahan saat menyimpan data kelurahan/desa",
      });
    } finally {
      setSyncLoading(false);
      setLoadingSave(false);
    }
  };

  return (
    <AppLayout>
      <FetchProgressModal
        progress={fetchProgress}
        title="Mengambil Data Kelurahan / Desa"
      />

      <LoadingModal
        show={loadingSave}
        title="Menyimpan Data Kelurahan / Desa"
        description={`Sedang menyimpan ${village.length.toLocaleString("id-ID")} kelurahan/desa ke database...`}
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            onClick={handleSyncVillage}
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
          onRefresh={getVillage}
        />
        <DataTable
          columns={villageColumns}
          data={filteredData}
          loading={loading}
          title="Data Kelurahan / Desa"
          description="Daftar seluruh kelurahan dan desa di Indonesia"
        />
      </div>
    </AppLayout>
  );
}
