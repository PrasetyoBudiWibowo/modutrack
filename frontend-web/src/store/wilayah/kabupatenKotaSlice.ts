import { useEffect, useState } from "react";
import {
  Regency,
  getRegenciesExternal,
} from "@/service/wilayah/wilayahService";

export const useRegency = () => {
  const [regency, setRegency] = useState<Regency[]>([]);
  const [filteredData, setFilteredData] = useState<Regency[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const getRegency = async () => {
    try {
      setLoading(true);

      const data = await getRegenciesExternal();

      setRegency(data);
      setFilteredData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRegency();
  }, []);

  useEffect(() => {
    const result = regency.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );

    setFilteredData(result);
  }, [search, regency]);

  return {
    regency,
    filteredData,
    search,
    setSearch,
    loading,
    getRegency,
  };
};
