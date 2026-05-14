"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/src/components/Sidebar";
import Navbar from "@/src/components/Navbar";
import Swal from "sweetalert2";
import { checkSession, SessionUser } from "@/service/auth/authService";

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
    let isAlertShown = false;

    const checkAuth = async () => {
      try {
        const res = await checkSession();

        if (res.status !== "authenticated") {
          if (!isAlertShown) {
            isAlertShown = true;

            localStorage.removeItem("token");

            await Swal.fire({
              icon: "warning",
              title: "Session Habis",
              text: "Silakan login kembali",
              confirmButtonText: "OK",
            });

            router.push("/login");
          }

          return;
        }

        setUser(res.user ?? null);
      } catch {
        localStorage.removeItem("token");

        if (!isAlertShown) {
          isAlertShown = true;

          await Swal.fire({
            icon: "error",
            title: "Akses Ditolak",
            text: "Silakan login kembali",
            confirmButtonText: "OK",
          });

          router.push("/login");
        }
      } finally {
        setChecking(false);
      }
    };

    checkAuth();

    const interval = setInterval(() => {
      checkAuth();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

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
