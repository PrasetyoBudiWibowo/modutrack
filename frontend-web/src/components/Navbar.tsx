"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, User, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import api from "@/service/api";
import { SessionUser } from "@/utils/apiService";

interface Props {
  user: SessionUser | null;
  setSidebarOpen: (val: boolean) => void;
}

export default function Navbar({ user, setSidebarOpen }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Yakin logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
    });

    if (result.isConfirmed) {
      await api.post("/logout");
      router.push("/login");
    }
  };

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu />
        </button>

        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
          <User size={18} />
          <span className="text-sm">{user?.user_name}</span>
          <ChevronDown size={16} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow z-50">
            <button
              onClick={() => router.push("/profile")}
              className="w-full text-left px-4 py-2 hover:bg-gray-100">
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
