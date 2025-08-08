"use client"

import type React from "react"

import { useState, useEffect } from "react" // Import useEffect
import { useStore } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Mail } from 'lucide-react'
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CreateTicketPage() {
  const { createTicket, departments, users, companySections, sources, user } = useStore()
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    companySection: "",
    source: "",
    dateFiled: new Date().toISOString().split("T")[0],
    subject: "",
    message: "",
    recommendation: "",
    level: "medium" as "urgent" | "high" | "medium" | "casual",
    status: "new" as "new" | "in-progress" | "paused" | "completed",
    department: user?.role === "sub-admin" ? user.department || "" : "", // Auto-set department for sub-admins
    assignedUser: "",
    autoEmail: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter users based on the selected department (or sub-admin's department)
  const departmentUsers = users.filter((u) => u.department === formData.department && u.role === "user")

  // Effect to update department if user role changes or department is pre-set
  useEffect(() => {
    if (user?.role === "sub-admin" && user.department && formData.department !== user.department) {
      setFormData((prev) => ({
        ...prev,
        department: user.department,
        assignedUser: "", // Reset assigned user if department changes
      }))
    }
  }, [user, formData.department])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      createTicket(formData)
      toast({
        title: "Ticket created successfully",
        description: "The ticket has been added to the system",
      })
      router.push("/tickets")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Reset assigned user when department changes
    if (field === "department") {
      setFormData((prev) => ({
        ...prev,
        assignedUser: "",
      }))
    }
  }

  const backHandler = () => window.history.back()

  const isSubAdmin = user?.role === "sub-admin"

  return (
    <DashboardLayout>
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={backHandler}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Create New Ticket</h1>
            <p className="text-muted-foreground">Add a new support ticket to the system</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>Basic details about the customer</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companySection">Company Section</Label>
                        <Select
                          value={formData.companySection}
                          onValueChange={(value) => handleInputChange("companySection", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            {companySections
                              .filter(section => section !== "") // Filter out empty strings
                              .map((section) => (
                                <SelectItem key={section} value={section}>
                                  {section}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="source">Source</Label>
                        <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            {sources
                              .filter(source => source !== "") // Filter out empty strings
                              .map((source) => (
                                <SelectItem key={source} value={source}>
                                  {source}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ticket Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Details</CardTitle>
                    <CardDescription>Information about the support request</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recommendation">Recommendation</Label>
                      <Textarea
                        id="recommendation"
                        rows={3}
                        value={formData.recommendation}
                        onChange={(e) => handleInputChange("recommendation", e.target.value)}
                        placeholder="Optional recommendations for resolution"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Assignment */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment</CardTitle>
                    <CardDescription>Assign ticket to department and user</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Hide department select for sub-admins */}
                    {!isSubAdmin && (
                      <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => handleInputChange("department", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments
                              .filter(dept => dept.name !== "") // Filter out empty strings
                              .map((dept) => (
                                <SelectItem key={dept.id} value={dept.name}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {isSubAdmin && (
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="assignedUser">Assigned User</Label>
                      <Select
                        value={formData.assignedUser}
                        onValueChange={(value) => handleInputChange("assignedUser", value)}
                        disabled={!formData.department || departmentUsers.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentUsers
                            .filter(user => user.name !== "") // Filter out empty strings
                            .map((user) => (
                              <SelectItem key={user.id} value={user.name}>
                                {user.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Priority & Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Priority & Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="level">Priority Level</Label>
                      <Select value={formData.level} onValueChange={(value: any) => handleInputChange("level", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">🔴 Urgent</SelectItem>
                          <SelectItem value="high">🟠 High</SelectItem>
                          <SelectItem value="medium">🟡 Medium</SelectItem>
                          <SelectItem value="casual">🟢 Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => handleInputChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFiled">Date Filed</Label>
                      <Input
                        id="dateFiled"
                        type="date"
                        value={formData.dateFiled}
                        onChange={(e) => handleInputChange("dateFiled", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Email Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoEmail"
                        checked={formData.autoEmail}
                        onCheckedChange={(checked) => handleInputChange("autoEmail", checked)}
                      />
                      <Label htmlFor="autoEmail" className="text-sm">
                        Send auto-email confirmation
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    disabled={isSubmitting}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Creating..." : "Create Ticket"}
                  </Button>
                  <Link href="/tickets" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
