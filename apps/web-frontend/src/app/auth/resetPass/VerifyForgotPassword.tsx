"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const VerifyForgotPassword: React.FC = () => {
  const [otp, setOtp] = useState<string>("");

  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Allow any 6-digit OTP
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    console.log("OTP Submitted:", otp);

    // Redirect to Reset Password Page
    router.push("/auth/resetPass/reset-password");
  };

  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      <div className="flex flex-col md:flex-row w-full min-h-screen relative">
        {/* Left Side */}
        <div
          className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-700 to-indigo-900 p-8 lg:p-12 xl:p-16 flex-col justify-between text-white relative"
          style={{
            clipPath: "polygon(0% 0%, 90% 0%, 100% 100%, 0% 100%)",
          }}
        >
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              {/* Logo */}
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
                      d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm0 0v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <span className="text-lg lg:text-xl font-bold tracking-tight">
                  MedClock System
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
                Verify
                <br />
                <span className="text-blue-300">Recovery Code</span>
              </h1>

              {/* Description */}
              <p className="text-blue-100 text-sm lg:text-base xl:text-lg mb-6 lg:mb-8 leading-relaxed max-w-lg">
                Enter the verification code sent to your hospital email
                address to continue resetting your password securely.
              </p>

              {/* Features */}
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
                    Secure OTP verification
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
                    Fast recovery process
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
                    Protected hospital staff access
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 lg:mt-12 text-xs lg:text-sm text-blue-200 border-t border-blue-600/50 pt-4 lg:pt-6">
              <p>© 2026 MedClock System. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 lg:p-8 xl:p-12 bg-white min-h-screen md:min-h-0 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto py-4 sm:py-0">
            {/* Mobile Header */}
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
                      d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm0 0v2"
                    />
                  </svg>
                </div>

                <span className="text-xl sm:text-2xl font-bold text-gray-800">
                  MedClock System
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Verify Code
              </h2>

              <p className="text-gray-500 text-sm sm:text-base">
                Enter the OTP sent to your email
              </p>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block text-center mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                Verify Recovery Code
              </h2>

              <p className="text-gray-500 text-sm lg:text-base">
                Securely verify your identity
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5 lg:space-y-6"
            >
              {/* OTP */}
              <div>
                <label
                  htmlFor="otp"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                >
                  Verification Code
                </label>

                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setOtp(e.target.value)
                  }
                  className="block w-full px-4 py-3 sm:py-3.5 text-center tracking-[0.5em] text-lg sm:text-xl border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 sm:py-3.5 px-4 rounded-xl transition-all duration-200"
              >
                Verify Code
              </button>

              {/* Footer */}
              <div className="pt-4 sm:pt-6 space-y-3">
                <p className="text-center text-xs sm:text-sm text-gray-600">
                  Didn&rsquo;t receive the code?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Resend OTP
                  </button>
                </p>

                <p className="text-center text-xs sm:text-sm text-gray-600">
                  <Link
                    href="/auth/resetPass/forgot-password"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Back to Forgot Password
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

export default VerifyForgotPassword;