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
import type { Module } from "@/service/module/moduleService";

interface ModuleColumnsProps {
  onEdit: (item: Module) => void;
  onToggle: (item: Module) => void;
}

export const moduleColumns = ({
  onEdit,
  onToggle,
}: ModuleColumnsProps): ColumnDef<Module>[] => [
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
    accessorKey: "nama_module",
    enableSorting: true,
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 hover:text-gray-900">
        Nama Module
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
    accessorKey: "icon_module",
    enableSorting: false,
    header: "Icon",
    cell: ({ row }) => row.original.icon_module ?? "-",
  },
  {
    accessorKey: "url_module",
    enableSorting: false,
    header: "URL",
    cell: ({ row }) => row.original.url_module ?? "-",
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
    accessorKey: "status_module",
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.original.status_module === "AKTIF"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
        {row.original.status_module}
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
            row.original.status_module === "AKTIF"
              ? "text-green-500 hover:bg-green-50"
              : "text-gray-400 hover:bg-gray-50"
          }`}>
          {row.original.status_module === "AKTIF" ? (
            <ToggleRight size={20} />
          ) : (
            <ToggleLeft size={20} />
          )}
        </button>
      </div>
    ),
  },
];
