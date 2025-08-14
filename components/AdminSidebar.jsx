"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <div className="w-full flex justify-between items-center px-4 py-3 shadow-md  sticky top-0 bg-white z-50">
        {/* Hamburger kiri */}
        <button onClick={() => setOpen(true)} className="p-1">
          <FiMenu size={24} />
        </button>

        {/* Judul Tengah */}
        <h1 className="text-xl font-bold tracking-wide">NYOPISKUY</h1>

        {/* Logo kanan */}
        <Image
          src="/logo.png" // pastikan ini ada di public/logo.png
          alt="Logo"
          width={32}
          height={32}
        />
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-40 "
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 ">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <button onClick={() => setOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-4">
          <Link
            href="/admin/menu"
            onClick={() => setOpen(false)}
            className="block text-gray-800 hover:text-green-700"
          >
            📋 Kelola Menu
          </Link>

          <Link
            href="/admin/orders"
            onClick={() => setOpen(false)}
            className="block text-gray-800 hover:text-green-700"
          >
            📦 Kelola Pesanan
          </Link>
          <Link
            href="/admin/reports"
            onClick={() => setOpen(false)}
            className="block text-gray-800 hover:text-green-700"
          >
            💰 Laporan Keuangan
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", {
                method: "POST"
              });

              // Redirect ke login page setelah logout
              window.location.href = "/admin/login";
            }}
            className="text-red-600 hover:underline mt-4"
          >
            Logout
          </button>
        </nav>
      </div>
    </>
  );
}
