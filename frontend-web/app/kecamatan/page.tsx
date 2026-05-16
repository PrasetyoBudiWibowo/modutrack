"use client";

import { useState } from "react";
import AppLayout from "@/src/components/layouts/AppLayout";
import Toolbar from "@/src/components/data-table/toolbar";
import { DataTable } from "@/src/components/data-table/data-table";
import { useDistrict } from "@/src/store/wilayah/kecamatanSlice";
import { useAuthStore } from "@/src/store/auth/authStore";
import { districtColumns } from "@/src/components/data-table/columns/district/districtColumns";
import FetchProgressModal from "@/src/components/ui/FetchProgressModal";
import { Database, LoaderCircle } from "lucide-react";
import { syncDistrict } from "@/service/wilayah/wilayahService";
import { toast } from "sonner";
import Swal from "sweetalert2";
import LoadingModal from "@/src/components/ui/LoadingModal";

export default function DistrictPage() {
  const {
    filteredData,
    search,
    setSearch,
    loading,
    getDistrict,
    district,
    fetchProgress,
  } = useDistrict();

  const { sessionUser } = useAuthStore();
  const [syncLoading, setSyncLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const handleSyncDistrict = async () => {
    if (!sessionUser?.kd_user) {
      Swal.fire({
        icon: "warning",
        title: "Session",
        text: "User tidak ditemukan",
      });
      return;
    }

    if (district.length === 0) {
      toast.warning("Tidak ada data untuk disync");
      return;
    }

    try {
      setSyncLoading(true);
      setLoadingSave(true);
      await syncDistrict(sessionUser.kd_user, district);
      toast.success("Data kecamatan berhasil disimpan");
      await getDistrict();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal Sync",
        text: "Terjadi kesalahan saat menyimpan data kecamatan",
      });
    } finally {
      setSyncLoading(false);
      setLoadingSave(false);
    }
  };

  return (
    <AppLayout>
      <FetchProgressModal progress={fetchProgress} />
      <LoadingModal
        show={loadingSave}
        title="Menyimpan Data Kecamatan"
        description={`Sedang menyimpan ${district.length.toLocaleString("id-ID")} kecamatan ke database...`}
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            onClick={handleSyncDistrict}
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
          onRefresh={getDistrict}
        />
        <DataTable
          columns={districtColumns}
          data={filteredData}
          loading={loading}
          title="Data Kecamatan"
          description="Daftar seluruh kecamatan di Indonesia"
        />
      </div>
    </AppLayout>
  );
}
