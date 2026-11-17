"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import ModalShell from "@/src/components/ui/common/ModalShell";
import {
  getUserLevels,
  updateUser,
  type ManagedUser,
  type UserLevel,
} from "@/service/user/userManagementService";
import { getErrorMessage } from "@/src/lib/errorMessage";
import UserAvatar from "../../common/UserAvatar";

interface Props {
  user: ManagedUser;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ModalEditUser({ user, onClose, onSuccess }: Props) {
  const [levels, setLevels] = useState<UserLevel[]>([]);
  const [levelId, setLevelId] = useState<number>(user.level_user_id);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hapusFoto, setHapusFoto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const previewRef = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    getUserLevels()
      .then((res) => active && setLevels(res.data ?? []))
      .catch(console.error);

    return () => {
      active = false;
    };
  }, []);

  // Lepas object URL saat modal ditutup
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const shownPhoto = preview ?? (hapusFoto ? null : user.foto_url);
  const changed =
    levelId !== user.level_user_id ||
    password !== "" ||
    file !== null ||
    hapusFoto;

  const clearError = (key: string) => setErrors((p) => ({ ...p, [key]: "" }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setErrors((p) => ({
        ...p,
        foto: "Foto harus berformat JPG, PNG, atau WEBP",
      }));
      return;
    }

    if (selected.size > MAX_SIZE) {
      setErrors((p) => ({ ...p, foto: "Ukuran foto maksimal 2 MB" }));
      return;
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);

    const url = URL.createObjectURL(selected);
    previewRef.current = url;

    setPreview(url);
    setFile(selected);
    setHapusFoto(false);
    clearError("foto");
  };

  const removePhoto = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;

    setPreview(null);
    setFile(null);
    if (user.foto_url) setHapusFoto(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (password) {
      if (password.length < 8) e.password = "Password minimal 8 karakter";
      else if (password !== confirm)
        e.password_confirmation = "Konfirmasi password tidak cocok";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const result = await updateUser(user.kd_user, {
        level_user_id: levelId,
        password,
        password_confirmation: confirm,
        foto: file,
        hapus_foto: hapusFoto,
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

  const inputClass = (key: string) =>
    `w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
      errors[key] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <ModalShell
      title="Edit User"
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
            disabled={loading || !changed}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50">
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </>
      }>
      <div className="space-y-5">
        {/* FOTO */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Foto
          </label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-2xl font-semibold text-gray-400">
              {shownPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <UserAvatar
                  name={user.user_name}
                  src={shownPhoto}
                  className="h-20 w-20 text-2xl"
                />
              ) : (
                user.user_name.charAt(0)
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100">
                  <ImagePlus size={15} />
                  {shownPhoto ? "Ganti foto" : "Pilih foto"}
                </button>

                {shownPhoto && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50">
                    <Trash2 size={15} />
                    Hapus
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400">
                JPG, PNG, atau WEBP, maksimal 2 MB
              </p>
            </div>

            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="hidden"
            />
          </div>
          {errors.foto && (
            <p className="mt-1 text-xs text-red-500">{errors.foto}</p>
          )}
        </div>

        {/* LEVEL */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Level User
          </label>
          <select
            value={levelId}
            onChange={(e) => {
              setLevelId(Number(e.target.value));
              clearError("level_user_id");
            }}
            className={`${inputClass("level_user_id")} bg-white`}>
            {levels.length === 0 && (
              <option value={user.level_user_id}>
                {user.level_user ?? "Memuat..."}
              </option>
            )}
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.level_user}
              </option>
            ))}
          </select>
          {errors.level_user_id && (
            <p className="mt-1 text-xs text-red-500">{errors.level_user_id}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password baru{" "}
              <span className="text-xs font-normal text-gray-400">
                (kosongkan jika tidak diubah)
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="new-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                className={`${inputClass("password")} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {password && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Konfirmasi password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                autoComplete="new-password"
                onChange={(e) => {
                  setConfirm(e.target.value);
                  clearError("password_confirmation");
                }}
                className={inputClass("password_confirmation")}
              />
              {errors.password_confirmation && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password_confirmation}
                </p>
              )}
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Sesi {user.user_name} yang sedang aktif akan berakhir dan perlu
                login ulang.
              </p>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
