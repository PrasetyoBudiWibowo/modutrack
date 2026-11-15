"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { LoaderCircle, Save, Search, ShieldCheck } from "lucide-react";
import {
  getAksesUsers,
  getUserAkses,
  saveUserAkses,
  type AksesMenu,
  type AksesModule,
  type AksesUser,
  type Izin,
} from "@/service/akses/aksesService";

type Row = { menu: AksesMenu; level: number };

const IZIN_COLUMNS: { key: keyof Izin; label: string }[] = [
  { key: "lihat", label: "Lihat" },
  { key: "insert", label: "Tambah" },
  { key: "edit", label: "Ubah" },
  { key: "hapus", label: "Hapus" },
  { key: "export", label: "Ekspor" },
];

const flattenTree = (
  menus: AksesMenu[],
  parent: string | null = null,
  level = 0,
): Row[] =>
  menus
    .filter((m) => m.parent_menu === parent)
    .flatMap((m) => [
      { menu: m, level },
      ...flattenTree(menus, m.kd_menu, level + 1),
    ]);

// Mematikan "lihat" mematikan semua izin; menyalakan izin lain menyalakan "lihat"
const applyIzin = (izin: Izin, key: keyof Izin, value: boolean): Izin => {
  if (key === "lihat") {
    return value
      ? { ...izin, lihat: true }
      : {
          lihat: false,
          insert: false,
          edit: false,
          hapus: false,
          export: false,
        };
  }
  return { ...izin, [key]: value, lihat: value ? true : izin.lihat };
};

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? "bg-blue-500" : "bg-gray-300"
      }`}>
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function AksesPage() {
  const [users, setUsers] = useState<AksesUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AksesUser | null>(null);
  const [modules, setModules] = useState<AksesModule[]>([]);
  const [loadingAkses, setLoadingAkses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const res = await getAksesUsers();
      setUsers(res.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        u.user_name.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const selectUser = async (user: AksesUser) => {
    if (dirty) {
      const confirm = await Swal.fire({
        title: "Perubahan belum disimpan",
        text: "Pindah user dan buang perubahan?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, pindah",
        cancelButtonText: "Batal",
      });
      if (!confirm.isConfirmed) return;
    }

    setSelected(user);
    setModules([]);
    setDirty(false);

    if (user.is_super_admin) return;

    try {
      setLoadingAkses(true);
      const res = await getUserAkses(user.kd_user);
      setModules(res.data.modules ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAkses(false);
    }
  };

  const updateModule = (kd: string, fn: (m: AksesModule) => AksesModule) => {
    setModules((prev) => prev.map((m) => (m.kd_module === kd ? fn(m) : m)));
    setDirty(true);
  };

  const toggleModule = (kd: string) =>
    updateModule(kd, (m) => ({ ...m, akses: !m.akses }));

  const setIzin = (
    kdModule: string,
    kdMenu: string,
    key: keyof Izin,
    value: boolean,
  ) =>
    updateModule(kdModule, (m) => ({
      ...m,
      menus: m.menus.map((x) =>
        x.kd_menu === kdMenu
          ? { ...x, izin: applyIzin(x.izin, key, value) }
          : x,
      ),
    }));

  const setAll = (kdModule: string, key: keyof Izin, value: boolean) =>
    updateModule(kdModule, (m) => ({
      ...m,
      menus: m.menus.map((x) =>
        x.url_menu ? { ...x, izin: applyIzin(x.izin, key, value) } : x,
      ),
    }));

  const handleSave = async () => {
    if (!selected) return;

    try {
      setSaving(true);

      const result = await saveUserAkses({
        kd_user: selected.kd_user,
        modules: modules.map((m) => ({
          kd_module: m.kd_module,
          akses: m.akses,
          menus: m.menus
            .filter((x) => x.url_menu)
            .map((x) => ({ kd_menu: x.kd_menu, ...x.izin })),
        })),
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

      setDirty(false);
      await loadUsers();
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Terjadi kesalahan pada server";
      Swal.fire({ icon: "error", title: "Gagal", text: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Hak Akses</h1>
        <p className="mt-1 text-sm text-gray-500">
          Atur module dan menu yang boleh diakses setiap user
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* DAFTAR USER */}
        <div className="h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari user..."
                className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {loadingUsers ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                <LoaderCircle size={18} className="animate-spin" />
                <span>Memuat user...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">
                User tidak ditemukan
              </p>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.kd_user}
                  type="button"
                  onClick={() => selectUser(u)}
                  className={`flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${
                    selected?.user_name === u.user_name ? "bg-blue-50" : ""
                  }`}>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {u.user_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {u.is_super_admin
                        ? "Super Admin"
                        : `Level ${u.level_user_id}`}
                    </p>
                  </div>
                  {!u.is_super_admin && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {u.total_module} module
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* PENGATURAN AKSES */}
        <div className="space-y-4">
          {!selected ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-sm text-gray-500">
              Pilih user di sebelah kiri untuk mengatur hak aksesnya
            </div>
          ) : selected.is_super_admin ? (
            <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800">
              <ShieldCheck size={20} className="mt-0.5 flex-shrink-0" />
              <p>
                <span className="font-semibold">{selected.user_name}</span>{" "}
                adalah Super Admin dan memiliki akses penuh ke seluruh module
                dan menu, jadi tidak perlu diatur.
              </p>
            </div>
          ) : loadingAkses ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-20 text-sm text-gray-500">
              <LoaderCircle size={20} className="animate-spin" />
              <span>Memuat hak akses...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <div>
                  <p className="text-sm text-gray-500">Mengatur akses untuk</p>
                  <p className="font-semibold text-gray-800">
                    {selected.user_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>

              {modules.map((m) => {
                const rows = flattenTree(m.menus);
                const leaves = m.menus.filter((x) => x.url_menu);

                return (
                  <div
                    key={m.kd_module}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">
                          {m.nama_module}
                        </h3>
                        {m.status_module === "TIDAK" && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Module nonaktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {m.akses ? "Boleh diakses" : "Tidak ada akses"}
                        </span>
                        <Switch
                          checked={m.akses}
                          onChange={() => toggleModule(m.kd_module)}
                        />
                      </div>
                    </div>

                    {m.akses &&
                      (leaves.length === 0 ? (
                        <p className="px-5 py-6 text-sm text-gray-500">
                          Belum ada menu di module ini
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b border-gray-200">
                              <tr>
                                <th className="px-5 py-3 text-left font-semibold text-gray-700">
                                  Menu
                                </th>
                                {IZIN_COLUMNS.map((c) => (
                                  <th
                                    key={c.key}
                                    className="px-3 py-3 text-center font-semibold text-gray-700">
                                    <label className="flex cursor-pointer flex-col items-center gap-1">
                                      <input
                                        type="checkbox"
                                        checked={leaves.every(
                                          (x) => x.izin[c.key],
                                        )}
                                        onChange={(e) =>
                                          setAll(
                                            m.kd_module,
                                            c.key,
                                            e.target.checked,
                                          )
                                        }
                                        className="h-4 w-4"
                                      />
                                      <span>{c.label}</span>
                                    </label>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map(({ menu, level }) =>
                                menu.url_menu ? (
                                  <tr
                                    key={menu.kd_menu}
                                    className="border-b border-gray-100 hover:bg-gray-50">
                                    <td
                                      className="px-5 py-2.5 text-gray-700"
                                      style={{ paddingLeft: 20 + level * 16 }}>
                                      {menu.nama_menu}
                                      {menu.status_akses === "TIDAK" && (
                                        <span className="ml-2 text-xs text-red-500">
                                          (nonaktif)
                                        </span>
                                      )}
                                    </td>
                                    {IZIN_COLUMNS.map((c) => (
                                      <td
                                        key={c.key}
                                        className="px-3 py-2.5 text-center">
                                        <input
                                          type="checkbox"
                                          checked={menu.izin[c.key]}
                                          onChange={(e) =>
                                            setIzin(
                                              m.kd_module,
                                              menu.kd_menu,
                                              c.key,
                                              e.target.checked,
                                            )
                                          }
                                          className="h-4 w-4"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ) : (
                                  <tr
                                    key={menu.kd_menu}
                                    className="border-b border-gray-100 bg-gray-50/60">
                                    <td
                                      colSpan={IZIN_COLUMNS.length + 1}
                                      className="py-2 pr-5 text-xs font-semibold uppercase tracking-wide text-gray-500"
                                      style={{ paddingLeft: 20 + level * 16 }}>
                                      {menu.nama_menu}
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      ))}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
