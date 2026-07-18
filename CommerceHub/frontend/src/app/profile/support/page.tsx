"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, LifeBuoy, Send } from 'lucide-react';
import Link from 'next/link';

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New ticket state
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('Low');

  // Selected ticket state
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');

async function fetchTickets() {
    try {
      setLoading(true);
      const res = await api.get('/tickets/my-tickets');
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tickets', { subject, message, priority });
      setShowNew(false);
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create ticket");
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      await api.post(`/tickets/${selectedTicket._id}/responses`, { message: replyMessage });
      setReplyMessage('');
      fetchTicketDetails(selectedTicket._id);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send reply");
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-12"><div className="animate-pulse h-96 bg-muted rounded-xl" /></div>;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="mb-6">
        <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to Profile
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LifeBuoy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          </div>
          {!selectedTicket && !showNew && (
            <Button onClick={() => setShowNew(true)}>Create Ticket</Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-6 max-w-4xl">
        {showNew ? (
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Create New Support Ticket</h2>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your issue" />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Detailed description of your issue" rows={5} />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Submit Ticket</Button>
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </form>
        ) : selectedTicket ? (
          <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)} className="mb-2">
              <ChevronLeft className="w-4 h-4 mr-2" /> Back to Tickets
            </Button>
            
            <div className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Ticket #{selectedTicket._id.substring(0,8)} • Created {new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${selectedTicket.status === 'Closed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg border">
                <div className="font-medium text-sm mb-2">{selectedTicket.user?.name} (You)</div>
                <p className="whitespace-pre-wrap text-sm">{selectedTicket.message}</p>
              </div>

              {selectedTicket.responses.map((res: any, idx: number) => (
                <div key={idx} className={`p-4 rounded-lg border ${res.user?.role === 'admin' || res.user?.role === 'super_admin' ? 'bg-primary/5 ml-8 border-primary/20' : 'bg-muted/30 mr-8'}`}>
                  <div className="font-medium text-sm mb-2 flex items-center justify-between">
                    <span>{res.user?.name} {res.user?.role === 'admin' && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded ml-2">Support Team</span>}</span>
                    <span className="text-xs text-muted-foreground">{new Date(res.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{res.message}</p>
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'Closed' && (
              <div className="mt-6 pt-4 border-t flex gap-2">
                <Textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Type your reply..." />
                <Button className="h-auto" onClick={handleSendReply}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <LifeBuoy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Support Tickets</h3>
            <p className="text-muted-foreground mt-2">You haven't created any support tickets yet.</p>
          </div>
        ) : (
          <div className="divide-y">
            {tickets.map(ticket => (
              <div key={ticket._id} className="py-4 flex items-center justify-between hover:bg-muted/30 px-2 rounded cursor-pointer transition-colors" onClick={() => fetchTicketDetails(ticket._id)}>
                <div>
                  <h4 className="font-medium">{ticket.subject}</h4>
                  <p className="text-sm text-muted-foreground mt-1">Updated {new Date(ticket.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${ticket.status === 'Closed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {ticket.status}
                  </span>
                  <ChevronLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
