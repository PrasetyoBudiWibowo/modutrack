import { create } from "zustand";
import { getMyModules, type MyModule } from "@/service/akses/aksesService";

interface MyModuleState {
  modules: MyModule[];
  isSuperAdmin: boolean;
  loading: boolean;
  fetchMyModules: () => Promise<void>;
}

export const useMyModuleStore = create<MyModuleState>((set) => ({
  modules: [],
  isSuperAdmin: false,
  loading: true,
  fetchMyModules: async () => {
    try {
      set({ loading: true });
      const res = await getMyModules();
      set({
        modules: res.data.modules ?? [],
        isSuperAdmin: !!res.data.is_super_admin,
      });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
}));
