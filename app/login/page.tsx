"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Ticket, Eye, EyeOff, RefreshCw } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, resetStore } = useStore()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to the ticketing system!",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    resetStore()
    toast({
      title: "Store reset",
      description: "All data has been reset to defaults. Try logging in again.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Ticketing System</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card className="bg-[#F9F9FA] border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Reset Button */}
            <div className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleReset}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Store Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-[#F9F9FA] border-0">
          <CardHeader>
            <CardTitle className="text-lg">Demo Credentials</CardTitle>
            <CardDescription>Use these accounts to test the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Admin Account</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">ADMIN</span>
                </div>
                <p className="text-sm text-muted-foreground">admin@company.com</p>
                <p className="text-sm text-muted-foreground">password</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Sub-Admin Account</span>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">SUB-ADMIN</span>
                </div>
                <p className="text-sm text-muted-foreground">subadmin@company.com</p>
                <p className="text-sm text-muted-foreground">password</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Member Account</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">MEMBER</span>
                </div>
                <p className="text-sm text-muted-foreground">john@company.com</p>
                <p className="text-sm text-muted-foreground">password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
