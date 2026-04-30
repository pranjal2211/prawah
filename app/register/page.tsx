"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthHeader from "@/components/auth-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle2, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
      } else {
        setSuccess("Registration successful! Redirecting to login...")
        setTimeout(() => {
          router.push("/login")
        }, 1500)
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
                Create Account
              </h2>
              <p className="text-var(--primary-dark)/70">
                Join us to start forecasting electricity demand
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 rounded-lg bg-red-50/80 border border-red-200 flex gap-3 animate-slide-up">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-lg bg-green-50/80 border border-green-200 flex gap-3 animate-slide-up">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 font-medium">{success}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-var(--primary-dark) font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="rounded-lg bg-white/50 border-var(--accent)/20 focus:border-var(--primary) focus:ring-2 focus:ring-var(--primary)/10 transition-smooth"
                />
              </div>

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
                <p className="text-xs text-var(--primary-dark)/60">Minimum 8 characters recommended</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-var(--primary-dark) font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="rounded-lg bg-white/50 border-var(--accent)/20 focus:border-var(--primary) focus:ring-2 focus:ring-var(--primary)/10 transition-smooth"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
                style={{ background: "#f56c04" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
                  </>
                )}
              </button>
            </form>

            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-var(--primary-dark)/70 text-sm">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="text-var(--primary) font-semibold hover:text-var(--accent) transition-smooth"
                >
                  Sign in
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
