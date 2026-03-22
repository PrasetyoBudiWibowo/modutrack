import api from "@/service/api";

type ApiResponse<T> = {
    status: boolean;
    data: T;
};

export type LevelUser = {
    id: number;
    level_user: string;
};

// 🔹 GET LEVEL USER
export const getLevelUser = async (): Promise<LevelUser[]> => {
    const res = await api.get<ApiResponse<LevelUser[]>>("/level-user");
    return res.data.data;
};