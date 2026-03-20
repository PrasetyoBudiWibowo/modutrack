"use client";

import { useState } from "react";
import api from "@/service/api";
import Link from "next/link";
import axios from "axios";
import AuthCard from "../components/AuthCard";

type LoginResponse = {
    token?: string;
    message?: string;
    error?: string;
};

export default function LoginPage() {
    const [user_name, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<LoginResponse | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await api.post("/login", {
                user_name,
                password,
            });

            setResult(res.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setResult({
                    error: err.response?.data?.message || "Login gagal",
                });
            } else {
                setResult({
                    error: "Terjadi kesalahan tidak diketahui",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard title="Login">
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="text"
                    placeholder="Username"
                    value={user_name}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full border px-3 py-2 rounded-lg"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border px-3 py-2 rounded-lg"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg">
                    {loading ? "Loading..." : "Login"}
                </button>
            </form>

            {/* 🔗 LINK KE REGISTER */}
            <p className="text-sm text-center mt-4">
                Belum punya akun?{" "}
                <Link href="/register" className="text-blue-500 hover:underline">
                    Register
                </Link>
            </p>

            {result && (
                <pre className="mt-4 bg-gray-100 p-2 rounded text-xs">
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </AuthCard>
    );
}
