import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type IconKey = keyof typeof Icons;

export const iconMap = Icons as unknown as Record<string, LucideIcon>;