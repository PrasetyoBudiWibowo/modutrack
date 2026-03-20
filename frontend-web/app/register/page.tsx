"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "../components/AuthCard";

export default function RegisterPage() {
    const [user_name, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ user_name, password });
    };

    return (
        <AuthCard title="Register">
            <form onSubmit={handleRegister} className="space-y-4">
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

                <button className="w-full bg-green-500 text-white py-2 rounded-lg">
                    Register
                </button>
            </form>

            {/* 🔗 LINK KE LOGIN */}
            <p className="text-sm text-center mt-4">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-blue-500 hover:underline">
                    Login
                </Link>
            </p>
        </AuthCard>
    );
}