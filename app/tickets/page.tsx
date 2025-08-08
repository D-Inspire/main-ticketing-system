"use client"

import { useState, useMemo } from "react"
import { useStore, Ticket } from "@/lib/store" // Import Ticket type
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Eye, Edit, Clock, User, CheckCircle, RotateCcw } from 'lucide-react'
import Link from "next/link"
import { TicketDetailsModal } from "@/components/ticket-details-modal" // Import the new modal component
import { ScrollArea } from "@/components/ui/scroll-area" // Ensure ScrollArea is imported if used in modal
import { Separator } from "@/components/ui/separator" // Ensure Separator is imported if used in modal


export default function TicketsPage() {
  const { tickets, departments, users, user, updateTicket, addLogEntry } = useStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null) // Use Ticket type
  const [isResolveOpen, setIsResolveOpen] = useState(false)
  const [isUnresolveOpen, setIsUnresolveOpen] = useState(false)
  const [resolution, setResolution] = useState("")
  const [unresolveReason, setUnresolveReason] = useState("")
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false) // New state for details modal

  const filteredTickets = useMemo(() => {
    let ticketsToShow = tickets

    // Filter by user role
    if (user?.role === "sub-admin") {
      ticketsToShow = tickets.filter((ticket) => ticket.department === user.department)
    } else if (user?.role === "user") {
      ticketsToShow = tickets.filter((ticket) => ticket.department === user.department)
    }

    return ticketsToShow.filter((ticket) => {
      const matchesSearch =
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
      const matchesDepartment = departmentFilter === "all" || ticket.department === departmentFilter
      const matchesLevel = levelFilter === "all" || ticket.level === levelFilter

      return matchesSearch && matchesStatus && matchesDepartment && matchesLevel
    })
  }, [tickets, searchTerm, statusFilter, departmentFilter, levelFilter, user])

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
      user: user?.name || "Unknown",
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
      user: user?.name || "Unknown",
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

  const openResolveDialog = (ticket: Ticket) => { // Use Ticket type
    setSelectedTicket(ticket)
    setResolution("")
    setIsResolveOpen(true)
  }

  const openUnresolveDialog = (ticket: Ticket) => { // Use Ticket type
    setSelectedTicket(ticket)
    setUnresolveReason("")
    setIsUnresolveOpen(true)
  }

  const openDetailsModal = (ticket: Ticket) => { // New function for details modal
    setSelectedTicket(ticket)
    setIsDetailsModalOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Tickets</h1>
            <p className="text-muted-foreground">Manage and track all support tickets</p>
          </div>
          {(user?.role === "admin" || user?.role === "sub-admin") && (
            <Link href="/tickets/create">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {user?.role === "admin" && (
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setDepartmentFilter("all")
                  setLevelFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No tickets found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket, index) => (
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
                            <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("-", " ")}</Badge>
                            <Badge className={getLevelColor(ticket.level)}>{ticket.level}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(ticket.dateFiled).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{ticket.department}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 text-center">📧</span>
                            <span>{ticket.source}</span>
                          </div>
                        </div>

                        {ticket.recommendation && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-800 mb-1">Resolution:</p>
                            <p className="text-sm text-green-700">{ticket.recommendation}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Changed Link to Button for modal trigger */}
                        <Button variant="outline" size="sm" onClick={() => openDetailsModal(ticket)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {(user?.role === "admin" || user?.role === "sub-admin") && (
                          <Link href={`/tickets/${ticket.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                        )}
                        {ticket.status !== "completed" ? (
                          <Button
                            onClick={() => openResolveDialog(ticket)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                        ) : (
                          <Button
                            onClick={() => openUnresolveDialog(ticket)}
                            variant="outline"
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
            ))
          )}
        </div>

        {/* Pagination placeholder */}
        {filteredTickets.length > 0 && (
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </p>
          </div>
        )}

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

        {/* Ticket Details Modal */}
        <TicketDetailsModal
          ticket={selectedTicket}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          users={users}
          departments={departments}
        />
      </div>
    </DashboardLayout>
  )
}
