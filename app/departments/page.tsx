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
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Plus, Building2, Users, Edit, Trash2 } from "lucide-react"

export default function DepartmentsPage() {
  const { user, departments, users, createDepartment, updateDepartment, deleteDepartment } = useStore()
  const { toast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<any>(null)
  const [newDepartmentName, setNewDepartmentName] = useState("")

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    )
  }

  const handleCreateDepartment = () => {
    if (!newDepartmentName.trim()) return

    createDepartment(newDepartmentName.trim())
    setNewDepartmentName("")
    setIsCreateOpen(false)
    toast({
      title: "Department created",
      description: `${newDepartmentName} has been added successfully`,
    })
  }

  const handleEditDepartment = () => {
    if (!editingDepartment || !newDepartmentName.trim()) return

    updateDepartment(editingDepartment.id, newDepartmentName.trim())
    setNewDepartmentName("")
    setIsEditOpen(false)
    setEditingDepartment(null)
    toast({
      title: "Department updated",
      description: `Department has been updated successfully`,
    })
  }

  const handleDeleteDepartment = (department: any) => {
    const departmentUsers = users.filter((user) => user.department === department.name)
    if (departmentUsers.length > 0) {
      toast({
        title: "Cannot delete department",
        description: "Please reassign or remove all users from this department first",
        variant: "destructive",
      })
      return
    }

    deleteDepartment(department.id)
    toast({
      title: "Department deleted",
      description: `${department.name} has been removed`,
    })
  }

  const openEditDialog = (department: any) => {
    setEditingDepartment(department)
    setNewDepartmentName(department.name)
    setIsEditOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Departments</h1>
            <p className="text-muted-foreground">Manage organizational departments</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Department</DialogTitle>
                <DialogDescription>Add a new department to organize your team</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentName">Department Name</Label>
                  <Input
                    id="departmentName"
                    value={newDepartmentName}
                    onChange={(e) => setNewDepartmentName(e.target.value)}
                    placeholder="Enter department name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDepartment} className="bg-primary hover:bg-primary/90 text-white">
                  Create Department
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department, index) => {
            const departmentUsers = users.filter((user) => user.department === department.name)

            return (
              <motion.div
                key={department.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{department.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {departmentUsers.length} members
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(department)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDepartment(department)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Team Members</span>
                        <Badge variant="secondary">{departmentUsers.length}</Badge>
                      </div>
                      {departmentUsers.length > 0 && (
                        <div className="space-y-2">
                          {departmentUsers.slice(0, 3).map((user) => (
                            <div key={user.id} className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs text-white">
                                {user.name.charAt(0)}
                              </div>
                              <span className="truncate">{user.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {user.role}
                              </Badge>
                            </div>
                          ))}
                          {departmentUsers.length > 3 && (
                            <p className="text-xs text-muted-foreground">+{departmentUsers.length - 3} more members</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Edit Department Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>Update the department name</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editDepartmentName">Department Name</Label>
                <Input
                  id="editDepartmentName"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="Enter department name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditDepartment} className="bg-primary hover:bg-primary/90 text-white">
                Update Department
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
