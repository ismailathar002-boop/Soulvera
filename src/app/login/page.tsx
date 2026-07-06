"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The login page now redirects to the combined auth page (/register) with login tab active.
// This maintains backward compatibility for any links pointing to /login.
export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register?tab=login");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex items-center gap-3 text-stone-500">
        <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Redirecting to sign in...</span>
      </div>
    </div>
  );
}
