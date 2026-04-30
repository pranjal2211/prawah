"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import AuthHeader from "@/components/auth-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error || "Invalid credentials")
      } else if (result?.ok) {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen flex items-center justify-center gradient-soft px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Main Card */}
          <div className="glass rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-var(--primary-dark) mb-2">
                Welcome Back
              </h2>
              <p className="text-var(--primary-dark)/70">
                Sign in to access your electricity demand predictions
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-lg bg-red-50/80 border border-red-200 flex gap-3 animate-slide-up">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-var(--primary-dark) font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="rounded-lg bg-white/50 border-var(--accent)/20 focus:border-var(--primary) focus:ring-2 focus:ring-var(--primary)/10 transition-smooth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-var(--primary-dark) font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="rounded-lg bg-white/50 border-var(--accent)/20 focus:border-var(--primary) focus:ring-2 focus:ring-var(--primary)/10 transition-smooth"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                style={{ background: "#f56c04" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
                  </>
                )}
              </button>
            </form>

         

           

            {/* Sign up link */}
            <div className="text-center">
              <p className="text-var(--primary-dark)/70 text-sm">
                Don't have an account?{" "}
                <Link 
                  href="/register" 
                  className="text-var(--primary) font-semibold hover:text-var(--accent) transition-smooth"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-accent/5 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
    </>
  )
}
