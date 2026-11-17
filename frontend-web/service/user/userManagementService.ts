import api from "@/service/api";

export type BlokirAktif = {
  jenis: "SEMENTARA" | "PERMANEN";
  alasan: string;
  mulai_at: string | null;
  selesai_at: string | null;
};

export type ManagedUser = {
  kd_user: string;
  user_name: string;
  level_user_id: number;
  level_user: string | null;
  status_user: string;
  blokir: "YA" | "TIDAK";
  is_super_admin: boolean;
  is_self: boolean;
  login_terakhir: string | null;
  blokir_aktif: BlokirAktif | null;
  foto_url: string | null;
};

export type RiwayatBlokir = {
  jenis: "SEMENTARA" | "PERMANEN";
  status: "AKTIF" | "BERAKHIR" | "DICABUT";
  alasan: string;
  mulai_at: string | null;
  selesai_at: string | null;
  diblokir_oleh: string;
  dicabut_at: string | null;
  dicabut_oleh: string | null;
  alasan_cabut: string | null;
};

export type BlokirInput = {
  jenis: "SEMENTARA" | "PERMANEN";
  selesai_at: string;
  alasan: string;
};

export type UserLevel = {
  id: number;
  level_user: string;
};

export type UpdateUserInput = {
  level_user_id: number;
  password: string;
  password_confirmation: string;
  foto: File | null;
  hapus_foto: boolean;
};

export type BlokirInputErrors = { [K in keyof BlokirInput]?: string };

export const getManagedUsers = async () => {
  const res = await api.get("/user-management/users");
  return res.data;
};

export const nonaktifkanUser = async (kd_user: string) => {
  const res = await api.post("/user-management/nonaktifkan", { kd_user });
  return res.data;
};

export const aktifkanUser = async (kd_user: string) => {
  const res = await api.post("/user-management/aktifkan", { kd_user });
  return res.data;
};

export const blokirUser = async (kd_user: string, data: BlokirInput) => {
  const res = await api.post("/user-management/blokir", {
    kd_user,
    jenis: data.jenis,
    alasan: data.alasan,
    ...(data.jenis === "SEMENTARA" ? { selesai_at: data.selesai_at } : {}),
  });
  return res.data;
};

export const cabutBlokirUser = async (kd_user: string, alasan: string) => {
  const res = await api.post("/user-management/cabut-blokir", {
    kd_user,
    alasan,
  });
  return res.data;
};

export const getRiwayatBlokir = async (kd_user: string) => {
  const res = await api.get("/user-management/riwayat", {
    params: { kd_user },
  });
  return res.data;
};

export const getUserLevels = async () => {
  const res = await api.get("/user-management/levels");
  return res.data;
};

export const updateUser = async (kd_user: string, data: UpdateUserInput) => {
  const form = new FormData();
  form.append("kd_user", kd_user);
  form.append("level_user_id", String(data.level_user_id));

  if (data.password) {
    form.append("password", data.password);
    form.append("password_confirmation", data.password_confirmation);
  }

  if (data.foto) form.append("foto", data.foto);
  form.append("hapus_foto", data.hapus_foto ? "1" : "0");

  const res = await api.post("/user-management/update", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
