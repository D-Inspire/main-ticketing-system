"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Users, Crown, Edit, Trash2 } from 'lucide-react'
import { motion } from "framer-motion"
import Link from "next/link"
import type { Department } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function DepartmentsPage() {
  const { departments, users, user, createDepartment, updateDepartment, deleteDepartment } = useStore()
  const { toast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    // Corrected call to createDepartment
    createDepartment({
      name: formData.name,
      description: formData.description,
    })

    toast({
      title: "Department created",
      description: `${formData.name} has been created successfully.`,
    })

    setFormData({ name: "", description: "" })
    setIsCreateOpen(false)
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      description: department.description || "", // Ensure description is not undefined
    })
    setIsEditOpen(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDepartment || !formData.name.trim()) return

    // Corrected call to updateDepartment
    updateDepartment(editingDepartment.id, {
      name: formData.name,
      description: formData.description,
    })

    toast({
      title: "Department updated",
      description: `${formData.name} has been updated successfully.`,
    })

    setFormData({ name: "", description: "" })
    setEditingDepartment(null)
    setIsEditOpen(false)
  }

  const handleDelete = (department: Department) => {
    deleteDepartment(department.id)
    toast({
      title: "Department deleted",
      description: `${department.name} has been deleted.`,
      variant: "destructive",
    })
  }

  const getDepartmentUsers = (departmentId: string) => {
    return users.filter(u => u.departmentId === departmentId)
  }

  const getDepartmentLeader = (departmentId: string) => {
    return users.find(u => u.departmentId === departmentId && u.role === "sub-admin")
  }

  const canManageDepartments = user?.role === "admin"
  const canViewDepartment = (department: Department) => {
    if (user?.role === "admin") return true
    if (user?.role === "sub-admin") return user.department === department.id // Corrected from departmentId to department
    return false
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">
              Manage your organization's departments and teams
            </p>
          </div>
          {canManageDepartments && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4 " />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#F9F9FA]">
                <DialogHeader>
                  <DialogTitle>Create New Department</DialogTitle>
                  <DialogDescription>
                    Add a new department to organize your teams and workflows.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Department Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter department name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter department description"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Department</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((department, index) => {
            const departmentUsers = getDepartmentUsers(department.id)
            const leader = getDepartmentLeader(department.id)
            
            if (!canViewDepartment(department)) return null

            return (
              <motion.div
                key={department.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{department.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {department.description}
                        </CardDescription>
                      </div>
                      {canManageDepartments && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(department)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(department)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {departmentUsers.length} {departmentUsers.length === 1 ? 'Member' : 'Members'}
                        </span>
                      </div>
                    </div>

                    {leader && (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <Crown className="h-4 w-4 text-yellow-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{leader.name}</p>
                          <p className="text-xs text-muted-foreground">Department Leader</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link href={`/departments/${department.id}/users`}>
                        <Button variant="outline" className="w-full">
                          <Users className="mr-2 h-4 w-4" />
                          Manage Users
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Edit Department Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-[#F9F9FA]">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Update the department information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Department Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter department name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter department description"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Department</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
