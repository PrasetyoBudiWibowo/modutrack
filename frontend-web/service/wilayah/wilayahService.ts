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


export const getProvinceExternal = async (): Promise<
  Province[]
> => {
  const res = await fetch(
    "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
  );

  return await res.json();
};


export const syncProvince = async (
  kd_user: string,
  data: Province[],
) => {
  const res = await api.post(
    "/wilayah/provinsi/sync",
    {
      kd_user,
      data,
    },
  );

  return res.data;
};


export const getProvinceDatabase = async (): Promise<
  ProvinceDatabase[]
> => {
  const res = await api.get(
    "/wilayah/provinsi",
  );

  return res.data.data;
};