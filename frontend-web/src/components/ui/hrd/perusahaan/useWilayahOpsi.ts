"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getOpsiWilayah,
  type WilayahLevel,
  type WilayahOpsi,
} from "@/service/hrd/perusahaanService";

export type OpsiWilayah = Record<WilayahLevel, WilayahOpsi[] | null>; // null = sedang dimuat

interface Awal {
  kd_provinsi: string;
  kd_kabupaten_kota: string;
  kd_kecamatan: string;
  mode_desa: string;
}

export function useWilayahOpsi(awal: Awal) {
  const [opsi, setOpsi] = useState<OpsiWilayah>(() => ({
    provinsi: null,
    kota: awal.kd_provinsi ? null : [],
    kecamatan: awal.kd_kabupaten_kota ? null : [],
    desa: awal.kd_kecamatan && awal.mode_desa === "PILIH" ? null : [],
  }));

  const urutan = useRef<Partial<Record<WilayahLevel, number>>>({});

  const muat = useCallback(async (level: WilayahLevel, induk?: string) => {
    const id = (urutan.current[level] = (urutan.current[level] ?? 0) + 1);

    try {
      const res = await getOpsiWilayah(level, induk);
      if (urutan.current[level] !== id) return; // abaikan respons yang sudah usang
      setOpsi((p) => ({ ...p, [level]: res.data ?? [] }));
    } catch (error) {
      console.error(error);
      if (urutan.current[level] === id) setOpsi((p) => ({ ...p, [level]: [] }));
    }
  }, []);

  useEffect(() => {
    muat("provinsi");
    if (awal.kd_provinsi) muat("kota", awal.kd_provinsi);
    if (awal.kd_kabupaten_kota) muat("kecamatan", awal.kd_kabupaten_kota);
    if (awal.kd_kecamatan && awal.mode_desa === "PILIH")
      muat("desa", awal.kd_kecamatan);
    // dijalankan sekali saat modal dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { opsi, setOpsi, muat };
}
