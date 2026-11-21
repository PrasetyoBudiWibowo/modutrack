"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import ModalShell from "@/src/components/ui/common/ModalShell";
import {
  getRiwayatPerusahaan,
  type Perusahaan,
  type RiwayatPerusahaan,
} from "@/service/hrd/perusahaanService";
import { formatTanggal } from "@/src/lib/format";

interface Props {
  item: Perusahaan;
  onClose: () => void;
}

const LABEL: Record<string, string> = {
  nama: "Nama",
  kode_cabang: "Kode cabang",
  kd_tipe_perusahaan: "Tipe",
  kd_induk: "Induk",
  nama_induk: "Nama induk",
  badan_hukum_sendiri: "Badan hukum sendiri",
  nama_badan_hukum: "Nama badan hukum",
  npwp: "NPWP",
  no_akta: "No. akta",
  kd_provinsi: "Provinsi",
  kd_kabupaten_kota: "Kabupaten/kota",
  kd_kecamatan: "Kecamatan",
  mode_desa: "Cara isi desa",
  kd_village: "Desa/kelurahan",
  nama_desa_manual: "Desa/kelurahan (tulis sendiri)",
  alamat_rinci: "Alamat rinci",
  kode_pos: "Kode pos",
  status: "Status",
  tgl_tutup: "Tanggal tutup",
};

const tampil = (v: unknown): string =>
  v === null || v === undefined || v === "" ? "(kosong)" : String(v);

export default function ModalRiwayatPerusahaan({ item, onClose }: Props) {
  const [rows, setRows] = useState<RiwayatPerusahaan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aktif = true;

    getRiwayatPerusahaan(item.kd_perusahaan)
      .then((res) => aktif && setRows(res.data ?? []))
      .catch(console.error)
      .finally(() => aktif && setLoading(false));

    return () => {
      aktif = false;
    };
  }, [item.kd_perusahaan]);

  return (
    <ModalShell
      title="Riwayat Perubahan"
      subtitle={item.nama}
      maxWidth="max-w-xl"
      onClose={onClose}
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
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          Belum ada riwayat
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => {
            const awal = r.jenis_kode === "DIBUAT";
            const kunci = Object.keys(r.nilai_baru ?? {}).filter(
              (k) => k in LABEL,
            );

            return (
              <div
                key={i}
                className="rounded-lg border border-gray-200 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-gray-800">
                    {r.jenis_nama ?? r.jenis_kode}
                  </span>
                  <span className="text-xs text-gray-400">
                    Berlaku {formatTanggal(r.tgl_berlaku)}
                  </span>
                </div>

                {awal ? (
                  <p className="mt-1 text-gray-600">
                    Dibuat dengan nama {tampil(r.nilai_baru?.nama)}, kode{" "}
                    {tampil(r.nilai_baru?.kode_cabang)}.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {kunci.map((k) => (
                      <li key={k} className="text-gray-600">
                        <span className="text-gray-500">{LABEL[k]}:</span>{" "}
                        {tampil(r.nilai_lama?.[k])}{" "}
                        <span className="text-gray-400">→</span>{" "}
                        <span className="font-medium text-gray-800">
                          {tampil(r.nilai_baru?.[k])}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {r.alasan && (
                  <p className="mt-2 text-gray-600">Alasan: {r.alasan}</p>
                )}

                <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-400">
                  Dicatat oleh {r.dicatat_oleh} · {r.dicatat_pada}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </ModalShell>
  );
}
