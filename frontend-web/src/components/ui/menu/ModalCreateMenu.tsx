"use client";

import { useState, useEffect, useMemo } from "react";
import { X, LoaderCircle } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { createMenu } from "@/service/menu/menuService";
import { initialMenuInput } from "@/src/store/menu/menuSlice";
import type {
  MenuInput,
  MenuInputErrors,
  Menu,
} from "@/service/menu/menuService";
import { useModuleStore } from "@/src/store/module/createModule/moduleSlice";
import { useMenuStore } from "@/src/store/menu/menuSlice";
import { useAuthStore } from "@/src/store/auth/authStore";
import LoadingModal from "../LoadingModal";

interface Props {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FlatMenu = {
  kd_menu: string;
  nama_menu: string;
  level: number;
};

const flattenMenus = (
  menus: Menu[],
  kd_module: string,
  parentId: string | null = null,
  level: number = 0,
): FlatMenu[] => {
  return menus
    .filter((m) => m.parent_menu === parentId && m.kd_module === kd_module)
    .flatMap((m) => [
      { kd_menu: m.kd_menu, nama_menu: m.nama_menu, level },
      ...flattenMenus(menus, kd_module, m.kd_menu, level + 1),
    ]);
};

export default function ModalCreateMenu({ show, onClose, onSuccess }: Props) {
  const { sessionUser } = useAuthStore();
  const { modules, fetchModules } = useModuleStore();
  const { menus } = useMenuStore();

  const [input, setInput] = useState<MenuInput>(initialMenuInput);
  const [loadingSave, setLoadingSave] = useState(false);
  const [errors, setErrors] = useState<MenuInputErrors>({});
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      fetchModules();
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setVisible(false), 300);
    }
  }, [show, fetchModules]);

  const parentMenuOptions = useMemo(() => {
    if (!input.kd_module) return [];
    return flattenMenus(menus, input.kd_module);
  }, [input.kd_module, menus]);

  if (!visible) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // RESET PARENT MENU SAAT MODULE BERUBAH
    if (name === "kd_module") {
      setInput((prev) => ({
        ...prev,
        kd_module: value,
        parent_menu: "",
      }));
    } else {
      setInput((prev) => ({
        ...prev,
        [name]:
          name === "urutan"
            ? Number(value)
            : name === "nama_menu"
              ? value.toUpperCase()
              : value,
      }));
    }

    setErrors((prev: MenuInputErrors) => ({ ...prev, [name]: "" }));
  };

  const handleClose = () => {
    setInput(initialMenuInput);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const newErrors: MenuInputErrors = {};
    if (!input.kd_module) newErrors.kd_module = "Module harus dipilih";
    if (!input.nama_menu.trim())
      newErrors.nama_menu = "Nama menu tidak boleh kosong";
    if (input.is_parent && !input.icon_menu.trim()) {
      newErrors.icon_menu = "Icon wajib diisi untuk parent menu";
    }
    if (!input.is_parent && !input.url_menu.trim()) {
      newErrors.url_menu = "URL wajib diisi untuk menu";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!sessionUser?.kd_user) {
      Swal.fire({
        icon: "warning",
        title: "Session",
        text: "User tidak ditemukan",
      });
      return;
    }

    if (!validate()) return;

    try {
      setLoadingSave(true);

      const result = await createMenu(sessionUser.kd_user, input);

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

      handleClose();
      onSuccess();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const serverErrors = error.response.data.errors as Record<
          string,
          string[]
        >;
        const mapped: MenuInputErrors = {};
        for (const key in serverErrors) {
          if (key in initialMenuInput) {
            mapped[key as keyof MenuInput] = serverErrors[key][0];
          }
        }
        setErrors(mapped);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Terjadi kesalahan pada server",
        });
      }
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        transition-all duration-300
        ${animate ? "bg-black/50" : "bg-black/0"}
      `}>
      <LoadingModal
        show={loadingSave}
        title="Menyimpan Data Module"
        description={`Sedang Module baru ke Database...`}
      />

      <div
        className={`
          bg-white rounded-2xl shadow-xl w-full max-w-md mx-4
          transition-all duration-300
          ${
            animate
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"
          }
        `}>
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Tambah Menu</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:rotate-90 transition-all duration-200">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-4 space-y-4">
          {/* MODULE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module <span className="text-red-500">*</span>
            </label>
            <select
              name="kd_module"
              value={input.kd_module}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${
                errors.kd_module ? "border-red-500" : "border-gray-300"
              }`}>
              <option value="">-- Pilih Module --</option>
              {modules
                .filter((m) => m.status_module === "AKTIF")
                .map((m) => (
                  <option key={m.kd_module} value={m.kd_module}>
                    {m.nama_module}
                  </option>
                ))}
            </select>
            {errors.kd_module && (
              <p className="text-red-500 text-xs mt-1">{errors.kd_module}</p>
            )}
          </div>

          {/* IS PARENT TOGGLE */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Jadikan Parent Menu
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Parent menu tidak memiliki URL, hanya sebagai grup
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setInput((prev) => ({
                  ...prev,
                  is_parent: !prev.is_parent,
                  parent_menu: "",
                  url_menu: "",
                }))
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                input.is_parent ? "bg-blue-500" : "bg-gray-300"
              }`}>
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  input.is_parent ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* PARENT MENU — sembunyikan jika is_parent */}
          {!input.is_parent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Menu
                <span className="text-gray-400 text-xs ml-1">(opsional)</span>
              </label>
              <select
                name="parent_menu"
                value={input.parent_menu}
                onChange={handleChange}
                disabled={!input.kd_module}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white disabled:bg-gray-50 disabled:text-gray-400">
                <option value="">-- Tidak Ada Parent --</option>
                {parentMenuOptions.map((m) => (
                  <option key={m.kd_menu} value={m.kd_menu}>
                    {"\u00A0\u00A0".repeat(m.level * 2)}
                    {m.level > 0 ? "└ " : ""}
                    {m.nama_menu}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* NAMA MENU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Menu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_menu"
              value={input.nama_menu}
              onChange={handleChange}
              placeholder="Contoh: Data Karyawan"
              autoFocus
              className={`w-full px-3 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.nama_menu ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.nama_menu && (
              <p className="text-red-500 text-xs mt-1">{errors.nama_menu}</p>
            )}
          </div>

          {/* ICON MENU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon Menu
              {input.is_parent && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              name="icon_menu"
              value={input.icon_menu}
              onChange={handleChange}
              placeholder="Contoh: Users"
              className={`w-full px-3 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.icon_menu ? "border-red-500" : "border-gray-300"
              }`}
            />
            <p className="text-xs text-gray-400 mt-1">
              Nama icon dari Lucide React
            </p>
            {errors.icon_menu && (
              <p className="text-red-500 text-xs mt-1">{errors.icon_menu}</p>
            )}
          </div>

          {/* URL MENU — sembunyikan jika is_parent */}
          {!input.is_parent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Menu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="url_menu"
                value={input.url_menu}
                onChange={handleChange}
                placeholder="Contoh: /dashboard/hrd/karyawan"
                className={`w-full px-3 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.url_menu ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.url_menu && (
                <p className="text-red-500 text-xs mt-1">{errors.url_menu}</p>
              )}
            </div>
          )}

          {/* URUTAN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urutan
            </label>
            <input
              type="number"
              name="urutan"
              value={input.urutan}
              onChange={handleChange}
              min={0}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={handleClose}
            disabled={loadingSave}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loadingSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-sm font-medium text-white hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loadingSave && <LoaderCircle size={16} className="animate-spin" />}
            {loadingSave ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
