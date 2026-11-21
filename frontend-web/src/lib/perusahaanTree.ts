import type { Perusahaan } from "@/service/hrd/perusahaanService";

export const descendantIds = (list: Perusahaan[], kd: string): string[] =>
  list
    .filter((p) => p.kd_induk === kd)
    .flatMap((c) => [c.kd_perusahaan, ...descendantIds(list, c.kd_perusahaan)]);

export type FlatNode = { item: Perusahaan; level: number };

export const flattenTree = (
  list: Perusahaan[],
  parent: string | null = null,
  level = 0,
): FlatNode[] =>
  list
    .filter((p) => p.kd_induk === parent)
    .sort((a, b) => a.nama.localeCompare(b.nama))
    .flatMap((p) => [
      { item: p, level },
      ...flattenTree(list, p.kd_perusahaan, level + 1),
    ]);
