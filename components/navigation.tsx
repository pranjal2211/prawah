"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Zap, LineChart, Menu, X, LogOut, Settings, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface NavItem {
  label: string
  href: string
  icon: any
  requiredRoles: string[]
}

const navItems: NavItem[] = [
  {
    label: "Prediction",
    href: "/predict",
    icon: Zap,
    requiredRoles: ["ANALYST", "ADMIN"],
  },
  {
    label: "Shortage Analysis",
    href: "/shortage-analysis",
    icon: AlertTriangle,
    requiredRoles: ["ANALYST", "ADMIN"],
  },
  {
    label: "Analytics",
    href: "https://app.powerbi.com/Redirect?action=openreport&context=Annotate&ctid=eb7259e8-50af-4960-bc42-a0ea7e39e3cf&pbi_source=mobile_android&groupObjectId=8fb76def-f191-4b8c-b9ae-fa2ebfd1414b&reportObjectId=d992e273-8164-4747-b537-f30c43283d4c&fullScreen=0",
    icon: LineChart,
    requiredRoles: ["VIEWER", "ANALYST", "ADMIN"],
  },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  // Hide navigation on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  const visibleNavItems = navItems.filter((item) =>
    session?.user?.role ? item.requiredRoles.includes(session.user.role) : false
  )

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <nav className="sticky top-0 z-50 glass animate-slide-down" style={{ background: "#2364AA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group hover:opacity-80 transition-smooth">
            <div className="relative p-2 bg-gradient-primary rounded-xl shadow-md flex items-center justify-center group-hover:shadow-lg transition-smooth">
              <img
                src="/icon.png"
                alt="App Icon"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover shadow-sm border border-white/20"
                style={{ background: "#fff" }}
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-var(--primary-dark) font-bold text-2xl sm:text-3xl font-poppins">
                प्रवाह
              </h1>
              <p className="text-var(--primary) text-xs font-medium">Demand Prediction</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth font-bold text-sm ${
                    isActive
                      ? "bg-gradient-primary text-white shadow-md"
                      : "text-white hover:bg-soft/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}

            {/* Admin link */}
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth font-bold text-sm ${
                  pathname === "/admin"
                    ? "bg-gradient-primary text-white shadow-md"
                    : "text-white hover:bg-soft/30"
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* User menu and auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <>
                <div className="text-right mr-2 border-r border-var(--accent) pr-4">
                  <p className="text-xs font-bold text-white">
                    {session.user.email}
                  </p>
                  <p className="text-xs uppercase tracking-wide font-bold text-white">
                    {session.user.role}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:bg-soft/50 transition-smooth font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-primary text-white hover:shadow-lg transition-smooth">
                  Sign in
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-soft/30 rounded-lg transition-smooth text-var(--primary-dark)"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4 animate-slide-down">
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-smooth font-bold text-sm ${
                    isActive
                      ? "bg-gradient-primary text-white shadow-md"
                      : "text-white hover:bg-soft/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}

            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-smooth font-bold text-sm ${
                  pathname === "/admin"
                    ? "bg-gradient-primary text-white shadow-md"
                    : "text-white hover:bg-soft/30"
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}

            <div className="border-t border-var(--accent)/20 pt-4 mt-4">
              {session?.user ? (
                <>
                  <p className="px-4 py-2 text-xs font-bold text-white">
                    {session.user.email}
                  </p>
                  <p className="px-4 py-1 text-xs uppercase tracking-wide mb-3 font-bold text-white">
                    {session.user.role}
                  </p>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white bg-gradient-primary hover:shadow-lg transition-smooth font-medium text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-primary text-white hover:shadow-lg transition-smooth">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
