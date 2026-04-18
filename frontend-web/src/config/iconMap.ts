import {
  LayoutDashboard,
  Settings,
  LucideIcon,
} from "lucide-react";

export type IconKey = "dashboard" | "settings";

export const iconMap: Record<IconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  settings: Settings,
};