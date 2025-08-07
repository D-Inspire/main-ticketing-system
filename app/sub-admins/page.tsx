"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Plus, Crown, Mail, Building, Edit, Trash2 } from 'lucide-react'
import { motion } from "framer-motion"
import type { User } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function SubAdminsPage() {
  const { users, departments, user, createUser, updateUser, deleteUser } = useStore()
  const { toast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    departmentId: "",
    password: "",
  })

  // Only show sub-admins
  const subAdmins = users.filter(u => u.role === "sub-admin")

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.departmentId || !formData.password.trim()) return

    // Check if department already has a leader
    const existingLeader = users.find(u => u.department === getDepartmentName(formData.departmentId) && u.role === "sub-admin")
    if (existingLeader) {
      toast({
        title: "Department already has a leader",
        description: "Each department can only have one sub-admin leader.",
        variant: "destructive",
      })
      return
    }

    createUser({
      name: formData.name,
      email: formData.email,
      role: "sub-admin",
      department: getDepartmentName(formData.departmentId), // Store department name
      password: formData.password,
    })

    toast({
      title: "Sub-admin created",
      description: `${formData.name} has been assigned as department leader.`,
    })

    setFormData({ name: "", email: "", departmentId: "", password: "" })
    setIsCreateOpen(false)
  }

  const handleEdit = (subAdmin: User) => {
    setEditingUser(subAdmin)
    setFormData({
      name: subAdmin.name,
      email: subAdmin.email,
      departmentId: departments.find(d => d.name === subAdmin.department)?.id || "", // Convert name back to ID for form
      password: subAdmin.password || "",
    })
    setIsEditOpen(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser || !formData.name.trim() || !formData.email.trim() || !formData.departmentId || !formData.password.trim()) return

    // Check if department already has a different leader
    const existingLeader = users.find(u => 
      u.department === getDepartmentName(formData.departmentId) && 
      u.role === "sub-admin" && 
      u.id !== editingUser.id
    )
    if (existingLeader) {
      toast({
        title: "Department already has a leader",
        description: "Each department can only have one sub-admin leader.",
        variant: "destructive",
      })
      return
    }

    updateUser(editingUser.id, {
      name: formData.name,
      email: formData.email,
      department: getDepartmentName(formData.departmentId), // Store department name
      password: formData.password,
    })

    toast({
      title: "Sub-admin updated",
      description: `${formData.name} has been updated successfully.`,
    })

    setFormData({ name: "", email: "", departmentId: "", password: "" })
    setEditingUser(null)
    setIsEditOpen(false)
  }

  const handleDelete = (subAdmin: User) => {
    deleteUser(subAdmin.id)
    toast({
      title: "Sub-admin removed",
      description: `${subAdmin.name} has been removed from leadership.`,
      variant: "destructive",
    })
  }

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || "Unknown Department"
  }

  const getAvailableDepartments = () => {
    const departmentsWithLeaders = users
      .filter(u => u.role === "sub-admin" && u.id !== editingUser?.id)
      .map(u => departments.find(d => d.name === u.department)?.id) // Get department ID from name
      .filter(Boolean) as string[]
    
    return departments.filter(d => !departmentsWithLeaders.includes(d.id))
  }

  const canManageSubAdmins = user?.role === "admin"

  if (!canManageSubAdmins) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sub-Admins</h1>
            <p className="text-muted-foreground">
              Manage department leaders and their responsibilities
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Sub-Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#F9F9FA]">
              <DialogHeader>
                <DialogTitle>Create New Sub-Admin</DialogTitle>
                <DialogDescription>
                  Assign a department leader with administrative privileges.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department to lead" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableDepartments().map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Sub-Admin</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subAdmins.map((subAdmin, index) => (
            <motion.div
              key={subAdmin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/placeholder-user.jpg`} />
                        <AvatarFallback>{subAdmin.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {subAdmin.name}
                          <Crown className="h-4 w-4 text-yellow-600" />
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {subAdmin.email}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(subAdmin)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subAdmin)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {subAdmin.department || "No Department"}
                    </span>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    Department Leader
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {subAdmins.length === 0 && (
          <div className="text-center py-12">
            <Crown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Sub-Admins Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first sub-admin to manage departments effectively.
            </p>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Sub-Admin
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}

        {/* Edit Sub-Admin Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-[#F9F9FA]">
            <DialogHeader>
              <DialogTitle>Edit Sub-Admin</DialogTitle>
              <DialogDescription>
                Update sub-admin information and department assignment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Password</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department to lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDepartments().map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Sub-Admin</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
