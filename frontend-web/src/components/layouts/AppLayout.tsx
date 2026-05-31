"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown, ChevronRight, LogOut, User } from "lucide-react";
import Swal from "sweetalert2";
import api from "@/service/api";
import { useAuthStore } from "@/src/store/auth/authStore";
import { staticMenu } from "@/src/config/menu";
import { iconMap } from "@/src/config/iconMap";
import SidebarMenu from "./SidebarMenu";

interface Props {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  const { sessionUser, getSession } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<Record<number, boolean>>({});
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    getSession();
  }, [getSession]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen
          bg-white border-r border-gray-200 shadow-md
          transition-all duration-300 overflow-y-auto
          ${
            sidebarOpen
              ? "translate-x-0 w-56"
              : "-translate-x-full md:translate-x-0 md:w-20"
          }
        `}>
        {/* HEADER */}
        <div
          className="
            sticky top-0 z-10
            bg-white border-b
            p-4 flex items-center justify-between
          ">
          <h1 className="font-bold text-lg">
            {sidebarOpen ? "Modutrack" : "M"}
          </h1>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="
              p-1 rounded
              hover:bg-gray-100
              transition
            ">
            <Menu size={20} />
          </button>
        </div>

        {/* MENU */}
        <nav className="p-2 space-y-2 text-sm">
          {staticMenu.map((menu, index) => {
            const Icon = menu.icon ? iconMap[menu.icon] : null;

            // MENU TANPA CHILD
            if (!menu.children) {
              return (
                <Link
                  key={index}
                  href={menu.url!}
                  className="
                    flex items-center gap-3
                    px-3 py-2 rounded-lg
                    hover:bg-gray-100
                    transition
                  ">
                  {Icon && <Icon size={18} />}

                  {sidebarOpen && <span>{menu.name}</span>}
                </Link>
              );
            }

            return (
              <div key={index}>
                <button
                  onClick={() =>
                    setOpenMenu((prev) => ({
                      ...prev,
                      [index]: !prev[index],
                    }))
                  }
                  className="
                    w-full
                    flex items-center justify-between
                    px-3 py-2 rounded-lg
                    hover:bg-gray-100
                    transition
                  ">
                  <div className="flex items-center gap-3">
                    {Icon && <Icon size={18} />}

                    {sidebarOpen && <span>{menu.name}</span>}
                  </div>

                  {sidebarOpen &&
                    (openMenu[index] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </button>

                {menu.children && openMenu[index] && sidebarOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {menu.children.map((child, i) => (
                      <Link
                        key={i}
                        href={child.url!}
                        className="
                            block px-2 py-1 rounded
                            hover:bg-gray-100
                            transition
                          ">
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* CONTENT */}
      <div
        className={`
          transition-all duration-300
          ${sidebarOpen ? "md:ml-56" : "md:ml-20"}
        `}>
        {/* NAVBAR */}
        <header
          className="
            sticky top-0 z-30
            bg-white border-b border-gray-200
            px-6 py-4
            flex items-center justify-between
          ">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu />
            </button>

            <h1 className="font-semibold text-lg">Dashboard</h1>
          </div>

          {/* PROFILE */}
          <div className="relative">
            <button
              onClick={() => setOpenProfile(!openProfile)}
              className="
                flex items-center gap-2
                px-3 py-2 rounded-lg
                hover:bg-gray-100
                transition
              ">
              <User size={18} />

              <span className="text-sm">{sessionUser?.user_name}</span>

              <ChevronDown size={16} />
            </button>

            {openProfile && (
              <div
                className="
                  absolute right-0 mt-2 w-40
                  bg-white border rounded-lg
                  shadow-lg overflow-hidden
                  z-50
                ">
                <button
                  onClick={() => router.push("/profile")}
                  className="
                    w-full text-left
                    px-4 py-2
                    hover:bg-gray-100
                    transition
                  ">
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="
                    w-full text-left
                    px-4 py-2
                    text-red-500
                    hover:bg-gray-100
                    flex items-center gap-2
                    transition
                  ">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* MAIN */}
        <main className="min-h-screen p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}
