"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { TipePerusahaan } from "@/service/hrd/tipePerusahaanService";

interface Props {
  onEdit: (item: TipePerusahaan) => void;
  onToggle: (item: TipePerusahaan) => void;
}

export const tipePerusahaanColumns = ({
  onEdit,
  onToggle,
}: Props): ColumnDef<TipePerusahaan>[] => [
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
    accessorKey: "nama",
    enableSorting: true,
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 hover:text-gray-900">
        Nama Tipe
        {column.getIsSorted() === "asc" ? (
          <ArrowUp size={14} />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown size={14} />
        ) : (
          <ArrowUpDown size={14} className="text-gray-400" />
        )}
      </button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.nama}</span>,
  },
  {
    accessorKey: "boleh_badan_hukum",
    enableSorting: false,
    header: "Boleh Berbadan Hukum",
    cell: ({ row }) =>
      row.original.boleh_badan_hukum === "YA" ? "Ya" : "Tidak",
  },
  {
    accessorKey: "jumlah_dipakai",
    enableSorting: false,
    header: "Dipakai",
    cell: ({ row }) => `${row.original.jumlah_dipakai} unit`,
  },
  {
    accessorKey: "status",
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.original.status === "AKTIF"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
        {row.original.status === "AKTIF" ? "Aktif" : "Nonaktif"}
      </span>
    ),
  },
  {
    id: "aksi",
    enableSorting: false,
    header: "Aksi",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(row.original)}
          title="Ubah"
          className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-50">
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onToggle(row.original)}
          title={row.original.status === "AKTIF" ? "Nonaktifkan" : "Aktifkan"}
          className={`rounded-lg p-1.5 transition ${
            row.original.status === "AKTIF"
              ? "text-green-500 hover:bg-green-50"
              : "text-gray-400 hover:bg-gray-50"
          }`}>
          {row.original.status === "AKTIF" ? (
            <ToggleRight size={20} />
          ) : (
            <ToggleLeft size={20} />
          )}
        </button>
      </div>
    ),
  },
];
