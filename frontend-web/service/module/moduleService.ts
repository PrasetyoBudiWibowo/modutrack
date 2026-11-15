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

export type ModuleMenuItem = {
  kd_menu: string;
  parent_menu: string | null;
  nama_menu: string;
  icon_menu: string | null;
  url_menu: string | null;
  urutan: number;
};

export type ModuleInfo = {
  kd_module: string;
  nama_module: string;
  icon_module: string | null;
  url_module: string | null;
};

export const getAllModule = async () => {
  const res = await api.get("/module");
  return res.data;
};

export const createModule = async (data: ModuleInput) => {
  const res = await api.post("/module/create", data);
  return res.data;
};

export const toggleStatusModule = async (kd_module: string) => {
  const res = await api.patch(`/module/${kd_module}/toggle-status`);
  return res.data;
};

export type ModuleInputErrors = {
  [K in keyof ModuleInput]?: string;
};

export const updateModule = async (kd_module: string, data: ModuleInput) => {
  const res = await api.put(`/module/${kd_module}`, data);
  return res.data;
};

export const getModuleMenus = async (slug: string) => {
  const res = await api.get(`/module-menu/${slug}`);
  return res.data;
};
