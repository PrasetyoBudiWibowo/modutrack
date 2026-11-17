import axios from "axios";

export const getErrorMessage = (
  error: unknown,
  fallback = "Terjadi kesalahan pada server",
): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data;
  if (data?.message) return data.message;

  if (data?.errors) {
    const first = Object.values(data.errors as Record<string, string[]>)[0];
    if (first?.[0]) return first[0];
  }

  return fallback;
};
