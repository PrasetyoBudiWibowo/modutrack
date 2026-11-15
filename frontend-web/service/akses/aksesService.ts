import api from "@/service/api";

export type Izin = {
  lihat: boolean;
  insert: boolean;
  edit: boolean;
  hapus: boolean;
  export: boolean;
};

export type AksesUser = {
  kd_user: string;
  user_name: string;
  level_user_id: number;
  is_super_admin: boolean;
  total_module: number;
};

export type AksesMenu = {
  kd_menu: string;
  parent_menu: string | null;
  nama_menu: string;
  url_menu: string | null;
  status_akses: "AKTIF" | "TIDAK";
  izin: Izin;
};

export type AksesModule = {
  kd_module: string;
  nama_module: string;
  status_module: "AKTIF" | "TIDAK";
  akses: boolean;
  menus: AksesMenu[];
};

export type MyModule = {
  kd_module: string;
  nama_module: string;
  icon_module: string | null;
  url_module: string | null;
};

export type SaveAksesPayload = {
  kd_user: string;
  modules: {
    kd_module: string;
    akses: boolean;
    menus: ({ kd_menu: string } & Izin)[];
  }[];
};

export const getAksesUsers = async () => {
  const res = await api.get("/akses/users");
  return res.data;
};

export const getUserAkses = async (kd_user: string) => {
  const res = await api.get("/akses/user", { params: { kd_user } });
  return res.data;
};

export const saveUserAkses = async (payload: SaveAksesPayload) => {
  const res = await api.put("/akses/user", payload);
  return res.data;
};

export const getMyModules = async () => {
  const res = await api.get("/me/modules");
  return res.data;
};
