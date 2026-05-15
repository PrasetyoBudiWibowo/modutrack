"use client";

import Swal from "sweetalert2";
import {
  Search,
  MapPinned,
  RefreshCcw,
  LoaderCircle,
  Database,
} from "lucide-react";
import AppLayout from "@/src/components/layouts/AppLayout";
import { syncProvince } from "@/service/wilayah/wilayahService";
import { useProvinsi } from "@/src/store/wilayah/provinsiSlice";
import { useState } from "react";
import { useAuthStore } from "@/src/store/auth/authStore";

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

    try {
      setSyncLoading(true);
      await syncProvince(sessionUser.kd_user, provinces);
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data provinsi berhasil disimpan",
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal sync data provinsi",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <AppLayout>
      {/* HEADER */}
      <div
        className="
          flex flex-col
          md:flex-row md:items-center md:justify-between
          gap-4
        ">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Provinsi</h1>

          <p className="text-sm text-gray-500 mt-1">
            Daftar seluruh provinsi di Indonesia
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={getProvinces}
            disabled={loading}
            className="
              flex items-center justify-center gap-2
              bg-white border border-gray-300
              hover:bg-gray-50
              transition
              text-gray-700
              px-4 py-2 rounded-lg
              disabled:opacity-50
            ">
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleSyncProvinsi}
            disabled={syncLoading}
            className="
              flex items-center justify-center gap-2
              bg-blue-500 hover:bg-blue-600
              transition
              text-white
              px-4 py-2 rounded-lg
              disabled:opacity-50
            ">
            {syncLoading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Database size={18} />
            )}

            {syncLoading ? "Sync..." : "Sync Data"}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div
        className="
          bg-white rounded-2xl
          shadow-sm border border-gray-200
          overflow-hidden
        ">
        {/* TOP BAR */}
        <div
          className="
            p-4 border-b border-gray-200
            flex flex-col
            md:flex-row md:items-center md:justify-between
            gap-4
          ">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Cari provinsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                border border-gray-300
                rounded-lg
                pl-10 pr-4 py-2
                focus:outline-none
                focus:ring-2 focus:ring-blue-400
              "
            />
          </div>

          <div className="text-sm text-gray-500">
            Total Data: {filteredData.length}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left w-20">No</th>

                <th className="px-4 py-3 text-left">Kode</th>

                <th className="px-4 py-3 text-left">Nama Provinsi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center">
                    <div
                      className="
                        flex items-center justify-center
                        gap-2 text-gray-500
                      ">
                      <LoaderCircle className="animate-spin" size={20} />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="
                      py-10 text-center text-gray-500
                    ">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="
                      border-t border-gray-100
                      hover:bg-gray-50
                      transition
                    ">
                    <td className="px-4 py-3">{index + 1}</td>

                    <td
                      className="
                        px-4 py-3
                        font-medium text-gray-700
                      ">
                      {item.id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPinned size={16} className="text-blue-500" />

                        {item.name}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
