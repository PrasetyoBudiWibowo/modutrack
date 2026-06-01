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
import type { Menu } from "@/service/menu/menuService";

interface MenuColumnsProps {
  onEdit: (item: Menu) => void;
  onToggle: (item: Menu) => void;
  menus: Menu[];
}

const getMenuLevel = (menus: Menu[], kd_menu: string): number => {
  const menu = menus.find((m) => m.kd_menu === kd_menu);
  if (!menu || !menu.parent_menu) return 0;
  return 1 + getMenuLevel(menus, menu.parent_menu);
};

export const menuColumns = ({
  onEdit,
  onToggle,
  menus,
}: MenuColumnsProps): ColumnDef<Menu>[] => [
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
    accessorKey: "module",
    enableSorting: false,
    header: "Module",
    cell: ({ row }) =>
      row.original.module?.nama_module ?? row.original.kd_module,
  },
  {
    accessorKey: "nama_menu",
    enableSorting: true,
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 hover:text-gray-900">
        Nama Menu
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
      const level = getMenuLevel(menus, row.original.kd_menu);
      return (
        <span style={{ paddingLeft: `${level * 16}px` }}>
          {level > 0 && <span className="text-gray-400 mr-1">└</span>}
          {row.original.nama_menu}
        </span>
      );
    },
  },
  {
    accessorKey: "parent_menu",
    enableSorting: false,
    header: "Parent",
    cell: ({ row }) => row.original.parent?.nama_menu ?? "-",
  },
  {
    accessorKey: "icon_menu",
    enableSorting: false,
    header: "Icon",
    cell: ({ row }) => row.original.icon_menu ?? "-",
  },
  {
    accessorKey: "url_menu",
    enableSorting: false,
    header: "URL",
    cell: ({ row }) => row.original.url_menu ?? "-",
  },
  {
    accessorKey: "urutan",
    enableSorting: true,
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 hover:text-gray-900">
        Urutan
        {column.getIsSorted() === "asc" ? (
          <ArrowUp size={14} />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown size={14} />
        ) : (
          <ArrowUpDown size={14} className="text-gray-400" />
        )}
      </button>
    ),
  },
  {
    accessorKey: "status_akses",
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.original.status_akses === "AKTIF"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
        {row.original.status_akses}
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
          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition">
          <Pencil size={16} />
        </button>

        <button
          onClick={() => onToggle(row.original)}
          className={`p-1.5 rounded-lg transition ${
            row.original.status_akses === "AKTIF"
              ? "text-green-500 hover:bg-green-50"
              : "text-gray-400 hover:bg-gray-50"
          }`}>
          {row.original.status_akses === "AKTIF" ? (
            <ToggleRight size={20} />
          ) : (
            <ToggleLeft size={20} />
          )}
        </button>
      </div>
    ),
  },
];
