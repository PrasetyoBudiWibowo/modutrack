import api from "@/service/api";

export type Module = {
  kd_module: string;
  nama_module: string;
  icon_module: string | null;
  url_module: string | null;
  urutan: number;
  status_module: "AKTIF" | "TIDAK";
};

export type ModuleInput = {
  nama_module: string;
  icon_module: string;
  url_module: string;
  urutan: number;
};

export const getAllModule = async () => {
  const res = await api.get("/module");
  return res.data;
};

export const createModule = async (kd_user: string, data: ModuleInput) => {
  const res = await api.post("/module/create", {
    kd_user,
    ...data,
  });
  return res.data;
};

export const toggleStatusModule = async (kd_module: string) => {
  const res = await api.patch(`/module/${kd_module}/toggle-status`);
  return res.data;
};

export type ModuleInputErrors = {
  [K in keyof ModuleInput]?: string;
};
