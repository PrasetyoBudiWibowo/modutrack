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
  fetchModuleMenus: (slug: string) => Promise<void>;
}

export const useModuleMenuStore = create<ModuleMenuState>((set) => ({
  slug: null,
  moduleInfo: null,
  menus: [],
  loading: true,
  notFound: false,
  fetchModuleMenus: async (slug) => {
    try {
      set({ slug, loading: true, notFound: false });
      const res = await getModuleMenus(slug);
      set({ moduleInfo: res.data.module, menus: res.data.menus ?? [] });
    } catch (error) {
      const isNotFound =
        axios.isAxiosError(error) && error.response?.status === 404;
      set({ moduleInfo: null, menus: [], notFound: isNotFound });
      if (!isNotFound) console.error(error);
    } finally {
      set({ loading: false });
    }
  },
}));
