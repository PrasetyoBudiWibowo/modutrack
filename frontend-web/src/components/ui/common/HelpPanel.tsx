import { ReactNode } from "react";
import { ChevronRight, CircleHelp } from "lucide-react";

export default function HelpPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-sm font-medium text-gray-700 [&::-webkit-details-marker]:hidden">
        <CircleHelp size={18} className="text-blue-500" />
        {title}
        <ChevronRight
          size={16}
          className="ml-auto transition group-open:rotate-90"
        />
      </summary>
      <div className="space-y-3 border-t border-gray-100 px-5 py-4 text-sm text-gray-600">
        {children}
      </div>
    </details>
  );
}
