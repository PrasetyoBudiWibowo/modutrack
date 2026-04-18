"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { staticMenu } from "../config/menu";
import { iconMap } from "../config/iconMap";

interface Props {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: Props) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<Record<number, boolean>>({});

  return (
    <>
      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static z-40 bg-white shadow-md transition-all duration-300 overflow-hidden
        ${sidebarOpen ? "w-56 translate-x-0" : "w-20 -translate-x-full md:translate-x-0"}
        flex flex-col`}>
        {/* HEADER */}
        <div className="p-4 font-bold text-lg border-b flex justify-between items-center">
          {sidebarOpen ? "Modutrack" : "M"}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-2 space-y-2 text-sm">
          {staticMenu.map((menu, index) => {
            const Icon = menu.icon ? iconMap[menu.icon] : null;

            // MENU TANPA CHILD
            if (!menu.children) {
              return (
                <button
                  key={index}
                  onClick={() => router.push(menu.url!)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">
                  {Icon && <Icon size={18} />}
                  {sidebarOpen && <span>{menu.name}</span>}
                </button>
              );
            }

            // MENU DENGAN CHILD
            return (
              <div key={index}>
                <button
                  onClick={() =>
                    setOpenMenu({
                      ...openMenu,
                      [index]: !openMenu[index],
                    })
                  }
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100">
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
                      <button
                        key={i}
                        onClick={() => router.push(child.url!)}
                        className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100">
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
