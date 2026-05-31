import { create } from "zustand";
import { Module, getAllModule } from "@/service/module/moduleService";

export const initialModuleInput = {
  nama_module: "",
  icon_module: "",
  url_module: "",
  urutan: 0,
};

interface ModuleState {
  modules: Module[];
  loadingModule: boolean;
  fetchModules: () => Promise<void>;
}

export const useModuleStore = create<ModuleState>((set) => ({
  modules: [],
  loadingModule: false,
  fetchModules: async () => {
    try {
      set({ loadingModule: true });
      const res = await getAllModule();
      set({ modules: res.data ?? [] });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loadingModule: false });
    }
  },
}));
