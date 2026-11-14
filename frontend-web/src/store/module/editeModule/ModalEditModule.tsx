"use client";

import { useState, useEffect } from "react";
import { X, LoaderCircle } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { updateModule } from "@/service/module/moduleService";
import type {
  Module,
  ModuleInput,
  ModuleInputErrors,
} from "@/service/module/moduleService";

interface Props {
  show: boolean;
  module: Module | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditModule({
  show,
  module,
  onClose,
  onSuccess,
}: Props) {
  const [input, setInput] = useState<ModuleInput>({
    nama_module: module?.nama_module ?? "",
    icon_module: module?.icon_module ?? "",
    url_module: module?.url_module ?? "",
    urutan: module?.urutan ?? 0,
  });
  const [loadingSave, setLoadingSave] = useState(false);
  const [errors, setErrors] = useState<ModuleInputErrors>({});
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setVisible(false), 300);
    }
  }, [show]);

  if (!visible || !module) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]:
        name === "urutan"
          ? Number(value)
          : name === "nama_module"
            ? value.toUpperCase()
            : value,
    }));
    setErrors((prev: ModuleInputErrors) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: ModuleInputErrors = {};
    if (!input.nama_module.trim()) {
      newErrors.nama_module = "Nama module tidak boleh kosong";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoadingSave(true);

      const result = await updateModule(module.kd_module, input);

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
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const serverErrors = error.response.data.errors as Record<
          string,
          string[]
        >;
        const mapped: ModuleInputErrors = {};
        for (const key in serverErrors) {
          if (key in input) {
            mapped[key as keyof ModuleInput] = serverErrors[key][0];
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
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        animate ? "bg-black/50" : "bg-black/0"
      }`}>
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 transition-all duration-300 ${
          animate
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
        }`}>
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Edit Module</h2>
            <p className="text-xs text-gray-400">{module.kd_module}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:rotate-90 transition-all duration-200">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Module <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_module"
              value={input.nama_module}
              onChange={handleChange}
              autoFocus
              className={`w-full px-3 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.nama_module ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.nama_module && (
              <p className="text-red-500 text-xs mt-1">{errors.nama_module}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon Module
            </label>
            <input
              type="text"
              name="icon_module"
              value={input.icon_module}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Nama icon dari Lucide React
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Module
            </label>
            <input
              type="text"
              name="url_module"
              value={input.url_module}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

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
            onClick={onClose}
            disabled={loadingSave}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loadingSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-sm font-medium text-white hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loadingSave && <LoaderCircle size={16} className="animate-spin" />}
            {loadingSave ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
