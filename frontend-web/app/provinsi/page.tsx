"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/src/components/Sidebar";
import Navbar from "@/src/components/Navbar";
import { SessionUser, checkSession } from "@/service/auth/authService";
import {
  Search,
  MapPinned,
  RefreshCcw,
  LoaderCircle,
  Database,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  getProvinceExternal,
  syncProvince,
  Province,
} from "@/service/wilayah/wilayahService";

export default function ProvinsiPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [filteredData, setFilteredData] = useState<Province[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const res = await checkSession();

      if (res.status === "authenticated") {
        setUser(res.user ?? null);
      }
    };

    getSession();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getProvinces = async () => {
    try {
      setLoading(true);

      const data = await getProvinceExternal();

      setProvinces(data);
      setFilteredData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProvinces();
  }, []);

  useEffect(() => {
    const result = provinces.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );

    setFilteredData(result);
  }, [search, provinces]);

  const handleSyncProvinsi = async () => {
    if (!user?.kd_user) {
      Swal.fire({
        icon: "warning",
        title: "Session",
        text: "User tidak ditemukan",
      });
      return;
    }

    try {
      setSyncLoading(true);

      await syncProvince(user.kd_user, provinces);

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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Navbar user={user} setSidebarOpen={setSidebarOpen} />

        <main className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Data Provinsi
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Daftar seluruh provinsi di Indonesia
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={getProvinces}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 transition text-gray-700 px-4 py-2 rounded-lg">
                  <RefreshCcw size={18} />
                  Refresh
                </button>

                <button
                  onClick={handleSyncProvinsi}
                  disabled={syncLoading}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 transition text-white px-4 py-2 rounded-lg disabled:opacity-50">
                  {syncLoading ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Database size={18} />
                  )}

                  {syncLoading ? "Sync..." : "Sync Data"}
                </button>
              </div>
            </div>

            <button
              onClick={getProvinces}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 transition text-white px-4 py-2 rounded-lg">
              <RefreshCcw size={18} />
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:max-w-sm">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Cari provinsi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="text-sm text-gray-500">
                Total Data: {filteredData.length}
              </div>
            </div>

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
                        <div className="flex items-center justify-center gap-2 text-gray-500">
                          <LoaderCircle className="animate-spin" size={20} />
                          Loading...
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-10 text-center text-gray-500">
                        Data tidak ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-t border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-4 py-3">{index + 1}</td>

                        <td className="px-4 py-3 font-medium text-gray-700">
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
        </main>
      </div>
    </div>
  );
}
