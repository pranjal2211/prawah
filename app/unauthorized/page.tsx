"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Home } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="glass rounded-2xl p-8 border border-white/20 shadow-lg">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-50/50 rounded-full flex items-center justify-center border border-red-200/50">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-var(--primary-dark) mb-2 font-poppins">
              403
            </h1>
            <h2 className="text-2xl font-semibold text-var(--primary-dark) mb-3">
              Access Denied
            </h2>
            <p className="text-var(--primary-dark)/70">
              You don't have permission to access this page. Your current role doesn't grant access to this resource.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gradient-primary text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-smooth flex items-center justify-center gap-2 group"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-white text-var(--primary) font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-smooth flex items-center justify-center gap-2 border-2 border-var(--accent)/20 group"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-var(--soft)/30 rounded-lg border border-var(--accent)/20">
            <p className="text-xs text-var(--primary-dark)/70">
              If you believe this is a mistake, please contact the administrator or try logging out and logging back in.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
