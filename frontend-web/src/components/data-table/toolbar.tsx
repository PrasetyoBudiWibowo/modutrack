"use client";
import { Search, RefreshCcw, LoaderCircle } from "lucide-react";

interface ToolbarProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  totalData: number;
  loading?: boolean;
  onRefresh: () => Promise<void>;
}
export default function Toolbar({
  search,
  setSearch,
  totalData,
  loading = false,
  onRefresh,
}: ToolbarProps) {
  return (
    <div className=" flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between ">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full md:max-w-sm">
          <Search
            size={18}
            className=" absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 "
          />
          <input
            type="text"
            placeholder="Cari data..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className=" w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 "
          />
        </div>
        <div className=" hidden whitespace-nowrap text-sm text-gray-500 md:block ">
          Total:
          <span className="ml-1 font-semibold text-gray-700">{totalData}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className=" inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ">
          {loading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <RefreshCcw size={16} />
          )}
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
