"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import Swal from "sweetalert2";
import ModalShell from "@/src/components/ui/common/ModalShell";
import {
  hapusPerusahaan,
  type Perusahaan,
} from "@/service/hrd/perusahaanService";
import { getErrorMessage } from "@/src/lib/errorMessage";

interface Props {
  item: Perusahaan;
  jumlahUnit: number; // unit ini ditambah seluruh turunannya
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalHapusPerusahaan({
  item,
  jumlahUnit,
  onClose,
  onSuccess,
}: Props) {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);

  const cocok = nama.trim().toLowerCase() === item.nama.toLowerCase();

  const handleDelete = async () => {
    try {
      setLoading(true);

      const result = await hapusPerusahaan(item.kd_perusahaan, nama);

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
      title="Hapus"
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
            onClick={handleDelete}
            disabled={loading || !cocok}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ef4444] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50">
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            {loading ? "Menghapus..." : "Hapus Permanen"}
          </button>
        </>
      }>
      <div className="space-y-4">
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {jumlahUnit > 1
            ? `Ini akan menghapus ${jumlahUnit} unit: unit ini beserta seluruh cabang di bawahnya, termasuk riwayatnya. `
            : "Unit ini akan dihapus beserta riwayatnya. "}
          Tindakan ini tidak dapat dibatalkan. Untuk menutup unit tanpa
          menghapus datanya, gunakan Nonaktifkan.
        </p>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Ketik <span className="font-semibold">{item.nama}</span> untuk
            konfirmasi
          </label>
          <input
            type="text"
            value={nama}
            autoFocus
            onChange={(e) => setNama(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
    </ModalShell>
  );
}
