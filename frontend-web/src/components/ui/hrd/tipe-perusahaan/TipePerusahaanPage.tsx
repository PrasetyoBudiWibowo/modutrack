"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import Toolbar from "@/src/components/data-table/toolbar";
import { DataTable } from "@/src/components/data-table/data-table";
import { tipePerusahaanColumns } from "@/src/components/data-table/columns/hrd/tipePerusahaanColumns";
import ModalFormTipePerusahaan from "@/src/components/ui/hrd/tipe-perusahaan/ModalFormTipePerusahaan";
import HelpPanel from "@/src/components/ui/common/HelpPanel";
import {
  getTipePerusahaan,
  toggleTipePerusahaan,
  type TipePerusahaan,
} from "@/service/hrd/tipePerusahaanService";
import { getErrorMessage } from "@/src/lib/errorMessage";

export default function TipePerusahaanPage() {
  const [items, setItems] = useState<TipePerusahaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<{ item: TipePerusahaan | null } | null>(
    null,
  );

  const load = useCallback(async () => {
    try {
      const res = await getTipePerusahaan();
      setItems(res.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setLoading(true);
    await load();
  };

  const filtered = useMemo(
    () =>
      items.filter((t) => t.nama.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const handleToggle = useCallback(
    async (t: TipePerusahaan) => {
      const aktif = t.status === "AKTIF";

      const confirm = await Swal.fire({
        title: aktif ? "Nonaktifkan tipe?" : "Aktifkan tipe?",
        text: t.nama,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
      });

      if (!confirm.isConfirmed) return;

      try {
        const result = await toggleTipePerusahaan(t.kd_tipe_perusahaan);

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
        await load();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: getErrorMessage(error),
        });
      }
    },
    [load],
  );

  const columns = useMemo(
    () =>
      tipePerusahaanColumns({
        onEdit: (t) => setForm({ item: t }),
        onToggle: handleToggle,
      }),
    [handleToggle],
  );

  const kosong = !loading && items.length === 0;

  return (
    <div className="space-y-6">
      {form && (
        <ModalFormTipePerusahaan
          key={form.item?.kd_tipe_perusahaan ?? "baru"}
          item={form.item}
          pertama={items.length === 0}
          onClose={() => setForm(null)}
          onSuccess={load}
        />
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tipe Perusahaan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Istilah untuk setiap tingkat di struktur perusahaan Anda
          </p>
        </div>

        <button
          onClick={() => setForm({ item: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">
          <Plus size={18} />
          <span>Tambah Tipe</span>
        </button>
      </div>

      {kosong && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="font-medium text-gray-800">Belum ada tipe</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            Tipe adalah nama untuk setiap tingkat struktur Anda. Buat tipe
            pertama sebelum membuat perusahaan atau cabang.
          </p>
          <button
            onClick={() => setForm({ item: null })}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">
            <Plus size={18} />
            <span>Buat Tipe Pertama</span>
          </button>
        </div>
      )}

      <HelpPanel title="Cara mengisi">
        <p>
          Setiap perusahaan atau cabang yang Anda buat memiliki satu tipe. Anda
          bebas menentukan nama tipenya sendiri, dan nama itu hanya label
          tampilan.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Buat tipe untuk tingkat teratas, misalnya yang Anda sebut
            &quot;Perusahaan&quot;.
          </li>
          <li>
            Buat tipe untuk tingkat di bawahnya jika ada, misalnya
            &quot;Cabang&quot;.
          </li>
          <li>
            Pada tiap tipe, tentukan apakah unit bertipe itu boleh berbadan
            hukum sendiri (punya NPWP dan akta).
          </li>
        </ol>
        <p className="text-gray-500">
          Gambaran saja: usaha kecil mungkin cukup satu tipe, sedangkan grup
          besar bisa memakai beberapa tipe. Tipe tidak dihapus, hanya
          dinonaktifkan, supaya data lama tetap terbaca.
        </p>
      </HelpPanel>

      {!kosong && (
        <>
          <Toolbar
            search={search}
            setSearch={setSearch}
            totalData={filtered.length}
            loading={loading}
            onRefresh={refresh}
          />

          <DataTable
            columns={columns}
            data={filtered}
            loading={loading}
            title="Daftar Tipe"
            description="Tipe yang dipakai perusahaan dan cabang"
          />
        </>
      )}
    </div>
  );
}
