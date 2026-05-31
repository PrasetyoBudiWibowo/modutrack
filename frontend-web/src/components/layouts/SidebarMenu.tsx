"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { iconMap } from "@/src/config/iconMap";
import type { MenuItem } from "@/src/config/menu";

interface Props {
  item: MenuItem;
  sidebarOpen: boolean;
  depth?: number;
}

export default function SidebarMenu({ item, sidebarOpen, depth = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon ? iconMap[item.icon] : null;
  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = sidebarOpen ? `${12 + depth * 12}px` : "12px";

  if (!hasChildren) {
    return (
      <Link
        href={item.url!}
        style={{ paddingLeft }}
        className="flex items-center gap-3 py-2 pr-3 rounded-lg hover:bg-gray-100 transition">
        {Icon && depth === 0 && <Icon size={18} />}
        {depth > 0 && sidebarOpen && (
          <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
        )}
        {sidebarOpen && <span className="text-sm">{item.name}</span>}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{ paddingLeft }}
        className="w-full flex items-center justify-between py-2 pr-3 rounded-lg hover:bg-gray-100 transition">
        <div className="flex items-center gap-3">
          {Icon && depth === 0 && <Icon size={18} />}
          {depth > 0 && sidebarOpen && (
            <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
          )}
          {sidebarOpen && <span className="text-sm">{item.name}</span>}
        </div>
        {sidebarOpen &&
          (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
      </button>

      {open && sidebarOpen && (
        <div>
          {item.children!.map((child, i) => (
            <SidebarMenu
              key={i}
              item={child}
              sidebarOpen={sidebarOpen}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
