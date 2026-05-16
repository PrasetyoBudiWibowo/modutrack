"use client";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
  VisibilityState,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  SlidersHorizontal,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  title?: string;
  description?: string;
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  title = "Data Table",
  description = "Daftar data",
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize: 10 } },
    state: { columnVisibility, sorting },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  });

  const pagination = table.getState().pagination;

  const startData =
    data.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;

  const endData = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    data.length,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className=" flex flex-col gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4 md:flex-row md:items-center md:justify-between ">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <p className="mt-1 text-sm text-gray-500"> {description} </p>
        </div>
        {/* ACTION */}
        <div className="flex items-center gap-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className=" inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 ">
                <SlidersHorizontal size={16} /> <span>Columns</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                align="end"
                className=" z-50 min-w-[200px] rounded-xl border border-gray-200 bg-white p-2 shadow-lg ">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenu.CheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      className=" flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm capitalize outline-none transition hover:bg-gray-100 ">
                      <span>{column.id}</span>
                      {column.getIsVisible() && (
                        <span className="text-blue-500"> ✓ </span>
                      )}
                    </DropdownMenu.CheckboxItem>
                  ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className=" whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700 ">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className=" flex items-center justify-center gap-2 text-gray-500 ">
                    <LoaderCircle size={20} className="animate-spin" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className=" py-16 text-center text-gray-500 ">
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className=" border-b border-gray-100 transition-colors hover:bg-blue-50/40 ">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className=" whitespace-nowrap px-4 py-3 text-gray-700 ">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* FOOTER */}
      <div className=" flex flex-col gap-4 border-t border-gray-200 bg-gray-50 px-5 py-4 md:flex-row md:items-center md:justify-between ">
        {/* INFO */}
        <div className="text-sm text-gray-500">
          Menampilkan
          <span className="font-semibold text-gray-700">{startData}</span> -
          <span className="font-semibold text-gray-700"> {endData} </span> dari
          <span className="font-semibold text-gray-700"> {data.length} </span>
          data
        </div>
        {/* PAGINATION */}
        <div className="flex items-center gap-3">
          {/* PAGE SIZE */}
          <select
            value={pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className=" rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ">
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} / halaman
              </option>
            ))}
          </select>
          {/* PREVIOUS */}
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className=" flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ">
            <ChevronLeft size={18} />
          </button>
          {/* PAGE */}
          <div className="min-w-[70px] text-center text-sm font-medium text-gray-700">
            {pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          {/* NEXT */}
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className=" flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
