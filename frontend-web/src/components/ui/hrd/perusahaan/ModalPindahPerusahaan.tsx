"use client";

import { useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import Swal from "sweetalert2";
import ModalShell from "@/src/components/ui/common/ModalShell";
import {
  pindahPerusahaan,
  type Perusahaan,
} from "@/service/hrd/perusahaanService";
import { descendantIds, flattenTree } from "@/src/lib/perusahaanTree";
import { getErrorMessage } from "@/src/lib/errorMessage";
import { todayLocal } from "@/src/lib/format";

interface Props {
  item: Perusahaan;
  semua: Perusahaan[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalPindahPerusahaan({
  item,
  semua,
  onClose,
  onSuccess,
}: Props) {
  const [kdInduk, setKdInduk] = useState("");
  const [tgl, setTgl] = useState(todayLocal());
  const [alasan, setAlasan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const indukSekarang = semua.find((p) => p.kd_perusahaan === item.kd_induk);

  const pilihan = useMemo(() => {
    const dikecualikan = new Set([
      item.kd_perusahaan,
      ...descendantIds(semua, item.kd_perusahaan),
    ]);

    return flattenTree(semua).filter(
      (n) =>
        n.item.status === "AKTIF" &&
        !dikecualikan.has(n.item.kd_perusahaan) &&
        n.item.kd_perusahaan !== item.kd_induk,
    );
  }, [semua, item]);

  const handleSave = async () => {
    if (!kdInduk) {
      setError("Induk baru harus dipilih");
      return;
    }

    try {
      setLoading(true);

      const result = await pindahPerusahaan(item.kd_perusahaan, {
        kd_induk: kdInduk,
        tgl_berlaku: tgl,
        alasan,
      });

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

      onClose();
      onSuccess();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Pindahkan"
      subtitle={item.nama}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50">
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            {loading ? "Memproses..." : "Pindahkan"}
          </button>
        </>
      }>
      <div className="space-y-4">
        <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Saat ini di bawah{" "}
          <span className="font-medium text-gray-800">
            {indukSekarang?.nama ?? "-"}
          </span>
          . Seluruh cabang di bawah unit ini ikut pindah.
        </p>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Induk baru <span className="text-red-500">*</span>
          </label>
          <select
            value={kdInduk}
            onChange={(e) => {
              setKdInduk(e.target.value);
              setError("");
            }}
            className={`w-full rounded-lg border bg-white px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              error ? "border-red-500" : "border-gray-300"
            }`}>
            <option value="">-- Pilih induk --</option>
            {pilihan.map((n) => (
              <option key={n.item.kd_perusahaan} value={n.item.kd_perusahaan}>
                {"\u00A0\u00A0".repeat(n.level * 2)}
                {n.level > 0 ? "└ " : ""}
                {n.item.nama} [{n.item.kode_cabang}]
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Berlaku mulai
            </label>
            <input
              type="date"
              value={tgl}
              onChange={(e) => setTgl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Alasan
            </label>
            <input
              type="text"
              value={alasan}
              maxLength={500}
              onChange={(e) => setAlasan(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
