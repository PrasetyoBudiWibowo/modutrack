"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthCard from "../components/AuthCard";
import api from "@/service/api";
import { getLevelUser, LevelUser } from "@/service/level-user/levelUserService";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

type ErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

type RegisterInput = {
  user_name: string;
  password: string;
  level_user_id: string;
};

const initialState: RegisterInput = {
  user_name: "",
  password: "",
  level_user_id: "",
};

export default function RegisterPage() {
  const [dataInput, setDataInput] = useState<RegisterInput>(initialState);

  const [errors, setErrors] = useState<Partial<RegisterInput>>({});

  const [levels, setLevels] = useState<LevelUser[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const [loadingLevel, setLoadingLevel] = useState(true);
  const [loading, setLoading] = useState(false);

  // ==============================
  // GET LEVEL USER
  // ==============================
  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const data = await getLevelUser();
        setLevels(data);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal mengambil data level user",
        });
      } finally {
        setLoadingLevel(false);
      }
    };

    fetchLevel();
  }, []);

  // ==============================
  // HANDLE INPUT
  // ==============================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setDataInput((prev) => ({
      ...prev,
      [name]: name === "user_name" ? value.toUpperCase() : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ==============================
  // SUBMIT REGISTER
  // ==============================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<RegisterInput> = {};

    if (!dataInput.user_name) {
      newErrors.user_name = "User name tidak boleh kosong";
    }

    if (!dataInput.password) {
      newErrors.password = "Password tidak boleh kosong";
    }

    if (!dataInput.level_user_id) {
      newErrors.level_user_id = "Level user harus dipilih";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await api.post("/register", dataInput);

      if (!res.data.status) {
        Swal.fire({
          icon: "warning",
          title: "Gagal",
          text: res.data.message,
        });

        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: res.data.message,
      });

      setDataInput(initialState);
    } catch (err: unknown) {
      let message = "Terjadi kesalahan";

      if (axios.isAxiosError<ErrorResponse>(err)) {
        const errorData = err.response?.data;

        if (errorData?.errors) {
          const formattedErrors: Partial<RegisterInput> = {};

          Object.entries(errorData.errors).forEach(([key, value]) => {
            formattedErrors[key as keyof RegisterInput] = value[0];
          });

          setErrors(formattedErrors);

          return;
        }

        if (errorData?.message) {
          message = errorData.message;
        }
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // LOADING
  // ==============================
  if (loadingLevel) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================
  return (
    <AuthCard title="Register">
      <form onSubmit={handleRegister} className="space-y-5">
        {/* USERNAME */}
        <div>
          <input
            type="text"
            name="user_name"
            value={dataInput.user_name}
            onChange={handleChange}
            placeholder="Username"
            autoComplete="off"
            className={`w-full px-3 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-green-400 ${
              errors.user_name ? "border-red-500" : "border-gray-300"
            }`}
          />

          {errors.user_name && (
            <p className="text-red-500 text-xs mt-1">{errors.user_name}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={dataInput.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full px-3 py-2 pr-10 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-green-400 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* LEVEL USER */}
        <div>
          <select
            name="level_user_id"
            value={dataInput.level_user_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-green-400 ${
              errors.level_user_id ? "border-red-500" : "border-gray-300"
            }`}>
            <option value="">Pilih Level User</option>

            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.level_user}
              </option>
            ))}
          </select>

          {errors.level_user_id && (
            <p className="text-red-500 text-xs mt-1">{errors.level_user_id}</p>
          )}
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={
            loading ||
            !dataInput.user_name ||
            !dataInput.password ||
            !dataInput.level_user_id
          }
          className={`w-full py-2 rounded-lg text-white transition ${
            loading ||
            !dataInput.user_name ||
            !dataInput.password ||
            !dataInput.level_user_id
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}>
          {loading ? "Loading..." : "Register"}
        </button>
      </form>

      {/* LOGIN */}
      <p className="text-sm text-center mt-4">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>
    </AuthCard>
  );
}
