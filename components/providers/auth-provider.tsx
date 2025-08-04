"use client"

import type React from "react"

import { useStore } from "@/lib/store"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user } = useStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user && pathname !== "/login") {
      router.push("/login")
    } else if (user && pathname === "/login") {
      router.push("/dashboard")
    }
  }, [user, pathname, router])

  return <>{children}</>
}
