"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Ticket, Clock, CheckCircle, Pause, AlertCircle, User, Calendar } from 'lucide-react'
import { motion } from "framer-motion"
import type { Ticket as TicketType } from "@/lib/store"

export default function MemberDashboardPage() {
  const { tickets, user, departments, updateTicket } = useStore()
  const { toast } = useToast()
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [isResolveOpen, setIsResolveOpen] = useState(false)
  const [resolution, setResolution] = useState("")

  // Only show tickets for the user's department
  const departmentTickets = tickets.filter(ticket => 
    user?.departmentId && ticket.departmentId === user.departmentId
  )

  const department = departments.find(d => d.id === user?.departmentId)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "paused":
        return <Pause className="h-4 w-4 text-orange-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Ticket className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "paused":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateTicket(ticketId, { status: newStatus })
    toast({
      title: "Status updated",
      description: `Ticket status changed to ${newStatus}.`,
    })
  }

  const handleResolve = (ticket: TicketType) => {
    setSelectedTicket(ticket)
    setIsResolveOpen(true)
  }

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !resolution.trim()) return

    updateTicket(selectedTicket.id, {
      status: "completed",
      resolution: resolution,
      resolvedAt: new Date().toISOString(),
      resolvedBy: user?.name || "Unknown",
    })

    toast({
      title: "Ticket resolved",
      description: "The ticket has been marked as completed.",
    })

    setResolution("")
    setSelectedTicket(null)
    setIsResolveOpen(false)
  }

  const stats = {
    total: departmentTickets.length,
    new: departmentTickets.filter(t => t.status === "new").length,
    inProgress: departmentTickets.filter(t => t.status === "in-progress").length,
    paused: departmentTickets.filter(t => t.status === "paused").length,
    completed: departmentTickets.filter(t => t.status === "completed").length,
  }

  if (user?.role !== "user") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">This dashboard is only available for department members.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Manage your assigned tickets from {department?.name || "your department"}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.paused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Department Tickets</h2>
        
        {departmentTickets.length > 0 ? (
          <div className="space-y-4">
            {departmentTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{ticket.title}</CardTitle>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                        <CardDescription>{ticket.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.createdBy}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => handleStatusChange(ticket.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {ticket.status !== "completed" && (
                        <Button
                          variant="outline"
                          onClick={() => handleResolve(ticket)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Resolved
                        </Button>
                      )}
                      
                      {ticket.status === "completed" && ticket.resolution && (
                        <div className="flex-1 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-800 mb-1">Resolution:</p>
                          <p className="text-sm text-green-700">{ticket.resolution}</p>
                          {ticket.resolvedBy && ticket.resolvedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Resolved by {ticket.resolvedBy} on {new Date(ticket.resolvedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Tickets Assigned</h3>
            <p className="text-muted-foreground">
              There are currently no tickets assigned to your department.
            </p>
          </div>
        )}
      </div>

      {/* Resolve Ticket Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent className="bg-[#F9F9FA]">
          <DialogHeader>
            <DialogTitle>Resolve Ticket</DialogTitle>
            <DialogDescription>
              Provide details about how this ticket was resolved.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResolveSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution Details</Label>
                <Textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how you resolved this ticket..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Mark as Resolved</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
