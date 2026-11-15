import { getMyModules, type MyModule } from "@/service/akses/aksesService";

export const resolvePostLoginPath = async (
  levelUserId: number,
): Promise<string> => {
  if (levelUserId === 1) return "/dashboard";

  try {
    const res = await getMyModules();
    const modules: MyModule[] = res.data.modules ?? [];

    if (modules.length === 1 && modules[0].url_module) {
      return modules[0].url_module;
    }
  } catch (error) {
    console.error(error);
  }

  return "/dashboard";
};
