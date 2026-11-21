import { ReactNode } from "react";
import { Check, Lock } from "lucide-react";

export type SetupStep = {
  title: string;
  description: string;
  state: "done" | "active" | "locked";
  action?: ReactNode;
  doneAction?: ReactNode;
};

export default function SetupSteps({
  title,
  steps,
}: {
  title: string;
  steps: SetupStep[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

      <ol className="mt-5 space-y-5">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                s.state === "done"
                  ? "bg-green-100 text-green-700"
                  : s.state === "active"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}>
              {s.state === "done" ? (
                <Check size={16} />
              ) : s.state === "locked" ? (
                <Lock size={14} />
              ) : (
                i + 1
              )}
            </div>

            {/* KOLOM TEKS: judul, deskripsi, dan tombol */}
            <div className="min-w-0 flex-1">
              <p
                className={`font-medium ${s.state === "locked" ? "text-gray-400" : "text-gray-800"}`}>
                {s.title}
              </p>
              <p
                className={`mt-0.5 text-sm ${s.state === "locked" ? "text-gray-400" : "text-gray-500"}`}>
                {s.description}
              </p>

              {s.state === "active" && s.action && (
                <div className="mt-3">{s.action}</div>
              )}
              {s.state === "done" && s.doneAction && (
                <div className="mt-2">{s.doneAction}</div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
