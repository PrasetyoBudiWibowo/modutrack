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
