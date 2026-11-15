"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { notFound, useParams, usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const MODULE_SLUG = "sales";

// Label breadcrumb per segmen URL
const PAGE_LABELS: Record<string, string> = {
  "supervisor-sales": "Supervisor Sales",
  salesman: "Sales",
};

export default function SalesLayout({ children }: { children: ReactNode }) {
  const { module: slug } = useParams<{ module: string }>();
  const pathname = usePathname();

  // Halaman SALES hanya boleh dibuka lewat /dashboard/sales/...
  if (slug !== MODULE_SLUG) notFound();

  const pageSegment = pathname.split("/")[3]; // /dashboard/sales/<halaman>
  const pageLabel = pageSegment ? PAGE_LABELS[pageSegment] : undefined;

  return (
    <div className="space-y-4">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1 text-sm text-gray-500">
        <Link
          href={`/dashboard/${MODULE_SLUG}`}
          className="inline-flex items-center gap-1 transition hover:text-gray-800">
          <Home size={14} />
          <span>Sales</span>
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
