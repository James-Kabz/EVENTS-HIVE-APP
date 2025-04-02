// Performance configurations
// export const runtime = 'edge'
// export const preferredRegion = 'auto'

import { Suspense, lazy } from 'react';
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

// Lazy load the login form
const LoginForm = lazy(() => import("@/components/auth/login-form").then(mod => ({ 
  default: mod.LoginForm 
})));

// Simple loading component
function LoginFormSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-sm animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-blue-200 rounded mt-6"></div>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}