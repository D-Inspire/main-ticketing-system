"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { CheckCircle, Clock, AlertCircle, User, Calendar, Building2, RotateCcw } from 'lucide-react'

export default function MemberDashboard() {
  const { user, tickets, updateTicket, addLogEntry } = useStore()
  const { toast } = useToast()
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [resolution, setResolution] = useState("")
  const [unresolveReason, setUnresolveReason] = useState("")
  const [isResolveOpen, setIsResolveOpen] = useState(false)
  const [isUnresolveOpen, setIsUnresolveOpen] = useState(false)

  // Check if user is a member
  if (user?.role !== "user") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">This dashboard is only for department members.</p>
        </div>
      </DashboardLayout>
    )
  }

  // Get tickets assigned to this user's department
  const assignedTickets = tickets.filter((ticket) => ticket.department === user.department)

  const ticketStats = useMemo(() => {
    return {
      total: assignedTickets.length,
      new: assignedTickets.filter((t) => t.status === "new").length,
      inProgress: assignedTickets.filter((t) => t.status === "in-progress").length,
      completed: assignedTickets.filter((t) => t.status === "completed").length,
    }
  }, [assignedTickets])

  const handleResolveTicket = () => {
    if (!selectedTicket || !resolution.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a resolution description",
        variant: "destructive",
      })
      return
    }

    updateTicket(selectedTicket.id, {
      status: "completed",
      recommendation: resolution.trim(),
    })

    addLogEntry(selectedTicket.id, {
      action: "Ticket Resolved",
      user: user.name,
      details: `Resolution: ${resolution.trim()}`,
    })

    setResolution("")
    setIsResolveOpen(false)
    setSelectedTicket(null)
    toast({
      title: "Ticket resolved",
      description: "The ticket has been marked as completed",
    })
  }

  const handleUnresolveTicket = () => {
    if (!selectedTicket || !unresolveReason.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a reason for unresolving",
        variant: "destructive",
      })
      return
    }

    updateTicket(selectedTicket.id, {
      status: "in-progress",
      recommendation: undefined,
    })

    addLogEntry(selectedTicket.id, {
      action: "Ticket Unresolved",
      user: user.name,
      details: `Reason: ${unresolveReason.trim()}`,
    })

    setUnresolveReason("")
    setIsUnresolveOpen(false)
    setSelectedTicket(null)
    toast({
      title: "Ticket unresolved",
      description: "The ticket has been reopened for further work",
    })
  }

  const handleUpdateStatus = (ticketId: string, newStatus: string) => {
    updateTicket(ticketId, { status: newStatus })
    addLogEntry(ticketId, {
      action: "Status Updated",
      user: user.name,
      details: `Status changed to ${newStatus}`,
    })

    toast({
      title: "Status updated",
      description: `Ticket status changed to ${newStatus}`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-orange-100 text-orange-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "casual":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const openResolveDialog = (ticket: any) => {
    setSelectedTicket(ticket)
    setResolution("")
    setIsResolveOpen(true)
  }

  const openUnresolveDialog = (ticket: any) => {
    setSelectedTicket(ticket)
    setUnresolveReason("")
    setIsUnresolveOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your assigned tickets</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {user.department}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {user.role}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.total}</div>
              <p className="text-xs text-muted-foreground">Assigned to your department</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Tickets</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{ticketStats.new}</div>
              <p className="text-xs text-muted-foreground">Awaiting attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{ticketStats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Currently working on</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{ticketStats.completed}</div>
              <p className="text-xs text-muted-foreground">Successfully resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Assigned Tickets</h2>
          {assignedTickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No tickets assigned</p>
                  <p className="text-sm">Check back later for new assignments</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignedTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg text-primary truncate">{ticket.subject}</h3>
                              <p className="text-muted-foreground text-sm">
                                {ticket.name} • {ticket.email}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status.replace("-", " ")}
                              </Badge>
                              <Badge className={getLevelColor(ticket.level)}>{ticket.level}</Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(ticket.dateFiled).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              <span>{ticket.department}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{ticket.source}</span>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground mb-3">
                            <p className="line-clamp-2">{ticket.message}</p>
                          </div>

                          {ticket.recommendation && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm font-medium text-green-800 mb-1">Resolution:</p>
                              <p className="text-sm text-green-700">{ticket.recommendation}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <Select
                            value={ticket.status}
                            onValueChange={(value) => handleUpdateStatus(ticket.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {ticket.status !== "completed" ? (
                            <Button
                              onClick={() => openResolveDialog(ticket)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                          ) : (
                            <Button
                              onClick={() => openUnresolveDialog(ticket)}
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Unresolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Resolve Ticket Dialog */}
        <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
          <DialogContent className="bg-[#F9F9FA]">
            <DialogHeader>
              <DialogTitle>Resolve Ticket</DialogTitle>
              <DialogDescription>
                Provide a resolution for: {selectedTicket?.subject}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution Details</Label>
                <Textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how you resolved this ticket..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResolveOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleResolveTicket}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Resolved
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unresolve Ticket Dialog */}
        <Dialog open={isUnresolveOpen} onOpenChange={setIsUnresolveOpen}>
          <DialogContent className="bg-[#F9F9FA]">
            <DialogHeader>
              <DialogTitle>Unresolve Ticket</DialogTitle>
              <DialogDescription>
                Reopen ticket: {selectedTicket?.subject}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unresolveReason">Reason for Unresolving</Label>
                <Textarea
                  id="unresolveReason"
                  value={unresolveReason}
                  onChange={(e) => setUnresolveReason(e.target.value)}
                  placeholder="Explain why this ticket needs to be reopened..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUnresolveOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUnresolveTicket}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reopen Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
