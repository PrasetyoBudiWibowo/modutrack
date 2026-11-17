"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import ModalShell from "@/src/components/ui/common/ModalShell";
import {
  getRiwayatBlokir,
  type ManagedUser,
  type RiwayatBlokir,
} from "@/service/user/userManagementService";
import { formatDateTime } from "@/src/lib/userStatus";

interface Props {
  user: ManagedUser;
  onClose: () => void;
}

const STATUS_STYLE: Record<RiwayatBlokir["status"], string> = {
  AKTIF: "bg-red-100 text-red-700",
  BERAKHIR: "bg-gray-100 text-gray-600",
  DICABUT: "bg-green-100 text-green-700",
};

export default function ModalRiwayatBlokir({ user, onClose }: Props) {
  const [items, setItems] = useState<RiwayatBlokir[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getRiwayatBlokir(user.kd_user)
      .then((res) => active && setItems(res.data ?? []))
      .catch(console.error)
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [user.kd_user]);

  return (
    <ModalShell
      title="Riwayat Blokir"
      subtitle={user.user_name}
      onClose={onClose}
      maxWidth="max-w-lg"
      footer={
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
          Tutup
        </button>
      }>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
          <LoaderCircle size={18} className="animate-spin" />
          <span>Memuat riwayat...</span>
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          Belum pernah diblokir
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((r, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">
                  {r.jenis === "PERMANEN" ? "Blokir permanen" : "Suspend"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                  {r.status}
                </span>
              </div>
              <p className="mt-1 text-gray-600">{r.alasan}</p>
              <p className="mt-1 text-xs text-gray-400">
                {formatDateTime(r.mulai_at)}
                {r.selesai_at && ` → ${formatDateTime(r.selesai_at)}`} · oleh{" "}
                {r.diblokir_oleh}
              </p>
              {r.status === "DICABUT" && (
                <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-500">
                  Dicabut {formatDateTime(r.dicabut_at)} oleh {r.dicabut_oleh}
                  {r.alasan_cabut && `: ${r.alasan_cabut}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
