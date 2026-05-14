import api from "@/service/api";

export type User = {
  kd_user: string;
  user_name: string;
  level_user_id: number;
  status_user: string;
  blokir: string;
  img_user?: string | null;
  format_img_user?: string | null;
  level?: {
    id: number;
    level_user: string;
  };
};

type UserResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

export const getAllUser = async (): Promise<User[]> => {
  const res = await api.get<UserResponse<User[]>>("/users/all-user");

  return res.data.data;
};