"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRightLeft,
  Building2,
  ChevronDown,
  ChevronRight,
  History,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import SetupSteps from "@/src/components/ui/common/SetupSteps";
import HelpPanel from "@/src/components/ui/common/HelpPanel";
import ModalCreatePerusahaan from "@/src/components/ui/hrd/perusahaan/ModalCreatePerusahaan";
import ModalEditPerusahaan from "@/src/components/ui/hrd/perusahaan/ModalEditPerusahaan";
import ModalPindahPerusahaan from "@/src/components/ui/hrd/perusahaan/ModalPindahPerusahaan";
import ModalStatusPerusahaan from "@/src/components/ui/hrd/perusahaan/ModalStatusPerusahaan";
import ModalRiwayatPerusahaan from "@/src/components/ui/hrd/perusahaan/ModalRiwayatPerusahaan";
import ModalHapusPerusahaan from "@/src/components/ui/hrd/perusahaan/ModalHapusPerusahaan";
import { descendantIds } from "@/src/lib/perusahaanTree";
import {
  getOpsiTipe,
  getPerusahaan,
  type OpsiTipe,
  type Perusahaan,
} from "@/service/hrd/perusahaanService";
import { useMyModuleStore } from "@/src/store/akses/myModuleSlice";

export default function PerusahaanPage() {
  const { module: slug } = useParams<{ module: string }>();
  const {
    isSuperAdmin,
    loading: loadingAkses,
    fetchMyModules,
  } = useMyModuleStore();

  useEffect(() => {
    fetchMyModules();
  }, [fetchMyModules]);

  const [items, setItems] = useState<Perusahaan[]>([]);
  const [tipe, setTipe] = useState<OpsiTipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [tampilNonaktif, setTampilNonaktif] = useState(true);
  const [tertutup, setTertutup] = useState<Set<string>>(new Set());
  const [hapus, setHapus] = useState<Perusahaan | null>(null);

  const [buat, setBuat] = useState<{ induk: Perusahaan | null } | null>(null);
  const [ubah, setUbah] = useState<Perusahaan | null>(null);
  const [pindah, setPindah] = useState<Perusahaan | null>(null);
  const [status, setStatus] = useState<{
    item: Perusahaan;
    aktif: boolean;
  } | null>(null);
  const [riwayat, setRiwayat] = useState<Perusahaan | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([getPerusahaan(), getOpsiTipe()]);
      setItems(p.data ?? []);
      setTipe(t.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tampil = useMemo(
    () => (tampilNonaktif ? items : items.filter((p) => p.status === "AKTIF")),
    [items, tampilNonaktif],
  );

  const anak = useMemo(() => {
    const m = new Map<string | null, Perusahaan[]>();

    for (const p of tampil) {
      m.set(p.kd_induk, [...(m.get(p.kd_induk) ?? []), p]);
    }

    m.forEach((list) => list.sort((a, b) => a.nama.localeCompare(b.nama)));

    return m;
  }, [tampil]);

  const jumlahAnakAktif = (kd: string) =>
    items.filter((p) => p.kd_induk === kd && p.status === "AKTIF").length;

  const toggleBuka = (kd: string) =>
    setTertutup((prev) => {
      const next = new Set(prev);
      if (next.has(kd)) next.delete(kd);
      else next.add(kd);
      return next;
    });

  const adaGrupUtama = items.some((p) => p.kd_induk === null);
  const adaTipe = tipe.length > 0;
  const urlTipe = `/dashboard/${slug}/tipe-perusahaan`;

  const iconBtn = "rounded-lg p-1.5 transition";

  const renderNodes = (parent: string | null, level: number): ReactNode =>
    (anak.get(parent) ?? []).map((p) => {
      const kids = anak.get(p.kd_perusahaan) ?? [];
      const terbuka = !tertutup.has(p.kd_perusahaan);
      const akar = p.kd_induk === null;
      const aktif = p.status === "AKTIF";
      const bolehKelola = !akar || isSuperAdmin;

      return (
        <div key={p.kd_perusahaan}>
          <div
            className={`flex flex-wrap items-center gap-3 border-b border-gray-100 py-3 pr-4 transition hover:bg-gray-50 ${
              aktif ? "" : "bg-gray-50/70"
            }`}
            style={{ paddingLeft: 16 + level * 28 }}>
            {kids.length > 0 ? (
              <button
                onClick={() => toggleBuka(p.kd_perusahaan)}
                className="rounded p-0.5 text-gray-500 transition hover:bg-gray-200">
                {terbuka ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}

            <Building2
              size={18}
              className={aktif ? "text-blue-500" : "text-gray-400"}
            />

            <div className="min-w-[200px] flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`font-medium ${aktif ? "text-gray-800" : "text-gray-400"}`}>
                  {p.nama}
                </span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">
                  {p.kode_cabang}
                </span>
                {p.nama_tipe && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                    {p.nama_tipe}
                  </span>
                )}
                {!aktif && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    Nonaktif
                  </span>
                )}
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-gray-500">
                <span>
                  {p.badan_hukum_sendiri === "YA"
                    ? `Badan hukum sendiri${p.nama_badan_hukum ? `: ${p.nama_badan_hukum}` : ""}`
                    : p.badan_hukum_efektif
                      ? `Ikut ${p.badan_hukum_efektif.nama_badan_hukum ?? "pusat"}`
                      : "Ikut pusat"}
                </span>

                {(p.nama_kota || p.nama_desa_manual) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} />
                    {p.nama_kota ?? p.nama_desa_manual}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {aktif && (
                <button
                  onClick={() => setBuat({ induk: p })}
                  title="Tambah cabang di bawah ini"
                  className={`${iconBtn} text-green-600 hover:bg-green-50`}>
                  <Plus size={18} />
                </button>
              )}

              {bolehKelola && (
                <button
                  onClick={() => setUbah(p)}
                  title="Ubah"
                  className={`${iconBtn} text-blue-500 hover:bg-blue-50`}>
                  <Pencil size={16} />
                </button>
              )}

              {!akar && (
                <button
                  onClick={() => setPindah(p)}
                  title="Pindahkan"
                  className={`${iconBtn} text-gray-500 hover:bg-gray-100`}>
                  <ArrowRightLeft size={16} />
                </button>
              )}

              {bolehKelola && (
                <button
                  onClick={() => setStatus({ item: p, aktif: !aktif })}
                  title={aktif ? "Nonaktifkan" : "Aktifkan kembali"}
                  className={`${iconBtn} ${aktif ? "text-red-500 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}>
                  {aktif ? <PowerOff size={16} /> : <Power size={16} />}
                </button>
              )}

              {bolehKelola && (
                <button
                  onClick={() => setHapus(p)}
                  title="Hapus"
                  className={`${iconBtn} text-red-500 hover:bg-red-50`}>
                  <Trash2 size={16} />
                </button>
              )}

              <button
                onClick={() => setRiwayat(p)}
                title="Riwayat"
                className={`${iconBtn} text-gray-500 hover:bg-gray-100`}>
                <History size={16} />
              </button>

              {hapus && (
                <ModalHapusPerusahaan
                  key={hapus.kd_perusahaan}
                  item={hapus}
                  jumlahUnit={
                    1 + descendantIds(items, hapus.kd_perusahaan).length
                  }
                  onClose={() => setHapus(null)}
                  onSuccess={load}
                />
              )}
            </div>
          </div>

          {kids.length > 0 &&
            terbuka &&
            renderNodes(p.kd_perusahaan, level + 1)}
        </div>
      );
    });

  const modal = (
    <>
      {buat && (
        <ModalCreatePerusahaan
          key={buat.induk?.kd_perusahaan ?? "akar"}
          induk={buat.induk}
          tipeOptions={tipe}
          onClose={() => setBuat(null)}
          onSuccess={load}
        />
      )}
      {ubah && (
        <ModalEditPerusahaan
          key={ubah.kd_perusahaan}
          item={ubah}
          tipeOptions={tipe}
          onClose={() => setUbah(null)}
          onSuccess={load}
        />
      )}
      ``
      {pindah && (
        <ModalPindahPerusahaan
          key={pindah.kd_perusahaan}
          item={pindah}
          semua={items}
          onClose={() => setPindah(null)}
          onSuccess={load}
        />
      )}
      {status && (
        <ModalStatusPerusahaan
          key={status.item.kd_perusahaan}
          item={status.item}
          aktif={status.aktif}
          anakAktif={jumlahAnakAktif(status.item.kd_perusahaan)}
          onClose={() => setStatus(null)}
          onSuccess={load}
        />
      )}
      {riwayat && (
        <ModalRiwayatPerusahaan
          key={riwayat.kd_perusahaan}
          item={riwayat}
          onClose={() => setRiwayat(null)}
        />
      )}
    </>
  );

  if (loading || loadingAkses) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-gray-500">
        <LoaderCircle size={20} className="animate-spin" />
        <span>Memuat data...</span>
      </div>
    );
  }

  if (!adaGrupUtama) {
    return (
      <div className="space-y-6">
        {modal}

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Perusahaan & Cabang
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Mulai dengan membuat grup utama
          </p>
        </div>

        <SetupSteps
          title="Langkah awal"
          steps={[
            {
              title: "Buat tipe perusahaan",
              description:
                "Setiap perusahaan atau cabang membutuhkan tipe. Anda menentukan sendiri nama tipenya.",
              state: adaTipe ? "done" : "active",
              action: (
                <Link
                  href={urlTipe}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">
                  Buka Tipe Perusahaan
                </Link>
              ),
              doneAction: (
                <Link
                  href={urlTipe}
                  className="text-sm font-medium text-blue-600 transition hover:underline">
                  Kelola tipe
                </Link>
              ),
            },
            {
              title: "Buat grup utama",
              description: isSuperAdmin
                ? "Perusahaan paling atas dalam struktur Anda. Hanya ada satu, tetapi masih bisa diubah atau dihapus selama belum dipakai data lain."
                : "Hanya super admin yang dapat membuat grup utama. Hubungi super admin.",
              state: !adaTipe ? "locked" : "active",
              action: isSuperAdmin ? (
                <button
                  onClick={() => setBuat({ induk: null })}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">
                  <Plus size={18} />
                  <span>Buat Grup Utama</span>
                </button>
              ) : undefined,
            },
            {
              title: "Tambah cabang",
              description:
                "Cabang dapat dibuat di bawah grup utama atau di bawah cabang lain, tanpa batas tingkat.",
              state: "locked",
            },
          ]}
        />

        <HelpPanel title="Cara mengisi">
          <p>
            Semua data dibuat oleh Anda sendiri, tidak ada data bawaan. Isi
            berurutan: tipe, grup utama, lalu cabang.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Kode cabang bebas Anda tentukan, harus unik, dan boleh diubah
              kemudian.
            </li>
            <li>
              Cabang dapat berbadan hukum sendiri atau ikut badan hukum pusat.
            </li>
            <li>
              Alamat bisa dipilih dari data wilayah, atau ditulis sendiri untuk
              desa/kelurahan yang tidak ada di daftar.
            </li>
            <li>Perubahan penting dicatat di riwayat.</li>
          </ul>
        </HelpPanel>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {modal}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Perusahaan & Cabang
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {items.length} unit,{" "}
            {items.filter((p) => p.status === "AKTIF").length} aktif
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={tampilNonaktif}
            onChange={(e) => setTampilNonaktif(e.target.checked)}
            className="h-4 w-4"
          />
          Tampilkan yang nonaktif
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {renderNodes(null, 0)}
      </div>

      <HelpPanel title="Keterangan tombol">
        <ul className="space-y-1">
          <li>
            <Plus size={14} className="mr-1 inline text-green-600" />
            Tambah cabang di bawah unit tersebut
          </li>
          <li>
            <Pencil size={14} className="mr-1 inline text-blue-500" />
            Ubah data
          </li>
          <li>
            <ArrowRightLeft size={14} className="mr-1 inline text-gray-500" />
            Pindahkan ke induk lain, termasuk seluruh cabang di bawahnya
          </li>
          <li>
            <PowerOff size={14} className="mr-1 inline text-red-500" />
            Nonaktifkan (data tidak dihapus)
          </li>
          <li>
            <History size={14} className="mr-1 inline text-gray-500" />
            Lihat riwayat perubahan
          </li>
        </ul>
      </HelpPanel>
    </div>
  );
}
