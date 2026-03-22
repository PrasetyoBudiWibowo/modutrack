"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthCard from "../components/AuthCard";
import api from "@/service/api";
import { validateInputs } from "@/utils/validation";
import { getLevelUser, LevelUser } from "@/utils/apiService";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

type LaravelErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

type RegisterInput = {
    user_name: string;
    password: string;
    level_user_id: string;
};

const dataValue: RegisterInput = {
    user_name: "",
    password: "",
    level_user_id: "",
};

export default function RegisterPage() {
    const [dataInput, setDataInput] = useState<RegisterInput>(dataValue);
    const [levels, setLevels] = useState<LevelUser[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchLevel = async () => {
            try {
                const data = await getLevelUser();
                setLevels(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchLevel();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setDataInput((prev) => ({
            ...prev,
            [name]: name === "user_name" ? value.toUpperCase() : value,
        }));
    };

    const handleRegister = async () => {
        const requireValue = [
            { value: dataInput.user_name, message: "User name tidak boleh kosong" },
            { value: dataInput.password, message: "Password tidak boleh kosong" },
            { value: dataInput.level_user_id, message: "Level user harus dipilih" },
        ];

        if (!validateInputs(requireValue)) return;

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

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: res.data.message,
            });

            setDataInput(dataValue);

        } catch (err: unknown) {
            let message = "Terjadi kesalahan";

            if (axios.isAxiosError<LaravelErrorResponse>(err)) {
                const errorData = err.response?.data;

                if (errorData?.errors) {
                    const errors = Object.values(errorData.errors)
                        .flat()
                        .join("<br>");

                    Swal.fire({
                        icon: "warning",
                        title: "Validasi gagal",
                        html: errors,
                    });

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
        }
    };

    return (
        <AuthCard title="Register">
            <div className="space-y-4">
                <input
                    type="text"
                    name="user_name"
                    value={dataInput.user_name}
                    onChange={handleChange}
                    placeholder="Username"
                    className="w-full border px-3 py-2 rounded-lg"
                />

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={dataInput.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full border px-3 py-2 rounded-lg pr-10"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                </div>

                <select
                    name="level_user_id"
                    value={dataInput.level_user_id}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-lg"
                >
                    <option value="">Pilih Level</option>
                    {levels.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                            {lvl.level_user}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleRegister}
                    className="w-full bg-green-500 text-white py-2 rounded-lg"
                >
                    Register
                </button>
            </div>

            <p className="text-sm text-center mt-4">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-blue-500 hover:underline">
                    Login
                </Link>
            </p>
        </AuthCard>
    );
}