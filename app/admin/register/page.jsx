"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Registrasi berhasil! Silakan login.");
      router.push("/admin/login");
    } else {
      setError(data.error || "Registrasi gagal.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Register Admin</h1>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded"
          >
            Register
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Sudah punya akun?{" "}
          <a href="/admin/login" className="text-green-700 font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
