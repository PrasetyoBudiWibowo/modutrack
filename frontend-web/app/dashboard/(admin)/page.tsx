"use client";

import { useAuthStore } from "@/src/store/auth/authStore";

export default function DashboardPage() {
  const { sessionUser, loadingSession } = useAuthStore();

  if (loadingSession) {
    return (
      <div
        className="
          flex items-center justify-center
          h-[calc(100vh-120px)]
        ">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

        <p className="mt-1 text-sm text-gray-500">
          Selamat datang kembali
          {sessionUser?.user_name ? `, ${sessionUser.user_name}` : ""}
        </p>
      </div>

      <div
        className="
          bg-white rounded-2xl
          border border-gray-200
          shadow-sm
          p-6
        ">
        <h2 className="text-lg font-semibold text-gray-800">Overview</h2>

        <p className="mt-2 text-sm text-gray-500">
          Sistem management Modutrack berhasil berjalan.
        </p>
      </div>
    </section>
  );
}
