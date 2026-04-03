"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "../components/AuthCard";
import api from "@/service/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useRouter } from "next/navigation";

type DataInput = {
    user_name: string;
    password: string;
};

const initialState: DataInput = {
    user_name: "",
    password: "",
};

type ErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

export default function LoginPage() {
    const [dataInput, setDataInput] = useState<DataInput>(initialState);
    const [errors, setErrors] = useState<Partial<DataInput>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
    
      setDataInput(prev => ({
        ...prev,
        [name]: name === "user_name" ? value.trim().toUpperCase() : value
      }))
    
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Partial<DataInput> = {};

        if (!dataInput.user_name) {
            newErrors.user_name = "User name tidak boleh kosong";
        }

        if (!dataInput.password) {
            newErrors.password = "Password tidak boleh kosong";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const res = await api.post("/login", dataInput);

            if (!res.data.status) {
                Swal.fire({
                    icon: "warning",
                    title: "Gagal",
                    text: res.data.message,
                });
                return;
            }

            if (res.data.status === "fail") {
                Swal.fire({
                    icon: "warning",
                    title: "Gagal",
                    text: res.data.message,
                });
                return;
            }

            if (res.data.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: res.data.message,
                }).then(() => {
                    router.push("/dashboard");
                });
            }

            setDataInput(initialState);
        } catch (err: unknown) {
            let message = "Terjadi kesalahan";

            if (axios.isAxiosError<ErrorResponse>(err)) {
                const errorData = err.response?.data;

                if (errorData?.errors) {
                    const formattedErrors: Partial<DataInput> = {};

                    Object.entries(errorData.errors).forEach(([key, value]) => {
                        formattedErrors[key as keyof DataInput] = value[0];
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

    return (
        <AuthCard title="Login">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <input
                        type="text"
                        name="user_name"
                        placeholder="Username"
                        autoComplete="off"
                        value={dataInput.user_name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.user_name
                            ? "border-red-500"
                            : "border-gray-300"
                            }`}
                    />
                    {errors.user_name && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.user_name}
                        </p>
                    )}
                </div>

                <div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={dataInput.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 pr-10 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.password
                                ? "border-red-500"
                                : "border-gray-300"
                                }`}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* BUTTON */}
                <button
                    type="submit"
                    disabled={
                        loading ||
                        !dataInput.user_name ||
                        !dataInput.password
                    }
                    className={`w-full py-2 rounded-lg text-white transition ${loading ||
                        !dataInput.user_name ||
                        !dataInput.password
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                        }`}
                >
                    {loading ? "Loading..." : "Login"}
                </button>
            </form>

            {/* REGISTER */}
            <p className="text-sm text-center mt-4">
                Belum punya akun?{" "}
                <Link href="/register" className="text-blue-500 hover:underline">
                    Register
                </Link>
            </p>
        </AuthCard>
    );
}
