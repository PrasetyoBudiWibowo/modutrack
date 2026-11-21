"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import ModalShell from "@/src/components/ui/common/ModalShell";
import { ChoiceButton } from "@/src/components/ui/common/FormParts";
import {
  createTipePerusahaan,
  type TipePerusahaanInput,
} from "@/service/hrd/tipePerusahaanService";
import { getErrorMessage } from "@/src/lib/errorMessage";

interface Props {
  pertama: boolean; // true jika ini tipe pertama yang dibuat
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalCreateTipePerusahaan({
  pertama,
  onClose,
  onSuccess,
}: Props) {
  const [input, setInput] = useState<TipePerusahaanInput>({
    nama: "",
    boleh_badan_hukum: "TIDAK",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!input.nama.trim()) {
      setErrors({ nama: "Nama tipe tidak boleh kosong" });
      return;
    }

    try {
      setLoading(true);

      const result = await createTipePerusahaan(input);

      if (!result.status) {
        Swal.fire({ icon: "error", title: "Gagal", text: result.message });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: pertama
          ? "Tipe pertama sudah ada. Lanjut ke Perusahaan & Cabang untuk membuat grup utama."
          : result.message,
        timer: pertama ? 3000 : 1500,
        showConfirmButton: false,
      });

      onClose();
      onSuccess();
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 422 &&
        error.response.data?.errors
      ) {
        const server = error.response.data.errors as Record<string, string[]>;
        const mapped: Record<string, string> = {};
        for (const key in server) mapped[key] = server[key][0];
        setErrors(mapped);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: getErrorMessage(error),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Tambah Tipe"
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
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </>
      }>
      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nama Tipe <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={input.nama}
            maxLength={100}
            autoFocus
            placeholder="Contoh: Perusahaan, Cabang"
            onChange={(e) => {
              setInput((p) => ({ ...p, nama: e.target.value }));
              setErrors((p) => ({ ...p, nama: "" }));
            }}
            className={`w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.nama ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.nama && (
            <p className="mt-1 text-xs text-red-500">{errors.nama}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            Gunakan istilah yang dipakai di perusahaan Anda. Contoh di atas
            hanya petunjuk, tidak tersimpan.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Boleh berbadan hukum sendiri?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <ChoiceButton
              title="Ya"
              desc="Bisa mengisi NPWP dan data akta"
              selected={input.boleh_badan_hukum === "YA"}
              onClick={() =>
                setInput((p) => ({ ...p, boleh_badan_hukum: "YA" }))
              }
            />
            <ChoiceButton
              title="Tidak"
              desc="Selalu ikut badan hukum induk"
              selected={input.boleh_badan_hukum === "TIDAK"}
              onClick={() =>
                setInput((p) => ({ ...p, boleh_badan_hukum: "TIDAK" }))
              }
            />
          </div>
          {errors.boleh_badan_hukum && (
            <p className="mt-1 text-xs text-red-500">
              {errors.boleh_badan_hukum}
            </p>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
