"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function LandingPage() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function handleLogout() {
    try {
      const response = await axios.post("/api/auth/logout");
      if (response.data.success) {
        window.location.reload();
      } else {
        toast.error("Logout Failed. Please try again");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }

  async function fetchUserData(): Promise<void> {
    try {
      const response = await axios.get("/api/auth/user");
      if (response.data.user) setAuthenticated(true);
    } catch (error) {
      console.log(error);
      // No toast here: it's normal for unauthenticated users to land here
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-6xl mx-auto w-full">
        <div className="text-2xl font-bold text-blue-700 tracking-tight">
          FileCloud
        </div>
        <nav className="flex items-center gap-6">
          {!authenticated ? (
            <>
              <Link
                href="/login"
                className="text-blue-700 font-medium hover:underline"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
              >
                Get Started
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium cursor-pointer"
            >
              Logout
            </button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
          Effortless Cloud File Management
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl">
          Securely upload, organize, and access your files from anywhere. Enjoy
          blazing-fast navigation with our trie-powered folder system, robust versioning, and seamless authentication.
        </p>
        {!authenticated ? (
          <Link
            href="/register"
            className="inline-block bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-blue-800 transition"
          >
            Create Your Free Account
          </Link>
        ) : 
        <Link
            href="/home"
            className="inline-block bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-blue-800 transition"
          >
            Open FileCloud
          </Link>
        }
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <svg
            className="w-10 h-10 text-blue-600 mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
            <path d="M16 3v4H8V3" />
            <path d="M12 12v4" />
          </svg>
          <h3 className="font-bold text-lg mb-2">Instant File Uploads</h3>
          <p className="text-slate-500">
            Upload and manage your files in the cloud with a simple, intuitive interface.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <svg
            className="w-10 h-10 text-green-600 mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M4 17v-7a4 4 0 014-4h8a4 4 0 014 4v7" />
            <path d="M12 12v4" />
          </svg>
          <h3 className="font-bold text-lg mb-2">Secure Authentication</h3>
          <p className="text-slate-500">
            Your data is protected with industry-standard authentication and JWT security.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <svg
            className="w-10 h-10 text-purple-600 mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <h3 className="font-bold text-lg mb-2">Lightning-Fast Navigation</h3>
          <p className="text-slate-500">
            Navigate large folder structures instantly, powered by advanced trie data structures.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <svg
            className="w-10 h-10 text-yellow-500 mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" />
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          <h3 className="font-bold text-lg mb-2">Versioning & Snapshots</h3>
          <p className="text-slate-500">
            Save snapshots of your file structure, restore previous versions, and track changes—just like GitHub!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-sm py-6 mt-auto">
        &copy; {new Date().getFullYear()} FileCloud. Built with Next.js,
        TypeScript, and Tailwind CSS.
        <br />
        Developed by
        <a
          href="https://www.linkedin.com/in/talibkhan5"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-semibold hover:underline ml-1"
        >
          Talib Khan
        </a>
        &mdash; Web Developer | TypeScript Debugging | Auth Specialist
      </footer>
    </main>
  );
}
