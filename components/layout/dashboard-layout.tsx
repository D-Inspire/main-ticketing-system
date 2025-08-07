"use client"

import type React from "react"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Menu, Home, Ticket, Users, Building2, LogOut, UserPlus, Search, LayoutDashboard } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useStore()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Tickets", href: "/tickets", icon: Ticket },
    { name: "Search", href: "/search", icon: Search },
    ...(user?.role === "admin"
      ? [
          { name: "Departments", href: "/departments", icon: Building2 },
          { name: "Sub-admins", href: "/sub-admins", icon: UserPlus },
        ]
      : []),
    ...(user?.role === "sub-admin"
      ? [
          { name: "Departments", href: "/departments", icon: Building2 },
          { name: "Users", href: "/users", icon: Users },
        ]
      : []),
    ...(user?.role === "user"
      ? [
          { name: "My Dashboard", href: "/member-dashboard", icon: LayoutDashboard },
        ]
      : []),
  ]

  const handleLogout = () => {
    logout()
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", mobile ? "w-full" : "w-80")}>
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-primary">NanoTicket</h2>
            <p className="text-xs text-muted-foreground">System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <span className="text-white font-medium">{user?.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0 text">
            <p className="font-medium truncate">{user?.name}</p>
            <div className="flex justify-center flex-col gap-2">
              <Badge variant="secondary" className="text-xs p-0">
                {user?.role === "admin" ? "Admin" : user?.role === "sub-admin" ? "Sub-Admin" : "Member"}
              </Badge>
              {user?.department && (
                <Badge variant="outline" className="text-xs w-fit">
                  {user.department}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => mobile && setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background ">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-primary">Ticketing System</h1>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-80">
        <main className="p-4 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
