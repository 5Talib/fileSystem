"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import ModalSpinner from "@/components/ModalSpinner";
import loadingAnimation from "@/animations/loadingAnimation.json";

export default function RegisterPage() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // useEffect hook to enable/disable the register button based on form validity
  useEffect(() => {
    // Disable button if any field is empty or passwords don't match
    if (!username || !email || !password || !confirm || password !== confirm) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [username, email, password, confirm]);

  /**
   * Handles form submission for user registration.
   * - Prevents default form submission.
   * - Validates passwords match.
   * - Sets loading state.
   * - Sends registration request to backend.
   * - Handles both success and error responses with user feedback.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side validation for password match
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true); // Show loading spinner or disable button

    try {
      // Send POST request to registration API endpoint
      const response = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });

      // If registration is successful, show success toast and redirect
      if (response.data.success) {
        toast.success(response.data.message);
        router.push("/");
      } else {
        // If backend responds with success: false
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      // Handle errors returned from backend
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error); // showing backend error
      } else {
        // Handle unexpected errors (network issues, etc.)
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false); // Reset loading state
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
          href="/login"
          className="text-blue-700 font-medium hover:underline"
        >
          Login
        </Link>
        <Link
          href="/"
          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          Home
        </Link>
      </nav>
    </header>

    {/* Register Card */}
    <section className="flex-1 flex flex-col items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-xl w-full max-w-md space-y-7 border border-blue-100"
      >
        <div className="flex flex-col items-center mb-2">
          <div className="text-3xl font-extrabold text-blue-700 mb-2 tracking-tight">
            Create Your Account
          </div>
          <div className="text-slate-500 text-base mb-4">
            Join FileCloud and start managing your files in the cloud!
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-700" htmlFor="username">
            Username
          </label>
          <input
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 bg-blue-50"
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-700" htmlFor="email">
            Email
          </label>
          <input
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 bg-blue-50"
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-700" htmlFor="password">
            Password
          </label>
          <input
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 bg-blue-50"
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-700" htmlFor="confirm">
            Confirm Password
          </label>
          <input
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 bg-blue-50"
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {confirm && password !== confirm && (
            <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold shadow transition
          ${
            buttonDisabled || loading
              ? "bg-blue-400 text-white opacity-60 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
          }`}
          disabled={buttonDisabled || loading}
        >
          {loading && (
            <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Login Link */}
        <div className="text-sm text-center mt-3">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-700 font-semibold hover:underline">
            Login
          </Link>
        </div>
      </form>
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
