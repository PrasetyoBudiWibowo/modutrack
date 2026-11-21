import api from "@/service/api";

export type YaTidak = "YA" | "TIDAK";

export type Perusahaan = {
  kd_perusahaan: string;
  kode_cabang: string;
  nama: string;
  singkatan: string | null;
  kd_tipe_perusahaan: string;
  kd_induk: string | null;
  badan_hukum_sendiri: YaTidak;
  nama_badan_hukum: string | null;
  npwp: string | null;
  no_akta: string | null;
  kd_provinsi: string | null;
  kd_kabupaten_kota: string | null;
  kd_kecamatan: string | null;
  mode_desa: "PILIH" | "MANUAL" | null;
  kd_village: string | null;
  nama_desa_manual: string | null;
  alamat_rinci: string | null;
  kode_pos: string | null;
  telepon: string | null;
  email: string | null;
  tgl_berdiri: string | null;
  tgl_tutup: string | null;
  status: "AKTIF" | "TIDAK";
  nama_tipe: string | null;
  nama_kota: string | null;
  jumlah_anak: number;
  badan_hukum_efektif: {
    kd_perusahaan: string;
    nama_badan_hukum: string | null;
  } | null;
};

export type OpsiTipe = {
  kd_tipe_perusahaan: string;
  nama: string;
  boleh_badan_hukum: YaTidak;
};

export type WilayahLevel = "provinsi" | "kota" | "kecamatan" | "desa";
export type WilayahOpsi = { id: string; nama: string };

export type PerusahaanInput = {
  kode_cabang: string;
  nama: string;
  singkatan: string;
  kd_tipe_perusahaan: string;
  kd_induk: string;
  badan_hukum_sendiri: YaTidak;
  nama_badan_hukum: string;
  npwp: string;
  no_akta: string;
  kd_provinsi: string;
  kd_kabupaten_kota: string;
  kd_kecamatan: string;
  mode_desa: "" | "PILIH" | "MANUAL";
  kd_village: string;
  nama_desa_manual: string;
  alamat_rinci: string;
  kode_pos: string;
  telepon: string;
  email: string;
  tgl_berdiri: string;
};

export type PerusahaanUbahExtra = {
  tgl_berlaku: string;
  alasan: string;
  konfirmasi_hapus_legal: boolean;
};

export type RiwayatPerusahaan = {
  jenis_kode: string | null;
  jenis_nama: string | null;
  nilai_lama: Record<string, unknown> | null;
  nilai_baru: Record<string, unknown> | null;
  tgl_berlaku: string;
  alasan: string | null;
  dicatat_oleh: string;
  dicatat_pada: string;
};

export const getPerusahaan = async () => {
  const res = await api.get("/perusahaan");
  return res.data;
};

export const getOpsiTipe = async () => {
  const res = await api.get("/perusahaan/opsi/tipe");
  return res.data;
};

export const getOpsiWilayah = async (level: WilayahLevel, induk?: string) => {
  const res = await api.get("/perusahaan/opsi/wilayah", {
    params: { level, induk },
  });
  return res.data;
};

export const getRiwayatPerusahaan = async (kd: string) => {
  const res = await api.get(`/perusahaan/${kd}/riwayat`);
  return res.data;
};

export const createPerusahaan = async (data: PerusahaanInput) => {
  const res = await api.post("/perusahaan", data);
  return res.data;
};

export const updatePerusahaan = async (
  kd: string,
  data: PerusahaanInput & PerusahaanUbahExtra,
) => {
  const res = await api.put(`/perusahaan/${kd}`, data);
  return res.data;
};

export const pindahPerusahaan = async (
  kd: string,
  data: { kd_induk: string; tgl_berlaku: string; alasan: string },
) => {
  const res = await api.post(`/perusahaan/${kd}/pindah`, data);
  return res.data;
};

export const nonaktifkanPerusahaan = async (
  kd: string,
  data: { tgl_berlaku: string; alasan: string },
) => {
  const res = await api.post(`/perusahaan/${kd}/nonaktifkan`, data);
  return res.data;
};

export const aktifkanPerusahaan = async (
  kd: string,
  data: { tgl_berlaku: string; alasan: string },
) => {
  const res = await api.post(`/perusahaan/${kd}/aktifkan`, data);
  return res.data;
};

export const hapusPerusahaan = async (kd: string, konfirmasi_nama: string) => {
  const res = await api.post(`/perusahaan/${kd}/hapus`, { konfirmasi_nama });
  return res.data;
};
