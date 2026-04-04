import api from "./api";

export const login = async (username, password) => {
  const res = await api.post("/login", {
    user_name: username,
    password: password,
  });

  return res.data;
};