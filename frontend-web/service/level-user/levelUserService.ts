import api from "@/service/api";

type LevelUserResponse<T> = {
  status: boolean;
  data: T;
};

export type LevelUser = {
  id: number;
  level_user: string;
};

export const getLevelUser = async (): Promise<LevelUser[]> => {
  const res = await api.get<LevelUserResponse<LevelUser[]>>("/level-user");

  return res.data.data;
};