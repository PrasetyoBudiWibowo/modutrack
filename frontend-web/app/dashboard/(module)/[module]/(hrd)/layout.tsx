"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { notFound, useParams, usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const MODULE_SLUG = "hrd";

// Label breadcrumb per segmen URL
const PAGE_LABELS: Record<string, string> = {
  "tipe-perusahaan": "Tipe Perusahaan",
  perusahaan: "Perusahaan & Cabang",
};

export default function HrdLayout({ children }: { children: ReactNode }) {
  const { module: slug } = useParams<{ module: string }>();
  const pathname = usePathname();

  // Halaman HRD hanya boleh dibuka lewat /dashboard/hrd/...
  if (slug !== MODULE_SLUG) notFound();

  const pageSegment = pathname.split("/")[3]; // /dashboard/hrd/<halaman>
  const pageLabel = pageSegment ? PAGE_LABELS[pageSegment] : undefined;

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-1 text-sm text-gray-500">
        <Link
          href={`/dashboard/${MODULE_SLUG}`}
          className="inline-flex items-center gap-1 transition hover:text-gray-800">
          <Home size={14} />
          <span>HRD</span>
        </Link>

        {pageLabel && (
          <>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="font-medium text-gray-700">{pageLabel}</span>
          </>
        )}
      </nav>

      {children}
    </div>
  );
}
