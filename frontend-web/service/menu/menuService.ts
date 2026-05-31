import api from "@/service/api";
import type { Module } from "@/service/module/moduleService";

export type Menu = {
  kd_menu: string;
  kd_module: string;
  parent_menu: string | null;
  nama_menu: string;
  icon_menu: string | null;
  url_menu: string | null;
  urutan: number;
  status_akses: "AKTIF" | "TIDAK";
  module?: Module;
  parent?: Menu;
};

export type MenuInput = {
  kd_module: string;
  parent_menu: string;
  nama_menu: string;
  icon_menu: string;
  url_menu: string;
  urutan: number;
  is_parent: boolean;
};

export type MenuInputErrors = {
  [K in keyof MenuInput]?: string;
};

export const getAllMenu = async () => {
  const res = await api.get("/menu");
  return res.data;
};

export const createMenu = async (kd_user: string, data: MenuInput) => {
  const res = await api.post("/menu/create", {
    kd_user,
    ...data,
  });
  return res.data;
};

export const toggleStatusMenu = async (kd_menu: string) => {
  const res = await api.patch(`/menu/${kd_menu}/toggle-status`);
  return res.data;
};
