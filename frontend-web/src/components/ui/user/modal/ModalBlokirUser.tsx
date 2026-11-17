"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import ModalShell from "@/src/components/ui/common/ModalShell";
import {
  blokirUser,
  type BlokirInput,
  type BlokirInputErrors,
  type ManagedUser,
} from "@/service/user/userManagementService";
import { getErrorMessage } from "@/src/lib/errorMessage";

interface Props {
  user: ManagedUser;
  onClose: () => void;
  onSuccess: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const addDays = (days: number) =>
  toLocalInput(new Date(Date.now() + days * 86_400_000));

const PRESETS = [
  { label: "1 hari", days: 1 },
  { label: "3 hari", days: 3 },
  { label: "7 hari", days: 7 },
  { label: "30 hari", days: 30 },
];

export default function ModalBlokirUser({ user, onClose, onSuccess }: Props) {
  const [input, setInput] = useState<BlokirInput>(() => ({
    jenis: "SEMENTARA",
    selesai_at: addDays(3),
    alasan: "",
  }));
  const [errors, setErrors] = useState<BlokirInputErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: BlokirInputErrors = {};

    if (input.alasan.trim().length < 5) e.alasan = "Alasan minimal 5 karakter";

    if (input.jenis === "SEMENTARA") {
      if (!input.selesai_at) e.selesai_at = "Tanggal berakhir wajib diisi";
      else if (new Date(input.selesai_at).getTime() <= Date.now()) {
        e.selesai_at = "Tanggal berakhir harus di masa depan";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const result = await blokirUser(user.kd_user, input);

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
        const mapped: BlokirInputErrors = {};
        for (const key in server) {
          if (key in input) mapped[key as keyof BlokirInput] = server[key][0];
        }
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
      title="Blokir User"
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
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            {loading
              ? "Memproses..."
              : input.jenis === "PERMANEN"
                ? "Blokir Permanen"
                : "Suspend User"}
          </button>
        </>
      }>
      <div className="space-y-4">
        {/* JENIS */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Jenis
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                {
                  value: "SEMENTARA",
                  title: "Suspend",
                  desc: "Sampai tanggal tertentu",
                },
                {
                  value: "PERMANEN",
                  title: "Blokir permanen",
                  desc: "Sampai dicabut admin",
                },
              ] as const
            ).map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setInput((p) => ({ ...p, jenis: o.value }))}
                className={`rounded-lg border p-3 text-left transition ${
                  input.jenis === o.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}>
                <p className="text-sm font-medium text-gray-800">{o.title}</p>
                <p className="text-xs text-gray-500">{o.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* TANGGAL BERAKHIR */}
        {input.jenis === "SEMENTARA" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Berakhir pada <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={input.selesai_at}
              min={toLocalInput(new Date())}
              onChange={(e) => {
                setInput((p) => ({ ...p, selesai_at: e.target.value }));
                setErrors((p) => ({ ...p, selesai_at: "" }));
              }}
              className={`w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.selesai_at ? "border-red-500" : "border-gray-300"
              }`}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() =>
                    setInput((prev) => ({
                      ...prev,
                      selesai_at: addDays(p.days),
                    }))
                  }
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600 transition hover:bg-gray-100">
                  {p.label}
                </button>
              ))}
            </div>
            {errors.selesai_at && (
              <p className="mt-1 text-xs text-red-500">{errors.selesai_at}</p>
            )}
          </div>
        )}

        {/* ALASAN */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Alasan <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            maxLength={500}
            value={input.alasan}
            onChange={(e) => {
              setInput((p) => ({ ...p, alasan: e.target.value }));
              setErrors((p) => ({ ...p, alasan: "" }));
            }}
            placeholder="Jelaskan alasan pemblokiran"
            className={`w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.alasan ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.alasan && (
            <p className="mt-1 text-xs text-red-500">{errors.alasan}</p>
          )}
        </div>

        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Sesi {user.user_name} yang sedang aktif akan langsung diakhiri.
        </p>
      </div>
    </ModalShell>
  );
}
