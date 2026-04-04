"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import api from "@/service/api";
import { checkSession, SessionUser } from "@/utils/apiService";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<SessionUser | null>(null);
    const [checking, setChecking] = useState(true);


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await checkSession();

                if (res.status !== "authenticated") {
                    await Swal.fire({
                        icon: "warning",
                        title: "Akses Ditolak",
                        text: "Silakan login terlebih dahulu",
                        confirmButtonText: "OK",
                    });

                    router.push("/login");
                    return;
                }

                setUser(res.user ?? null);
            } catch (err) {
                await Swal.fire({
                    icon: "warning",
                    title: "Belum Login",
                    text: "Silakan login terlebih dahulu",
                    confirmButtonText: "OK",
                });

                router.push("/login");
                return;
            }

            setChecking(false);
        };

        checkAuth();
    }, []);

    const handleLogout = () => {
        Swal.fire({
            title: "Yakin logout?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, Logout",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await api.post("/logout");
                router.push("/login");
            }
        });
    };

    if (checking) return null;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            <div className="bg-blue-500 text-white px-6 py-4 flex justify-between items-center">
                <h1 className="text-lg font-semibold">Dashboard</h1>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <div className="flex-1 p-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">
                        Selamat Datang 👋
                    </h2>

                    <p className="text-gray-600">
                        Ini adalah halaman dashboard sederhana.
                    </p>

                    {user && (
                        <div className="mt-4 text-sm text-gray-700">
                            <p><b>User:</b> {user.user_name}</p>
                            <p><b>Level:</b> {user.level_user}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}