import api from "@/service/api";

export type Province = {
  id: string;
  name: string;
};

export type ProvinceDatabase = {
  kd_provinsi: string;
  id_provinsi: string;
  nama_provinsi: string;
};

export type Regency = {
  id: string;
  province_id: string;
  name: string;
};

export type District = {
  id: string;
  regency_id: string;
  name: string;
};

export type FetchProgress = {
  current: number;
  total: number;
  label: string;
} | null;

export const getProvinceExternal = async (): Promise<Province[]> => {
  const res = await fetch(
    "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
  );

  return await res.json();
};

export const getRegenciesExternal = async (): Promise<Regency[]> => {
  const provinceRes = await fetch(
    "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
  );

  const provinces = await provinceRes.json();

  let allRegencies: Regency[] = [];

  for (const province of provinces) {
    const regencyRes = await fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${province.id}.json`,
    );

    const regencies = await regencyRes.json();

    allRegencies = [...allRegencies, ...regencies];
  }

  return allRegencies;
};

export const getDistrictsExternal = async (
  onProgress?: (progress: FetchProgress) => void,
): Promise<District[]> => {
  onProgress?.({ current: 0, total: 0, label: "Mengambil data provinsi..." });

  const provinceRes = await fetch(
    "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
  );
  const provinces = await provinceRes.json();

  let allRegencies: { id: string; name: string }[] = [];

  for (let i = 0; i < provinces.length; i++) {
    onProgress?.({
      current: i + 1,
      total: provinces.length,
      label: `Mengambil kabupaten dari ${provinces[i].name}...`,
    });

    const regencyRes = await fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinces[i].id}.json`,
    );
    const regencies = await regencyRes.json();
    allRegencies = [...allRegencies, ...regencies];
  }

  let allDistricts: District[] = [];

  for (let i = 0; i < allRegencies.length; i++) {
    onProgress?.({
      current: i + 1,
      total: allRegencies.length,
      label: `Mengambil kecamatan dari ${allRegencies[i].name}...`,
    });

    const districtRes = await fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${allRegencies[i].id}.json`,
    );
    const districts = await districtRes.json();
    allDistricts = [...allDistricts, ...districts];
  }

  onProgress?.(null);
  return allDistricts;
};

export const syncProvince = async (kd_user: string, data: Province[]) => {
  const res = await api.post("/wilayah/provinsi/sync", {
    kd_user,
    data,
  });

  return res.data;
};

export const getProvinceDatabase = async (): Promise<ProvinceDatabase[]> => {
  const res = await api.get("/wilayah/provinsi");

  return res.data.data;
};

export const syncRegency = async (kd_user: string, data: Regency[]) => {
  const res = await api.post("/wilayah/kabupaten-kota/sync", {
    kd_user,
    data,
  });

  return res.data;
};

export const syncDistrict = async (
  kd_user: string,
  data: District[],
): Promise<void> => {
  const BATCH_SIZE = 200;

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    await api.post("/wilayah/kecamatan/sync", {
      kd_user,
      data: batch,
    });
  }
};
