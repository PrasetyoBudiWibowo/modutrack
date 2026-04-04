import api from "@/service/api";
import axios from "axios";


// ==============================
// GET LEVEL USER
// ==============================
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

// ==============================
// CHECK SESSION
// ==============================

export type SessionUser = {
    kd_user: string;
    user_name: string;
    level_user_id: number;
    level_user: string;
    img_user?: string;
    format_img_user?: string;
    status_user: string;
    blokir: string;
};

export type CheckSessionResponse = {
    status: "authenticated" | "unauthenticated";
    user?: SessionUser;
};

export const checkSession = async (): Promise<CheckSessionResponse> => {
    try {
        const res = await api.get<CheckSessionResponse>("/check-session");
        return res.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return { status: "unauthenticated" };
            }
        }
        return { status: "unauthenticated" };
    }
};