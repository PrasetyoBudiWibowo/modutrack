import { ReactNode } from "react";
import type { WilayahOpsi } from "@/service/hrd/perusahaanService";

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ChoiceButton({
  title,
  desc,
  selected,
  disabled,
  onClick,
}: {
  title: string;
  desc: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:bg-gray-50"
      }`}>
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </button>
  );
}

export function WilayahOptions({
  data,
  kosongLabel,
}: {
  data: WilayahOpsi[] | null;
  kosongLabel: string;
}) {
  if (data === null) return <option value="">Memuat...</option>;

  return (
    <>
      <option value="">{kosongLabel}</option>
      {data.map((o) => (
        <option key={o.id} value={o.id}>
          {o.nama}
        </option>
      ))}
    </>
  );
}
