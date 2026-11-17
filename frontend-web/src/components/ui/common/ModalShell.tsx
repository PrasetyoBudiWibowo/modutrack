"use client";

import { ReactNode, useEffect, useState } from "react";
import { X } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidth = "max-w-md",
}: Props) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Animasi keluar dulu, baru unmount
  const requestClose = () => {
    setAnimate(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        animate ? "bg-black/50" : "bg-black/0"
      }`}>
      <div
        className={`mx-4 max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-2xl bg-white shadow-xl transition-all duration-300 ${
          animate
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
          <button
            onClick={requestClose}
            className="rounded-lg p-1.5 transition-all duration-200 hover:rotate-90 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export { type Props as ModalShellProps };
