"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import Swal from "sweetalert2";
import ModalShell from "@/src/components/ui/common/ModalShell";
import {
  aktifkanPerusahaan,
  nonaktifkanPerusahaan,
  type Perusahaan,
} from "@/service/hrd/perusahaanService";
import { getErrorMessage } from "@/src/lib/errorMessage";
import { todayLocal } from "@/src/lib/format";

interface Props {
  item: Perusahaan;
  aktif: boolean; // true = akan diaktifkan kembali
  anakAktif: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalStatusPerusahaan({
  item,
  aktif,
  anakAktif,
  onClose,
  onSuccess,
}: Props) {
  const [tgl, setTgl] = useState(todayLocal());
  const [alasan, setAlasan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const terblokir = !aktif && anakAktif > 0;

  const handleSave = async () => {
    if (!aktif && alasan.trim().length < 5) {
      setError("Alasan minimal 5 karakter");
      return;
    }

    try {
      setLoading(true);

      const data = { tgl_berlaku: tgl, alasan };
      const result = aktif
        ? await aktifkanPerusahaan(item.kd_perusahaan, data)
        : await nonaktifkanPerusahaan(item.kd_perusahaan, data);

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
      title={aktif ? "Aktifkan Kembali" : "Nonaktifkan"}
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
            disabled={loading || terblokir}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              aktif
                ? "bg-[#16a34a] hover:bg-[#15803d]"
                : "bg-[#ef4444] hover:bg-[#dc2626]"
            }`}>
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            {loading ? "Memproses..." : aktif ? "Aktifkan" : "Nonaktifkan"}
          </button>
        </>
      }>
      <div className="space-y-4">
        {terblokir && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Masih ada {anakAktif} cabang aktif di bawah unit ini. Nonaktifkan
            atau pindahkan cabang tersebut terlebih dahulu.
          </p>
        )}

        {!aktif && !terblokir && (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Data tidak dihapus. Unit ini hanya ditandai nonaktif dan tanggal
            tutupnya diisi sesuai tanggal di bawah.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {aktif ? "Aktif mulai" : "Tanggal tutup"}
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
              Alasan {!aktif && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={alasan}
              maxLength={500}
              onChange={(e) => {
                setAlasan(e.target.value);
                setError("");
              }}
              className={`w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
