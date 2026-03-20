"use client";

export default function AuthCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
                {children}
            </div>
        </div>
    );
}