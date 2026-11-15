"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { iconMap } from "@/src/config/iconMap";
import type { MenuItem } from "@/src/config/menu";

interface Props {
  item: MenuItem;
  sidebarOpen: boolean;
  depth?: number;
  onExpand?: () => void; // dipanggil saat grup diklik ketika sidebar menyempit
  onNavigate?: () => void; // dipanggil saat link diklik (menutup sidebar di HP)
}

const hasActive = (item: MenuItem, pathname: string): boolean =>
  item.url === pathname ||
  (item.children?.some((child) => hasActive(child, pathname)) ?? false);

export default function SidebarMenu({
  item,
  sidebarOpen,
  depth = 0,
  onExpand,
  onNavigate,
}: Props) {
  const pathname = usePathname();
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);

  const Icon = item.icon ? iconMap[item.icon] : null;
  const hasChildren = !!item.children && item.children.length > 0;
  const active = hasActive(item, pathname);
  const paddingLeft = sidebarOpen ? `${12 + depth * 12}px` : "12px";

  const iconOrBullet = Icon ? (
    <Icon size={18} className="flex-shrink-0" />
  ) : depth > 0 && sidebarOpen ? (
    <span className="h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
  ) : null;

  // MENU TANPA CHILD
  if (!hasChildren) {
    return (
      <Link
        href={item.url ?? "#"}
        onClick={onNavigate}
        title={!sidebarOpen ? item.name : undefined}
        style={{ paddingLeft }}
        className={`flex items-center gap-3 rounded-lg py-2 pr-3 transition ${
          active ? "bg-blue-50 font-medium text-blue-600" : "hover:bg-gray-100"
        }`}>
        {iconOrBullet}
        {sidebarOpen && <span className="text-sm">{item.name}</span>}
      </Link>
    );
  }

  // Terbuka jika dipilih manual, atau otomatis jika ada anak yang sedang aktif
  const expanded = manualOpen ?? active;

  const handleClick = () => {
    if (!sidebarOpen) {
      onExpand?.();
      setManualOpen(true);
      return;
    }
    setManualOpen(!expanded);
  };

  // MENU DENGAN CHILD
  return (
    <div>
      <button
        onClick={handleClick}
        title={!sidebarOpen ? item.name : undefined}
        style={{ paddingLeft }}
        className={`flex w-full items-center justify-between rounded-lg py-2 pr-3 transition ${
          active && !expanded ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
        }`}>
        <div className="flex items-center gap-3">
          {iconOrBullet}
          {sidebarOpen && <span className="text-sm">{item.name}</span>}
        </div>
        {sidebarOpen &&
          (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
      </button>

      {expanded && sidebarOpen && (
        <div>
          {item.children!.map((child, i) => (
            <SidebarMenu
              key={i}
              item={child}
              sidebarOpen={sidebarOpen}
              depth={depth + 1}
              onExpand={onExpand}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
