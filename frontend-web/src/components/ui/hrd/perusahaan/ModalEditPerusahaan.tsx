"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import ModalShell from "@/src/components/ui/common/ModalShell";
import {
  ChoiceButton,
  FormSection,
  WilayahOptions,
} from "@/src/components/ui/common/FormParts";
import { useWilayahOpsi } from "@/src/components/ui/hrd/perusahaan/useWilayahOpsi";
import {
  updatePerusahaan,
  type OpsiTipe,
  type Perusahaan,
  type PerusahaanInput,
} from "@/service/hrd/perusahaanService";
import { getErrorMessage } from "@/src/lib/errorMessage";
import { todayLocal } from "@/src/lib/format";

interface Props {
  item: Perusahaan;
  tipeOptions: OpsiTipe[];
  onClose: () => void;
  onSuccess: () => void;
}

const dariItem = (p: Perusahaan): PerusahaanInput => ({
  kode_cabang: p.kode_cabang,
  nama: p.nama,
  singkatan: p.singkatan ?? "",
  kd_tipe_perusahaan: p.kd_tipe_perusahaan,
  kd_induk: p.kd_induk ?? "",
  badan_hukum_sendiri: p.badan_hukum_sendiri,
  nama_badan_hukum: p.nama_badan_hukum ?? "",
  npwp: p.npwp ?? "",
  no_akta: p.no_akta ?? "",
  kd_provinsi: p.kd_provinsi ?? "",
  kd_kabupaten_kota: p.kd_kabupaten_kota ?? "",
  kd_kecamatan: p.kd_kecamatan ?? "",
  mode_desa: p.mode_desa ?? "",
  kd_village: p.kd_village ?? "",
  nama_desa_manual: p.nama_desa_manual ?? "",
  alamat_rinci: p.alamat_rinci ?? "",
  kode_pos: p.kode_pos ?? "",
  telepon: p.telepon ?? "",
  email: p.email ?? "",
  tgl_berdiri: p.tgl_berdiri ?? "",
});

