"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown, LogOut, User } from "lucide-react";
import Swal from "sweetalert2";
import api from "@/service/api";
import { useAuthStore } from "@/src/store/auth/authStore";
import { useMyModuleStore } from "@/src/store/akses/myModuleSlice";
import { staticMenu } from "@/src/config/menu";
import type { MenuItem } from "@/src/config/menu";
import type { IconKey } from "@/src/config/iconMap";
import SidebarMenu from "./SidebarMenu";

interface Props {
  children: ReactNode;
  menuItems?: MenuItem[]; // kalau diisi, sidebar memakai ini (mode module)
  title?: string; // judul di header
}

export default function AppLayout({ children, menuItems, title }: Props) {
  const { sessionUser, getSession } = useAuthStore();
  const { modules, isSuperAdmin, fetchMyModules } = useMyModuleStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openProfile, setOpenProfile] = useState(false);

  // Muat sesi, dan daftar module hanya untuk mode admin
  useEffect(() => {
    getSession();
    if (!menuItems) fetchMyModules();
  }, [getSession, fetchMyModules, menuItems]);

  // Sidebar: terbuka di layar lebar sesuai pilihan terakhir, tertutup di layar kecil
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");

    const readPreference = () => {
      try {
        return localStorage.getItem("sidebar_open") !== "false";
      } catch {
        return true;
      }
    };

    setSidebarOpen(mq.matches ? readPreference() : false);

    const onChange = (e: MediaQueryListEvent) => {
      setSidebarOpen(e.matches ? readPreference() : false);
    };

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const saveSidebarPreference = (open: boolean) => {
    try {
      localStorage.setItem("sidebar_open", String(open));
    } catch {
      // abaikan jika localStorage tidak tersedia
    }
  };

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    saveSidebarPreference(next);
  };

  // Dipanggil saat grup diklik ketika sidebar sedang menyempit
  const expandSidebar = () => {
    setSidebarOpen(true);
    saveSidebarPreference(true);
  };

  // Di layar kecil, tutup sidebar setelah menu diklik
  const handleNavigate = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Yakin logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await api.post("/logout");
      localStorage.removeItem("token");
      router.push("/login");
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Logout gagal",
        text: "Terjadi kesalahan saat logout",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen
          overflow-y-auto border-r border-gray-200 bg-white shadow-md
          transition-all duration-300
          ${
            sidebarOpen
              ? "w-56 translate-x-0"
              : "-translate-x-full md:w-20 md:translate-x-0"
          }
        `}>
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
          <h1 className="text-lg font-bold">
            {sidebarOpen ? "Modutrack" : "M"}
          </h1>
          <button
            onClick={toggleSidebar}
            className="rounded p-1 transition hover:bg-gray-100">
            <Menu size={20} />
          </button>
        </div>

        {/* MENU */}
        <nav className="space-y-1 p-2 text-sm">
          {menuItems ? (
            // MODE MODULE: menu dari database
            menuItems.map((menu, index) => (
              <SidebarMenu
                key={index}
                item={menu}
                sidebarOpen={sidebarOpen}
                onExpand={expandSidebar}
                onNavigate={handleNavigate}
              />
            ))
          ) : (
            // MODE ADMIN
            <>
              <SidebarMenu
                item={staticMenu[0]}
                sidebarOpen={sidebarOpen}
                onExpand={expandSidebar}
                onNavigate={handleNavigate}
              />

              {modules.length > 0 && (
                <SidebarMenu
                  item={{
                    name: "Module",
                    icon: "Boxes",
                    children: modules.map((m) => ({
                      name: m.nama_module,
                      url: m.url_module ?? "#",
                      icon: (m.icon_module ?? undefined) as IconKey | undefined,
                    })),
                  }}
                  sidebarOpen={sidebarOpen}
                  onExpand={expandSidebar}
                  onNavigate={handleNavigate}
                />
              )}

              {isSuperAdmin &&
                staticMenu
                  .slice(1)
                  .map((menu, index) => (
                    <SidebarMenu
                      key={index}
                      item={menu}
                      sidebarOpen={sidebarOpen}
                      onExpand={expandSidebar}
                      onNavigate={handleNavigate}
                    />
                  ))}
            </>
          )}
        </nav>
      </aside>

      {/* CONTENT */}
      <div
        className={`
          transition-all duration-300
          ${sidebarOpen ? "md:ml-56" : "md:ml-20"}
        `}>
        {/* NAVBAR */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu />
            </button>

            <h1 className="text-lg font-semibold">{title ?? "Dashboard"}</h1>
          </div>

          {/* PROFILE */}
          <div className="relative">
            <button
              onClick={() => setOpenProfile(!openProfile)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-gray-100">
              <User size={18} />
              <span className="text-sm">{sessionUser?.user_name}</span>
              <ChevronDown size={16} />
            </button>

            {openProfile && (
              <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-lg border bg-white shadow-lg">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full px-4 py-2 text-left transition hover:bg-gray-100">
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-500 transition hover:bg-gray-100">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* MAIN */}
        <main className="min-h-screen space-y-6 p-6">{children}</main>
      </div>
    </div>
  );
}
