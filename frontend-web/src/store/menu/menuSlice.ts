import { create } from "zustand";
import { Menu, getAllMenu } from "@/service/menu/menuService";

export const initialMenuInput = {
  kd_module: "",
  parent_menu: "",
  nama_menu: "",
  icon_menu: "",
  url_menu: "",
  urutan: 0,
  is_parent: false,
};

interface MenuState {
  menus: Menu[];
  loadingMenu: boolean;
  fetchMenus: () => Promise<void>;
}

export const useMenuStore = create<MenuState>((set) => ({
  menus: [],
  loadingMenu: false,
  fetchMenus: async () => {
    try {
      set({ loadingMenu: true });
      const res = await getAllMenu();
      set({ menus: res.data ?? [] });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loadingMenu: false });
    }
  },
}));