export default function ModalEditPerusahaan({
  item,
  tipeOptions,
  onClose,
  onSuccess,
}: Props) {
  const isAkar = item.kd_induk === null;

  const [input, setInput] = useState<PerusahaanInput>(() => dariItem(item));
  const [tglBerlaku, setTglBerlaku] = useState(todayLocal());
  const [alasan, setAlasan] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { opsi, setOpsi, muat } = useWilayahOpsi(input);

  const clearError = (key: string) => setErrors((p) => ({ ...p, [key]: "" }));

  const set = (name: keyof PerusahaanInput, value: string) => {
    setInput((p) => ({
      ...p,
      [name]: name === "kode_cabang" ? value.toUpperCase() : value,
    }));
    clearError(name);
  };

  /* ---- alamat berjenjang ---- */
  const pilihProvinsi = (v: string) => {
    setInput((p) => ({
      ...p,
      kd_provinsi: v,
      kd_kabupaten_kota: "",
      kd_kecamatan: "",
      mode_desa: "",
      kd_village: "",
      nama_desa_manual: "",
    }));
    setOpsi((p) => ({ ...p, kota: v ? null : [], kecamatan: [], desa: [] }));
    if (v) muat("kota", v);
  };

  const pilihKota = (v: string) => {
    setInput((p) => ({
      ...p,
      kd_kabupaten_kota: v,
      kd_kecamatan: "",
      mode_desa: "",
      kd_village: "",
      nama_desa_manual: "",
    }));
    setOpsi((p) => ({ ...p, kecamatan: v ? null : [], desa: [] }));
    if (v) muat("kecamatan", v);
  };

  const pilihKecamatan = (v: string) => {
    setInput((p) => ({
      ...p,
      kd_kecamatan: v,
      mode_desa: v ? "PILIH" : "",
      kd_village: "",
      nama_desa_manual: "",
    }));
    setOpsi((p) => ({ ...p, desa: v ? null : [] }));
    if (v) muat("desa", v);
  };

  const pilihModeDesa = (m: "PILIH" | "MANUAL") => {
    setInput((p) => ({
      ...p,
      mode_desa: m,
      kd_village: "",
      nama_desa_manual: "",
    }));
    if (
      m === "PILIH" &&
      input.kd_kecamatan &&
      (opsi.desa === null || opsi.desa.length === 0)
    ) {
      setOpsi((p) => ({ ...p, desa: null }));
      muat("desa", input.kd_kecamatan);
    }
  };

  const kosongkanAlamat = () => {
    setInput((p) => ({
      ...p,
      kd_provinsi: "",
      kd_kabupaten_kota: "",
      kd_kecamatan: "",
      mode_desa: "",
      kd_village: "",
      nama_desa_manual: "",
      alamat_rinci: "",
      kode_pos: "",
    }));
    setOpsi((p) => ({ ...p, kota: [], kecamatan: [], desa: [] }));
  };

  /* ---- tipe dan badan hukum ---- */
  const tipePilihan = isAkar
    ? tipeOptions.filter((t) => t.boleh_badan_hukum === "YA")
    : tipeOptions;
  const tipeSaatIniTidakAda = !tipePilihan.some(
    (t) => t.kd_tipe_perusahaan === item.kd_tipe_perusahaan,
  );
  const tipeSel = tipeOptions.find(
    (t) => t.kd_tipe_perusahaan === input.kd_tipe_perusahaan,
  );
  const tipeMelarang = tipeSel?.boleh_badan_hukum === "TIDAK";
  const badanHukum = isAkar || input.badan_hukum_sendiri === "YA";

  const pilihTipe = (kd: string) => {
    const t = tipeOptions.find((x) => x.kd_tipe_perusahaan === kd);

    setInput((p) => ({
      ...p,
      kd_tipe_perusahaan: kd,
      badan_hukum_sendiri:
        !isAkar && t?.boleh_badan_hukum === "TIDAK"
          ? "TIDAK"
          : p.badan_hukum_sendiri,
    }));
    clearError("kd_tipe_perusahaan");
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!input.kode_cabang.trim())
      e.kode_cabang = "Kode cabang tidak boleh kosong";
    else if (!/^[A-Za-z0-9-]+$/.test(input.kode_cabang)) {
      e.kode_cabang = "Kode cabang hanya boleh huruf, angka, dan tanda hubung";
    }

    if (!input.nama.trim()) e.nama = "Nama tidak boleh kosong";
    if (!input.kd_tipe_perusahaan) e.kd_tipe_perusahaan = "Tipe harus dipilih";

    if (badanHukum) {
      if (!input.nama_badan_hukum.trim())
        e.nama_badan_hukum = "Nama badan hukum wajib diisi";
      const digit = input.npwp.replace(/\D/g, "");
      if (digit.length !== 15 && digit.length !== 16)
        e.npwp = "NPWP harus 15 atau 16 digit";
    }

    const adaAlamat = [
      input.kd_provinsi,
      input.kd_kabupaten_kota,
      input.kd_kecamatan,
      input.mode_desa,
      input.kd_village,
      input.nama_desa_manual,
      input.alamat_rinci,
      input.kode_pos,
    ].some((v) => v.trim() !== "");

    if (adaAlamat) {
      if (!input.kd_provinsi) e.kd_provinsi = "Provinsi wajib dipilih";
      if (!input.kd_kabupaten_kota)
        e.kd_kabupaten_kota = "Kabupaten/kota wajib dipilih";
      if (!input.kd_kecamatan) e.kd_kecamatan = "Kecamatan wajib dipilih";
      if (
        input.kd_kecamatan &&
        input.mode_desa === "PILIH" &&
        !input.kd_village
      )
        e.kd_village = "Desa/kelurahan wajib dipilih";
      if (
        input.kd_kecamatan &&
        input.mode_desa === "MANUAL" &&
        !input.nama_desa_manual.trim()
      ) {
        e.nama_desa_manual = "Nama desa/kelurahan wajib diisi";
      }
    }

    if (input.kode_pos && !/^\d{5}$/.test(input.kode_pos))
      e.kode_pos = "Kode pos harus 5 digit";
    if (input.email && !/^\S+@\S+\.\S+$/.test(input.email))
      e.email = "Format email tidak valid";
    if (input.telepon && !/^[0-9+\-\s()]{6,30}$/.test(input.telepon))
      e.telepon = "Format telepon tidak valid";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    let konfirmasi = false;

    if (
      item.badan_hukum_sendiri === "YA" &&
      !isAkar &&
      input.badan_hukum_sendiri === "TIDAK"
    ) {
      const c = await Swal.fire({
        title: "Ubah menjadi ikut pusat?",
        text: "Nama badan hukum, NPWP, dan nomor akta unit ini akan dihapus.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, lanjutkan",
        cancelButtonText: "Batal",
      });
      if (!c.isConfirmed) return;
      konfirmasi = true;
    }

    try {
      setLoading(true);

      const result = await updatePerusahaan(item.kd_perusahaan, {
        ...input,
        badan_hukum_sendiri: isAkar ? "YA" : input.badan_hukum_sendiri,
        tgl_berlaku: tglBerlaku,
        alasan,
        konfirmasi_hapus_legal: konfirmasi,
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
    `w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400 ${
      errors[key] ? "border-red-500" : "border-gray-300"
    }`;

  const err = (key: string) =>
    errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>;

  return (
    <ModalShell
      title="Ubah Data"
      subtitle={item.kd_perusahaan}
      maxWidth="max-w-2xl"
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
            className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50">
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </>
      }>
      <div className="space-y-7">
        {/* IDENTITAS */}
        <FormSection title="Identitas">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kode Cabang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={input.kode_cabang}
                maxLength={30}
                autoFocus
                onChange={(e) => set("kode_cabang", e.target.value)}
                className={inputClass("kode_cabang")}
              />
              {err("kode_cabang")}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Singkatan
              </label>
              <input
                type="text"
                value={input.singkatan}
                maxLength={30}
                onChange={(e) => set("singkatan", e.target.value)}
                className={inputClass("singkatan")}
              />
              {err("singkatan")}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={input.nama}
                maxLength={150}
                onChange={(e) => set("nama", e.target.value)}
                className={inputClass("nama")}
              />
              {err("nama")}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tipe <span className="text-red-500">*</span>
              </label>
              <select
                value={input.kd_tipe_perusahaan}
                onChange={(e) => pilihTipe(e.target.value)}
                className={`${inputClass("kd_tipe_perusahaan")} bg-white`}>
                <option value="">-- Pilih tipe --</option>
                {tipePilihan.map((t) => (
                  <option
                    key={t.kd_tipe_perusahaan}
                    value={t.kd_tipe_perusahaan}>
                    {t.nama}
                  </option>
                ))}
                {tipeSaatIniTidakAda && (
                  <option value={item.kd_tipe_perusahaan}>
                    {item.nama_tipe}
                  </option>
                )}
              </select>
              {err("kd_tipe_perusahaan")}
              <p className="mt-1 text-xs text-gray-400">
                Perubahan tipe tercatat di riwayat
              </p>
            </div>
          </div>
        </FormSection>

        {/* BADAN HUKUM */}
        <FormSection title="Badan hukum">
          {isAkar ? (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
              Grup utama selalu berbadan hukum sendiri.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <ChoiceButton
                title="Ikut pusat"
                desc="Memakai badan hukum induk terdekat"
                selected={input.badan_hukum_sendiri === "TIDAK"}
                onClick={() => set("badan_hukum_sendiri", "TIDAK")}
              />
              <ChoiceButton
                title="Badan hukum sendiri"
                desc={
                  tipeMelarang
                    ? "Tipe ini tidak boleh berbadan hukum"
                    : "Punya NPWP dan akta sendiri"
                }
                selected={input.badan_hukum_sendiri === "YA"}
                disabled={tipeMelarang}
                onClick={() => set("badan_hukum_sendiri", "YA")}
              />
            </div>
          )}

          {badanHukum && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nama Badan Hukum <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={input.nama_badan_hukum}
                  maxLength={150}
                  onChange={(e) => set("nama_badan_hukum", e.target.value)}
                  className={inputClass("nama_badan_hukum")}
                />
                {err("nama_badan_hukum")}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  NPWP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={input.npwp}
                  maxLength={25}
                  inputMode="numeric"
                  placeholder="15 atau 16 digit"
                  onChange={(e) => set("npwp", e.target.value)}
                  className={inputClass("npwp")}
                />
                {err("npwp")}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nomor Akta
                </label>
                <input
                  type="text"
                  value={input.no_akta}
                  maxLength={60}
                  onChange={(e) => set("no_akta", e.target.value)}
                  className={inputClass("no_akta")}
                />
                {err("no_akta")}
              </div>
            </div>
          )}
        </FormSection>

        {/* ALAMAT */}
        <FormSection title="Alamat (opsional)">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Provinsi
              </label>
              <select
                value={input.kd_provinsi}
                onChange={(e) => pilihProvinsi(e.target.value)}
                className={`${inputClass("kd_provinsi")} bg-white`}>
                <WilayahOptions
                  data={opsi.provinsi}
                  kosongLabel="-- Pilih provinsi --"
                />
              </select>
              {err("kd_provinsi")}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kabupaten / Kota
              </label>
              <select
                value={input.kd_kabupaten_kota}
                disabled={!input.kd_provinsi}
                onChange={(e) => pilihKota(e.target.value)}
                className={`${inputClass("kd_kabupaten_kota")} bg-white`}>
                <WilayahOptions
                  data={opsi.kota}
                  kosongLabel="-- Pilih kabupaten/kota --"
                />
              </select>
              {err("kd_kabupaten_kota")}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kecamatan
              </label>
              <select
                value={input.kd_kecamatan}
                disabled={!input.kd_kabupaten_kota}
                onChange={(e) => pilihKecamatan(e.target.value)}
                className={`${inputClass("kd_kecamatan")} bg-white`}>
                <WilayahOptions
                  data={opsi.kecamatan}
                  kosongLabel="-- Pilih kecamatan --"
                />
              </select>
              {err("kd_kecamatan")}
            </div>
          </div>

          {input.kd_kecamatan && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Desa / Kelurahan
                </label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <ChoiceButton
                    title="Pilih dari daftar"
                    desc="Mengambil dari data wilayah"
                    selected={input.mode_desa === "PILIH"}
                    onClick={() => pilihModeDesa("PILIH")}
                  />
                  <ChoiceButton
                    title="Tulis sendiri"
                    desc="Jika tidak ada di daftar"
                    selected={input.mode_desa === "MANUAL"}
                    onClick={() => pilihModeDesa("MANUAL")}
                  />
                </div>
              </div>

              {input.mode_desa === "PILIH" && (
                <div>
                  <select
                    value={input.kd_village}
                    onChange={(e) => set("kd_village", e.target.value)}
                    className={`${inputClass("kd_village")} bg-white`}>
                    <WilayahOptions
                      data={opsi.desa}
                      kosongLabel="-- Pilih desa/kelurahan --"
                    />
                  </select>
                  {err("kd_village")}
                  {opsi.desa !== null && opsi.desa.length === 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      Data desa/kelurahan belum tersedia untuk kecamatan ini.
                      Pilih &quot;Tulis sendiri&quot;.
                    </p>
                  )}
                </div>
              )}

              {input.mode_desa === "MANUAL" && (
                <div>
                  <input
                    type="text"
                    value={input.nama_desa_manual}
                    maxLength={150}
                    placeholder="Nama desa/kelurahan"
                    onChange={(e) => set("nama_desa_manual", e.target.value)}
                    className={inputClass("nama_desa_manual")}
                  />
                  {err("nama_desa_manual")}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Alamat Rinci
                  </label>
                  <input
                    type="text"
                    value={input.alamat_rinci}
                    maxLength={500}
                    placeholder="Jalan, nomor, RT/RW, gedung"
                    onChange={(e) => set("alamat_rinci", e.target.value)}
                    className={inputClass("alamat_rinci")}
                  />
                  {err("alamat_rinci")}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={input.kode_pos}
                    maxLength={5}
                    inputMode="numeric"
                    onChange={(e) =>
                      set("kode_pos", e.target.value.replace(/\D/g, ""))
                    }
                    className={inputClass("kode_pos")}
                  />
                  {err("kode_pos")}
                </div>
              </div>
            </>
          )}

          {(input.kd_provinsi || input.alamat_rinci || input.kode_pos) && (
            <button
              type="button"
              onClick={kosongkanAlamat}
              className="text-xs font-medium text-red-600 transition hover:underline">
              Kosongkan alamat
            </button>
          )}
        </FormSection>

        {/* KONTAK DAN WAKTU */}
        <FormSection title="Kontak dan waktu (opsional)">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Telepon
              </label>
              <input
                type="text"
                value={input.telepon}
                maxLength={30}
                onChange={(e) => set("telepon", e.target.value)}
                className={inputClass("telepon")}
              />
              {err("telepon")}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={input.email}
                maxLength={150}
                onChange={(e) => set("email", e.target.value)}
                className={inputClass("email")}
              />
              {err("email")}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tanggal Berdiri
              </label>
              <input
                type="date"
                value={input.tgl_berdiri}
                onChange={(e) => set("tgl_berdiri", e.target.value)}
                className={inputClass("tgl_berdiri")}
              />
              {err("tgl_berdiri")}
            </div>
          </div>
        </FormSection>

        {/* CATATAN PERUBAHAN */}
        <FormSection title="Catatan perubahan (opsional)">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Berlaku mulai
              </label>
              <input
                type="date"
                value={tglBerlaku}
                onChange={(e) => setTglBerlaku(e.target.value)}
                className={inputClass("tgl_berlaku")}
              />
              {err("tgl_berlaku")}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Alasan
              </label>
              <input
                type="text"
                value={alasan}
                maxLength={500}
                placeholder="Mis. sesuai SK nomor ..."
                onChange={(e) => setAlasan(e.target.value)}
                className={inputClass("alasan")}
              />
            </div>
          </div>
        </FormSection>
      </div>
    </ModalShell>
  );
}
