"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */
type UserRole = "super_admin" | "hospital_admin" | "hr" | "hod" | "staff";

interface FakeUser {
  email: string;
  password: string;
  role: UserRole;
}

const LoginPage: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  /* ================= FAKE USERS ================= */
  const fakeUsers: FakeUser[] = [
    {
      email: "superadmin@medclock.com",
      password: "123456",
      role: "super_admin",
    },
    {
      email: "admin@medclock.com",
      password: "123456",
      role: "hospital_admin",
    },
    {
      email: "hr@medclock.com",
      password: "123456",
      role: "hr",
    },
    {
      email: "hod@medclock.com",
      password: "123456",
      role: "hod",
    },
    {
      email: "staff@medclock.com",
      password: "123456",
      role: "staff",
    },
  ];

  /* ================= LOGIN ================= */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      /* fake delay */
      await new Promise((resolve) => setTimeout(resolve, 1000));

      /* ================= CHECK USER ================= */
      const user = fakeUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        alert("Invalid email or password");
        return;
      }

      /* ================= SAVE USER ================= */
      localStorage.setItem("user", JSON.stringify(user));

      /* ================= ROLE REDIRECT ================= */
      switch (user.role) {
        case "super_admin":
          router.push("/super-admin/dashboard");
          break;

        case "hospital_admin":
          router.push("/hospital-admin/dashboard");
          break;

        case "hr":
          router.push("/hr-dashboard/dashboard");
          break;

        case "hod":
          router.push("/hod/dashboard");
          break;

        case "staff":
          router.push("/dashboard");
          break;

        default:
          router.push("/");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      <div className="flex flex-col md:flex-row w-full min-h-screen relative">
        {/* ================= LEFT SIDE ================= */}
        <div
          className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-700 to-indigo-900 p-8 lg:p-12 xl:p-16 flex-col justify-between text-white relative"
          style={{
            clipPath: "polygon(0% 0%, 90% 0%, 100% 100%, 0% 100%)",
          }}
        >
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              {/* ================= LOGO ================= */}
              <div className="flex items-center gap-2 mb-8 lg:mb-12">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-5 h-5 lg:w-6 lg:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                    />
                  </svg>
                </div>

                <span className="text-lg lg:text-xl font-bold tracking-tight">
                  MedClock System
                </span>
              </div>

              {/* ================= HEADING ================= */}
              <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
                Hospital Staff
                <br />
                <span className="text-blue-300">Clock-In System</span>
              </h1>

              {/* ================= DESCRIPTION ================= */}
              <p className="text-blue-100 text-sm lg:text-base xl:text-lg mb-6 lg:mb-8 leading-relaxed max-w-lg">
                Efficiently manage hospital staff attendance, shift tracking,
                and workforce monitoring with our secure healthcare clock-in
                platform.
              </p>

              {/* ================= FEATURES ================= */}
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-500/30 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 lg:w-4 lg:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm lg:text-base">
                    Real-time attendance monitoring
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-500/30 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 lg:w-4 lg:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm lg:text-base">
                    Shift scheduling &amp; workforce tracking
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-500/30 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 lg:w-4 lg:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm lg:text-base">
                    Secure hospital staff access
                  </span>
                </div>
              </div>
            </div>

            {/* ================= FOOTER ================= */}
            <div className="mt-8 lg:mt-12 text-xs lg:text-sm text-blue-200 border-t border-blue-600/50 pt-4 lg:pt-6">
              <p>©2026 MedClock System. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 lg:p-8 xl:p-12 bg-white relative min-h-screen md:min-h-0 flex items-center">
          <div className="w-full max-w-md mx-auto relative z-10 py-4 sm:py-0">
            {/* ================= MOBILE HEADER ================= */}
            <div className="md:hidden text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center gap-2 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                    />
                  </svg>
                </div>

                <span className="text-xl sm:text-2xl font-bold text-gray-800">
                  MedClock System
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>

              <p className="text-gray-500 text-sm sm:text-base">
                Sign in to continue
              </p>
            </div>

            {/* ================= DESKTOP HEADER ================= */}
            <div className="hidden md:block text-center mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>

              <p className="text-gray-500 text-sm lg:text-base">
                Access your attendance dashboard
              </p>
            </div>

            {/* ================= TEST USERS ================= */}
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-700 mb-2">
                Test Accounts
              </h3>

              <div className="space-y-2 text-xs text-gray-700">
                <p>Super Admin: superadmin@medclock.com</p>
                <p>Hospital Admin: admin@medclock.com</p>
                <p>HR: hr@medclock.com</p>
                <p>HOD: hod@medclock.com</p>
                <p className="font-semibold">Password: 123456</p>
              </div>
            </div>

            {/* ================= FORM ================= */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5 lg:space-y-6"
            >
              {/* ================= EMAIL ================= */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                >
                  Email Address
                </label>

                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white"
                  placeholder="doctor@hospital.com"
                  required
                />
              </div>

              {/* ================= PASSWORD ================= */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                >
                  Password
                </label>

                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white"
                  placeholder="**********"
                  required
                />
              </div>

              {/* ================= REMEMBER ================= */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />

                  <span className="text-xs sm:text-sm text-gray-600">
                    Remember me
                  </span>
                </label>

                <Link
                  href="/resetPass/forgot-password"
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* ================= BUTTON ================= */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 sm:py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-70"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              {/* ================= FOOTER ================= */}
              <div className="pt-4 sm:pt-6">
                <p className="text-center text-xs sm:text-sm text-gray-600">
                  Need access?{" "}
                  <Link
                    href="/contact-support-team"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Contact support team
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;