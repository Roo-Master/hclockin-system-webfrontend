"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication and role
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/auth/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

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
          router.push("/auth/login");
      }
    } catch (error) {
      console.error(error);
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </main>
  );
}