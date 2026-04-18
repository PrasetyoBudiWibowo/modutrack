"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/src/components/Sidebar";
import Navbar from "@/src/components/Navbar";
import Swal from "sweetalert2";
import { checkSession, SessionUser } from "@/utils/apiService";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await checkSession();

        if (res.status !== "authenticated") {
          await Swal.fire({
            icon: "warning",
            title: "Akses Ditolak",
          });
          router.push("/login");
          return;
        }

        setUser(res.user ?? null);
      } catch {
        router.push("/login");
      }

      setChecking(false);
    };

    checkAuth();
  }, []);

  if (checking) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Navbar user={user} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <div className="bg-white p-6 rounded-lg shadow">
            Dashboard Content
          </div>
        </main>
      </div>
    </div>
  );
}
