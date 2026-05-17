"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MapPinned, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Village } from "@/service/wilayah/wilayahService";

export const villageColumns: ColumnDef<Village>[] = [
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
    accessorKey: "id",
    enableSorting: false,
    header: "Kode",
  },
  {
    accessorKey: "district_id",
    enableSorting: false,
    header: "Kode Kecamatan",
  },
  {
    accessorKey: "name",
    enableSorting: true,
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 hover:text-gray-900">
        Nama Kelurahan / Desa
        {column.getIsSorted() === "asc" ? (
          <ArrowUp size={14} />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown size={14} />
        ) : (
          <ArrowUpDown size={14} className="text-gray-400" />
        )}
      </button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPinned size={16} className="text-blue-500" />
        <span>{row.original.name}</span>
      </div>
    ),
  },
];
