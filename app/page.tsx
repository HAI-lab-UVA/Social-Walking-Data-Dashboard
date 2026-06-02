"use client";
import { useRouter } from "next/navigation";
import { checkAuthAndReroute } from "./firebase-auth";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      await checkAuthAndReroute.checkBothAuth("/dashboard", "/login", router);
    };
    checkAuth();
  }, [router]);

  return <div></div>;
}
