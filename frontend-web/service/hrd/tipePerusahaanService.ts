import api from "@/service/api";

export type TipePerusahaan = {
  kd_tipe_perusahaan: string;
  nama: string;
  boleh_badan_hukum: "YA" | "TIDAK";
  status: "AKTIF" | "TIDAK";
  jumlah_dipakai: number;
};

export type TipePerusahaanInput = {
  nama: string;
  boleh_badan_hukum: "YA" | "TIDAK";
};

export const getTipePerusahaan = async () => {
  const res = await api.get("/tipe-perusahaan");
  return res.data;
};

export const createTipePerusahaan = async (data: TipePerusahaanInput) => {
  const res = await api.post("/tipe-perusahaan", data);
  return res.data;
};

export const updateTipePerusahaan = async (
  kd: string,
  data: TipePerusahaanInput,
) => {
  const res = await api.put(`/tipe-perusahaan/${kd}`, data);
  return res.data;
};

export const toggleTipePerusahaan = async (kd: string) => {
  const res = await api.patch(`/tipe-perusahaan/${kd}/toggle-status`);
  return res.data;
};
