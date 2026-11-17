"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import Swal from "sweetalert2";
import ModalShell from "@/src/components/ui/common/ModalShell";
import {
  cabutBlokirUser,
  type ManagedUser,
} from "@/service/user/userManagementService";
import { getErrorMessage } from "@/src/lib/errorMessage";
import { formatDateTime } from "@/src/lib/userStatus";

interface Props {
  user: ManagedUser;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalCabutBlokir({ user, onClose, onSuccess }: Props) {
  const [alasan, setAlasan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const b = user.blokir_aktif;

  const handleSave = async () => {
    if (alasan.trim().length < 5) {
      setError("Alasan minimal 5 karakter");
      return;
    }

    try {
      setLoading(true);

      const result = await cabutBlokirUser(user.kd_user, alasan);

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
      title="Cabut Blokir"
      subtitle={user.user_name}
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
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            {loading ? "Memproses..." : "Cabut Blokir"}
          </button>
        </>
      }>
      <div className="space-y-4">
        {b ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
            <p className="font-medium text-gray-800">
              {b.jenis === "PERMANEN" ? "Blokir permanen" : "Suspend"}
            </p>
            <p className="mt-1 text-gray-600">{b.alasan}</p>
            <p className="mt-1 text-xs text-gray-400">
              Sejak {formatDateTime(b.mulai_at)}
              {b.selesai_at && ` · sampai ${formatDateTime(b.selesai_at)}`}
            </p>
          </div>
        ) : (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            User ini bertanda diblokir tanpa catatan riwayat (data lama).
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Alasan pencabutan <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            maxLength={500}
            value={alasan}
            onChange={(e) => {
              setAlasan(e.target.value);
              setError("");
            }}
            placeholder="Jelaskan alasan pencabutan"
            className={`w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </ModalShell>
  );
}
