"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2, Users, Shield } from "lucide-react"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

type Role = "VIEWER" | "ANALYST" | "ADMIN"

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  useEffect(() => {
    // Wait for session to load
    if (session === undefined) {
      return
    }

    // Redirect if not admin
    if (session && session.user?.role !== "ADMIN") {
      router.push("/unauthorized")
      return
    }

    // Only fetch users when authenticated as admin
    if (session?.user?.role === "ADMIN") {
      fetchUsers()
    }
  }, [session, router])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      setError("Failed to load users")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdatingUserId(userId)
      setError("")
      setSuccess("")

      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) throw new Error("Failed to update user")

      // Update local state
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      setSuccess(`User role updated to ${newRole}`)

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to update user role")
      console.error(err)
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-var(--primary) mx-auto mb-4" />
          <p className="text-var(--primary-dark)/70">Loading users...</p>
        </div>
      </div>
    )
  }

  const roleColors = {
    ADMIN: "bg-[#ea7317]/10 text-[#ea7317] border-[#ea7317]/30",
    ANALYST: "bg-[#3da5d9]/10 text-[#3da5d9] border-[#3da5d9]/30",
    VIEWER: "bg-var(--soft)/50 text-var(--primary-dark) border-var(--accent)/20",
  }

  return (
    <div className="min-h-screen gradient-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-var(--primary)" />
            <h1 className="text-4xl font-bold text-var(--primary-dark) font-poppins">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-var(--primary-dark)/70">
            Manage users and their role permissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass rounded-xl p-6 border border-white/20 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <p className="text-var(--primary-dark)/70 text-sm font-medium">Total Users</p>
              <Users className="w-4 h-4 text-var(--accent)" />
            </div>
            <p className="text-var(--primary-dark) text-3xl font-bold font-poppins">{users.length}</p>
          </div>

          <div className="glass rounded-xl p-6 border border-white/20 animate-slide-up animate-delay-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-var(--primary-dark)/70 text-sm font-medium">Admins</p>
              <Shield className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-var(--primary-dark) text-3xl font-bold font-poppins">
              {users.filter((u) => u.role === "ADMIN").length}
            </p>
          </div>

          <div className="glass rounded-xl p-6 border border-white/20 animate-slide-up animate-delay-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-var(--primary-dark)/70 text-sm font-medium">Analysts</p>
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-var(--primary-dark) text-3xl font-bold font-poppins">
              {users.filter((u) => u.role === "ANALYST").length}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="glass rounded-xl p-5 border border-red-200/50 bg-red-50/40 flex gap-4 mb-6 animate-slide-up">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-semibold text-sm mb-1">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="glass-dark rounded-xl p-5 border border-green-200/40 bg-green-50/30 flex gap-4 mb-6 animate-slide-up">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-700 font-semibold text-sm mb-1">Success</p>
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="glass rounded-2xl border border-white/20 overflow-hidden shadow-lg animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20 bg-white/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-var(--primary-dark)">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-var(--primary-dark)">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-var(--primary-dark)">Current Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-var(--primary-dark)">Change Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-var(--primary-dark)">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/10 hover:bg-white/10 transition-smooth group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-var(--primary-dark) group-hover:text-var(--primary) transition-smooth">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-var(--primary-dark)/70">{user.name || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                          roleColors[user.role as keyof typeof roleColors] ||
                          roleColors.VIEWER
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                        disabled={updatingUserId === user.id}
                      >
                        <SelectTrigger className="w-32 bg-white/30 border-var(--accent)/20 text-var(--primary-dark) hover:bg-white/40 transition-smooth rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white rounded-lg shadow-lg">
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                          <SelectItem value="ANALYST">Analyst</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-var(--primary-dark)/70 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-16 text-var(--primary-dark)/70">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-medium">No users found</p>
            </div>
          )}
        </div>

        {/* Role Information */}
        <div className="glass rounded-xl p-6 border border-white/20 mt-12 animate-slide-up animate-delay-300">
          <h3 className="text-lg font-semibold text-var(--primary-dark) mb-4 font-poppins">
            📌 Role Permissions
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-var(--soft)/30 border border-var(--accent)/20">
              <p className="text-sm font-semibold text-var(--primary-dark) mb-2">👁️ Viewer</p>
              <p className="text-xs text-var(--primary-dark)/70">
                Can access dashboard and analytics with read-only permissions
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/50">
              <p className="text-sm font-semibold text-blue-700 mb-2">🔍 Analyst</p>
              <p className="text-xs text-blue-600">
                Can access prediction form and perform demand forecasting
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-50/50 border border-red-200/50">
              <p className="text-sm font-semibold text-red-700 mb-2">🛡️ Admin</p>
              <p className="text-xs text-red-600">
                Full access including user management and system settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
