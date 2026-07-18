"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Send, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected ticket state
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');

async function fetchTickets() {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  

  const fetchTicketDetails = async (id: string) => {
    try {
      const res = await api.get(`/tickets/${id}`);
      if (res.data.success) {
        setSelectedTicket(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch ticket details", error);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      await api.post(`/tickets/${selectedTicket._id}/responses`, { message: replyMessage });
      setReplyMessage('');
      fetchTicketDetails(selectedTicket._id);
      fetchTickets(); // Refresh list to update status if it changed
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send reply");
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await api.put(`/tickets/${selectedTicket._id}/status`, { status });
      fetchTicketDetails(selectedTicket._id);
      fetchTickets();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to change status");
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage and respond to customer inquiries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-card rounded-xl border shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tickets..."
                className="pl-8 bg-muted/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredTickets.map(ticket => (
              <div 
                key={ticket._id} 
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${selectedTicket?._id === ticket._id ? 'bg-primary/10 border-primary/20 border' : 'hover:bg-muted/50 border border-transparent'}`}
                onClick={() => fetchTicketDetails(ticket._id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-sm line-clamp-1">{ticket.subject}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${ticket.status === 'Closed' ? 'bg-green-100 text-green-800' : ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{ticket.user?.name}</div>
                <div className="text-[10px] text-muted-foreground mt-2">{new Date(ticket.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm flex flex-col h-[600px]">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b flex justify-between items-start bg-muted/20">
                <div>
                  <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    From: <span className="font-medium text-foreground">{selectedTicket.user?.name}</span> ({selectedTicket.user?.email})
                  </p>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg border mr-12">
                  <div className="font-medium text-sm mb-2 text-muted-foreground">Original Message - {new Date(selectedTicket.createdAt).toLocaleString()}</div>
                  <p className="whitespace-pre-wrap text-sm">{selectedTicket.message}</p>
                </div>

                {selectedTicket.responses.map((res: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg border ${res.user?.role === 'admin' || res.user?.role === 'super_admin' ? 'bg-primary/5 ml-12 border-primary/20' : 'bg-muted/30 mr-12'}`}>
                    <div className="font-medium text-sm mb-2 flex items-center justify-between">
                      <span>{res.user?.name} {res.user?.role === 'admin' && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded ml-2">Support Team</span>}</span>
                      <span className="text-xs text-muted-foreground">{new Date(res.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{res.message}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t bg-muted/10 flex gap-2">
                <Textarea 
                  value={replyMessage} 
                  onChange={(e) => setReplyMessage(e.target.value)} 
                  placeholder="Type your response to the customer..." 
                  className="min-h-[80px]"
                />
                <Button className="h-auto" onClick={handleSendReply}>
                  <Send className="w-4 h-4 mr-2" /> Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a ticket from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
