"use client";

import { useState } from "react";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { staticMenu } from "../config/menu";
import { iconMap } from "../config/iconMap";
import Link from "next/link";

interface Props {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: Props) {
  const [openMenu, setOpenMenu] = useState<Record<number, boolean>>({});

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen z-40
          bg-white shadow-md border-r border-gray-200
          transition-all duration-300 overflow-y-auto
          ${
            sidebarOpen
              ? "w-56 translate-x-0"
              : "w-20 -translate-x-full md:translate-x-0"
          }
          flex flex-col
        `}>
        {/* HEADER */}
        <div className="sticky top-0 bg-white z-10 p-4 font-bold text-lg border-b flex justify-between items-center">
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
                <Link
                  key={index}
                  href={menu.url!}
                  className="
                    w-full flex items-center gap-3
                    px-3 py-2 rounded-lg
                    hover:bg-gray-100
                    transition
                  ">
                  {Icon && <Icon size={18} />}

                  {sidebarOpen && <span>{menu.name}</span>}
                </Link>
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
                  className="
                    w-full flex items-center justify-between
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
                            block w-full
                            text-left px-2 py-1
                            rounded hover:bg-gray-100
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
    </>
  );
}
