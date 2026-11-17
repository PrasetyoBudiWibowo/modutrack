import type { ManagedUser } from "@/service/user/userManagementService";

export type UserState = "AKTIF" | "NONAKTIF" | "SUSPEND" | "DIBLOKIR";

export const getUserState = (u: ManagedUser): UserState => {
  if (u.blokir === "YA") {
    return u.blokir_aktif?.jenis === "SEMENTARA" ? "SUSPEND" : "DIBLOKIR";
  }
  return u.status_user === "ACTIVE" ? "AKTIF" : "NONAKTIF";
};

export const formatDateTime = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";
