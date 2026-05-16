import { useState, useEffect } from "react";
import {
  District,
  FetchProgress,
  getDistrictsExternal,
} from "@/service/wilayah/wilayahService";

export const useDistrict = () => {
  const [district, setDistrict] = useState<District[]>([]);
  const [filteredData, setFilteredData] = useState<District[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchProgress, setFetchProgress] = useState<FetchProgress>(null);

  const getDistrict = async () => {
    try {
      setLoading(true);

      const data = await getDistrictsExternal((progress) => {
        setFetchProgress(progress);
      });

      setDistrict(data);
      setFilteredData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setFetchProgress(null);
    }
  };

  useEffect(() => {
    getDistrict();
  }, []);

  useEffect(() => {
    const result = district.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredData(result);
  }, [search, district]);

  return {
    district,
    filteredData,
    search,
    setSearch,
    loading,
    fetchProgress,
    getDistrict,
  };
};
