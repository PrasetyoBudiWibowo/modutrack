// src/components/ui/LoadingModal.tsx
"use client";

import { LoaderCircle } from "lucide-react";

interface LoadingModalProps {
  show: boolean;
  title?: string;
  description?: string;
}

export default function LoadingModal({
  show,
  title = "Menyimpan Data",
  description = "Mohon tunggu, proses sedang berjalan...",
}: LoadingModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-50">
            <LoaderCircle size={32} className="animate-spin text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
