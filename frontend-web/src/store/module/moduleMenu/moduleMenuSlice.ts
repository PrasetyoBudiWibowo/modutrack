import { create } from "zustand";
import axios from "axios";
import {
  getModuleMenus,
  type ModuleInfo,
  type ModuleMenuItem,
} from "@/service/module/moduleService";

interface ModuleMenuState {
  slug: string | null;
  moduleInfo: ModuleInfo | null;
  menus: ModuleMenuItem[];
  loading: boolean;
  notFound: boolean;
  forbidden: boolean;
  fetchModuleMenus: (slug: string) => Promise<void>;
}

export const useModuleMenuStore = create<ModuleMenuState>((set) => ({
  slug: null,
  moduleInfo: null,
  menus: [],
  loading: true,
  notFound: false,
  forbidden: false,
  fetchModuleMenus: async (slug) => {
    try {
      set({ slug, loading: true, notFound: false, forbidden: false });
      const res = await getModuleMenus(slug);
      set({ moduleInfo: res.data.module, menus: res.data.menus ?? [] });
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      set({
        moduleInfo: null,
        menus: [],
        notFound: status === 404,
        forbidden: status === 403,
      });
      if (status !== 404 && status !== 403) console.error(error);
    } finally {
      set({ loading: false });
    }
  },
}));
