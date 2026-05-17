import { useState, useEffect } from "react";
import {
  Village,
  getVillagesExternal,
  FetchProgress,
} from "@/service/wilayah/wilayahService";

export const useVillage = () => {
  const [village, setVillage] = useState<Village[]>([]);
  const [filteredData, setFilteredData] = useState<Village[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchProgress, setFetchProgress] = useState<FetchProgress>(null);

  const getVillage = async () => {
    try {
      setLoading(true);

      const data = await getVillagesExternal((progress) => {
        setFetchProgress(progress);
      });

      setVillage(data);
      setFilteredData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setFetchProgress(null);
    }
  };

  useEffect(() => {
    getVillage();
  }, []);

  useEffect(() => {
    const result = village.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );

    setFilteredData(result);
  }, [search, village]);

  return {
    village,
    filteredData,
    search,
    setSearch,
    loading,
    fetchProgress,
    getVillage,
  };
};
