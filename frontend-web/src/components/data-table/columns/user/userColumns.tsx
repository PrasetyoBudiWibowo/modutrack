"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Ban,
  History,
  ShieldCheck,
  UserCheck,
  UserX,
  Pencil,
} from "lucide-react";
import type { ManagedUser } from "@/service/user/userManagementService";
import {
  formatDateTime,
  getUserState,
  type UserState,
} from "@/src/lib/userStatus";
import UserAvatar from "@/src/components/ui/common/UserAvatar";

interface Props {
  onToggleStatus: (item: ManagedUser) => void;
  onBlokir: (item: ManagedUser) => void;
  onCabut: (item: ManagedUser) => void;
  onRiwayat: (item: ManagedUser) => void;
}

interface Props {
  onToggleStatus: (item: ManagedUser) => void;
  onBlokir: (item: ManagedUser) => void;
  onCabut: (item: ManagedUser) => void;
  onRiwayat: (item: ManagedUser) => void;
  onEdit: (item: ManagedUser) => void;
}

const BADGE: Record<UserState, { label: string; className: string }> = {
  AKTIF: { label: "Aktif", className: "bg-green-100 text-green-700" },
  NONAKTIF: { label: "Nonaktif", className: "bg-gray-100 text-gray-600" },
  SUSPEND: { label: "Suspend", className: "bg-amber-100 text-amber-700" },
  DIBLOKIR: { label: "Diblokir", className: "bg-red-100 text-red-700" },
};

export const userColumns = ({
  onToggleStatus,
  onBlokir,
  onCabut,
  onRiwayat,
  onEdit,
}: Props): ColumnDef<ManagedUser>[] => [
  {
    id: "no",
    header: "No",
    enableSorting: false,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  {
    accessorKey: "user_name",
    enableSorting: true,
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 hover:text-gray-900">
        User Name
        {column.getIsSorted() === "asc" ? (
          <ArrowUp size={14} />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown size={14} />
        ) : (
          <ArrowUpDown size={14} className="text-gray-400" />
        )}
      </button>
    ),
    cell: ({ row }) => {
      const u = row.original;

      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
            {u.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <UserAvatar
                name={u.user_name}
                src={u.foto_url}
                className="h-8 w-8 text-xs"
              />
            ) : (
              u.user_name.charAt(0)
            )}
          </div>
          <span className="font-medium">
            {u.user_name}
            {u.is_self && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                (Anda)
              </span>
            )}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "level_user",
    enableSorting: false,
    header: "Level",
    cell: ({ row }) => row.original.level_user ?? "-",
  },
  {
    id: "status",
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => {
      const u = row.original;
      const state = getUserState(u);
      const badge = BADGE[state];

      return (
        <div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
          {state === "SUSPEND" && u.blokir_aktif?.selesai_at && (
            <p className="mt-0.5 text-xs text-gray-400">
              s/d {formatDateTime(u.blokir_aktif.selesai_at)}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "login_terakhir",
    enableSorting: false,
    header: "Login Terakhir",
    cell: ({ row }) => row.original.login_terakhir ?? "-",
  },
  {
    id: "aksi",
    enableSorting: false,
    header: "Aksi",
    cell: ({ row }) => {
      const u = row.original;
      const state = getUserState(u);
      const locked = u.is_self || u.is_super_admin;
      const blocked = state === "SUSPEND" || state === "DIBLOKIR";

      return (
        <div className="flex items-center gap-1">
          {locked ? (
            <span className="flex items-center gap-1 px-2 text-xs text-gray-400">
              <ShieldCheck size={14} />
              {u.is_self ? "Akun Anda" : "Super Admin"}
            </span>
          ) : (
            <>
              {!blocked && (
                <button
                  onClick={() => onToggleStatus(u)}
                  title={state === "NONAKTIF" ? "Aktifkan" : "Nonaktifkan"}
                  className={`rounded-lg p-1.5 transition ${
                    state === "NONAKTIF"
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  {state === "NONAKTIF" ? (
                    <UserCheck size={18} />
                  ) : (
                    <UserX size={18} />
                  )}
                </button>
              )}

              {blocked ? (
                <button
                  onClick={() => onCabut(u)}
                  title="Cabut blokir"
                  className="rounded-lg p-1.5 text-green-600 transition hover:bg-green-50">
                  <ShieldCheck size={18} />
                </button>
              ) : (
                <button
                  onClick={() => onBlokir(u)}
                  title="Blokir"
                  className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50">
                  <Ban size={18} />
                </button>
              )}
            </>
          )}

          <button
            onClick={() => onEdit(u)}
            title="Edit user"
            className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-50">
            <Pencil size={18} />
          </button>

          <button
            onClick={() => onRiwayat(u)}
            title="Riwayat blokir"
            className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-50">
            <History size={18} />
          </button>
        </div>
      );
    },
  },
];
