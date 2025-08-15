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
            className="block text-gray-800 hover:text-green-700 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
            Kelola Menu
          </Link>

          <Link
            href="/admin/orders"
            onClick={() => setOpen(false)}
            className="block text-gray-800 hover:text-green-700 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
            Kelola Pesanan
          </Link>
          <Link
            href="/admin/reports"
            onClick={() => setOpen(false)}
            className="block text-gray-800 hover:text-green-700 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Laporan Keuangan
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
