import api from "@/service/api";
import axios from "axios";

export type SessionUser = {
  user_name: string;
  level_user_id: number;
  level_user: string | null;
  img_user: string | null;
  format_img_user: string | null;
};

export type CheckSessionResponse = {
  status: "authenticated" | "unauthenticated";
  user?: SessionUser;
};

export const checkSession = async (): Promise<CheckSessionResponse> => {
  try {
    const res = await api.get<CheckSessionResponse>("/check-session");
    return res.data;
  } catch {
    return { status: "unauthenticated" };
  }
};

export const logout = async () => {
  return await api.post("/logout");
};
