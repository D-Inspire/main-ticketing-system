"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Plus, User, Mail, Calendar, UserPlus } from 'lucide-react'

export default function UsersPage() {
  const { user, users, createUser } = useStore()
  const { toast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  })

  // Check if user is sub-admin
  if (user?.role !== "sub-admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    )
  }

  // Get users from the sub-admin's department
  const departmentUsers = users.filter((u) => u.department === user.department && u.role === "user")

  const handleCreateUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Check if email already exists
    const existingUser = users.find((u) => u.email === newUser.email)
    if (existingUser) {
      toast({
        title: "Email already exists",
        description: "A user with this email already exists",
        variant: "destructive",
      })
      return
    }

    createUser({
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      password: newUser.password.trim(),
      role: "user",
      department: user.department,
    })

    setNewUser({ name: "", email: "", password: "" })
    setIsCreateOpen(false)
    toast({
      title: "User created",
      description: `${newUser.name} has been added to your department`,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Department Members</h1>
            <p className="text-muted-foreground">Manage members in {user.department}</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#F9F9FA]">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>Add a new member to your department</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="memberName">Full Name</Label>
                  <Input
                    id="memberName"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberEmail">Email Address</Label>
                  <Input
                    id="memberEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberPassword">Password</Label>
                  <Input
                    id="memberPassword"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Department:</strong> {user.department}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    New member will be automatically assigned to your department
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} className="bg-primary hover:bg-primary/90 text-white">
                  Add Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Department Members</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentUsers.length}</div>
            <p className="text-xs text-muted-foreground">Active members in {user.department}</p>
          </CardContent>
        </Card>

        {/* Members List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Department Members</h2>
          {departmentUsers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No members yet</p>
                  <p className="text-sm">Add members to your department to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentUsers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder-user.jpg" />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{member.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Role</span>
                          <Badge variant="secondary">Member</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Department</span>
                          <Badge variant="outline" className="text-xs">
                            {member.department}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>Department Member</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Department Management</h3>
                <p className="text-sm text-blue-700 mb-2">
                  As a sub-admin, you can add new members to your department but cannot remove existing members. 
                  Contact the main administrator if you need to remove a member.
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Add new members with email invitations</li>
                  <li>• View all department member details</li>
                  <li>• Assign tickets to department members</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
