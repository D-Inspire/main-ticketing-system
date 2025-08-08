"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Ticket, User, Department } from "@/lib/store"
import { Save } from 'lucide-react'

interface TicketEditModalProps {
  ticket: Ticket | null
  isOpen: boolean
  onClose: () => void
  onSave: (ticketId: string, updates: Partial<Ticket>) => void
  users: User[]
  departments: Department[]
  companySections: string[]
  sources: string[]
  currentUserRole: User['role'] | undefined
}

export function TicketEditModal({
  ticket,
  isOpen,
  onClose,
  onSave,
  users,
  departments,
  companySections,
  sources,
  currentUserRole,
}: TicketEditModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<Partial<Ticket>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (ticket) {
      setFormData({
        name: ticket.name,
        phone: ticket.phone,
        email: ticket.email,
        companySection: ticket.companySection,
        source: ticket.source,
        dateFiled: ticket.dateFiled.split('T')[0], // Format for date input
        subject: ticket.subject,
        message: ticket.message,
        recommendation: ticket.recommendation,
        level: ticket.level,
        status: ticket.status,
        department: ticket.department,
        assignedUser: ticket.assignedUser,
        autoEmail: ticket.autoEmail,
      })
    }
  }, [ticket])

  const handleInputChange = (field: keyof Ticket, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "department") {
      setFormData((prev) => ({ ...prev, assignedUser: "" })); // Reset assigned user if department changes
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticket?.id) return

    setIsSubmitting(true)
    try {
      onSave(ticket.id, formData)
      toast({
        title: "Ticket updated successfully",
        description: "The ticket details have been saved.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSubAdmin = currentUserRole === "sub-admin"

  // Filter users based on the selected department (or sub-admin's department)
  const departmentUsers = users.filter((u) => u.department === formData.department && u.role === "user")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Ticket: {ticket?.subject}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ticket ID: {ticket?.id}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
            {/* Customer Information */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySection">Company Section</Label>
                    <Select
                      value={formData.companySection || ""}
                      onValueChange={(value) => handleInputChange("companySection", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySections
                          .filter(section => section !== "")
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
                    <Select value={formData.source || ""} onValueChange={(value) => handleInputChange("source", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {sources
                          .filter(source => source !== "")
                          .map((source) => (
                            <SelectItem key={source} value={source}>
                              {source}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Ticket Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject || ""}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={formData.message || ""}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recommendation">Recommendation</Label>
                    <Textarea
                      id="recommendation"
                      rows={3}
                      value={formData.recommendation || ""}
                      onChange={(e) => handleInputChange("recommendation", e.target.value)}
                      placeholder="Optional recommendations for resolution"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment, Priority & Status, Email Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assignment */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Assignment</h3>
                {!isSubAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department || ""}
                      onValueChange={(value) => handleInputChange("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments
                          .filter(dept => dept.name !== "")
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
                      value={formData.department || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="assignedUser">Assigned User</Label>
                  <Select
                    value={formData.assignedUser || ""}
                    onValueChange={(value) => handleInputChange("assignedUser", value)}
                    disabled={!formData.department || departmentUsers.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentUsers
                        .filter(user => user.name !== "")
                        .map((user) => (
                          <SelectItem key={user.id} value={user.name}>
                            {user.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Priority & Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Priority & Status</h3>
                <div className="space-y-2">
                  <Label htmlFor="level">Priority Level</Label>
                  <Select value={formData.level || ""} onValueChange={(value: any) => handleInputChange("level", value)}>
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
                    value={formData.status || ""}
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
                    value={formData.dateFiled || ""}
                    onChange={(e) => handleInputChange("dateFiled", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Email Settings</h3>
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
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
