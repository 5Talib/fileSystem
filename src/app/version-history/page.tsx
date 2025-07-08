"use client";
import Link from "next/link";
import { ClockIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import axios from "axios";
import ModalSpinner from "@/components/ModalSpinner";
import loadingAnimation from "@/animations/loadingAnimation.json";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type version = {
  fileSystem: object;
  message: string;
  timestamp: string;
  _id: string;
};

export default function VersionHistory() {
    const router = useRouter();
  const [versions, setVersions] = useState<Array<version>>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchVersion();
  }, []);
  async function fetchVersion() {
    try {
      setLoading(true);
      const response = await axios.get("/api/file/getVersions");
      if (response.data.success) {
        setVersions(response.data.versions);
      } else {
        toast.error("Version fetching failed. Please try again.");
      }
    } catch (error) {
      // Handle errors returned from backend
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        // Handle unexpected errors (network issues, etc.)
        toast.error("Version fetching failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }
  async function handleExtract(version: version) {
    try {
      setLoading(true);
      const response = await axios.post("/api/file/retrieveVersion", {
        versionId: version._id,
      });
      if (response.data.success) {
        router.push("/home");
      } else {
        toast.error("Version extracting failed. Please try again.");
      }
    } catch (error) {
      // Handle errors returned from backend
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        // Handle unexpected errors (network issues, etc.)
        toast.error("Version extracting failed. Please try again.");
      }
    } finally {
      setLoading(false);
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
          <Link
            href="/home"
            className="text-blue-700 font-medium hover:underline"
          >
            Files
          </Link>
          <Link
            href="/"
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Home
          </Link>
        </nav>
      </header>

      {/* Page Title */}
      <section className="flex flex-col items-center justify-center py-8 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
          <ClockIcon className="w-8 h-8 text-blue-500" />
          Version History
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl text-center">
          Browse and extract previous versions of your file system. Each
          snapshot is safely stored with your custom message and timestamp.
        </p>
      </section>

      {/* Version List */}
      <section className="w-full max-w-4xl mx-auto flex-1 px-2 sm:px-4">
        <div className="flex flex-col gap-6">
          {versions?.length === 0 ? (
            <div className="text-center text-slate-500 py-8 bg-white rounded-xl shadow">
              No versions found.
            </div>
          ) : (
            versions?.map((version, idx) => (
              <div
                key={version.timestamp}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl shadow p-5 border border-gray-100 group hover:border-blue-400 transition"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base md:text-lg text-blue-700 font-semibold">
                      {new Date(version.timestamp).toLocaleString()}
                    </span>
                    <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-600 text-xs font-medium">
                      v{versions.length - idx}
                    </span>
                  </div>
                  <div className="text-slate-500 text-sm truncate max-w-xs md:max-w-md">
                    {version.message ? (
                      version.message
                    ) : (
                      <span className="italic text-gray-400">No message</span>
                    )}
                  </div>
                </div>
                <button
                  className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow transition w-full sm:w-auto justify-center cursor-pointer"
                  onClick={() => handleExtract(version)}
                  aria-label="Extract this version"
                  type="button"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Extract
                </button>
              </div>
            ))
          )}
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

      {loading && (
        <ModalSpinner text={"Loading..."} animation={loadingAnimation} />
      )}
    </main>
  );
}
