import { useEffect, useState } from "react";
import {
  Province,
  getProvinceExternal,
} from "@/service/wilayah/wilayahService";

export const useProvinsi = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [filteredData, setFilteredData] = useState<Province[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const getProvinces = async () => {
    try {
      setLoading(true);

      const data = await getProvinceExternal();

      setProvinces(data);
      setFilteredData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProvinces();
  }, []);

  useEffect(() => {
    const result = provinces.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );

    setFilteredData(result);
  }, [search, provinces]);

  return {
    provinces,
    filteredData,
    search,
    setSearch,
    loading,
    getProvinces,
  };
};