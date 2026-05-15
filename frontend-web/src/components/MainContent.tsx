"use client";

import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function MainContent({ children, className = "" }: Props) {
  return <main className={`p-6 pt-24 space-y-6 ${className}`}>{children}</main>;
}
