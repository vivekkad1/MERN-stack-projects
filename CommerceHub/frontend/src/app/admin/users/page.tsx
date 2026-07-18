"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

async function fetchUsers() {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Failed to update role", error);
      alert("Failed to update role");
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? <ShieldAlert className="w-4 h-4 text-red-500" /> : 
                       user.role === 'seller' ? <ShieldCheck className="w-4 h-4 text-blue-500" /> : 
                       <Shield className="w-4 h-4 text-muted-foreground" />}
                      <span className="capitalize font-medium">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {user.role === 'customer' && (
                      <Button size="sm" variant="outline" onClick={() => handleRoleChange(user._id, 'seller')}>
                        Make Seller
                      </Button>
                    )}
                    {user.role === 'seller' && (
                      <Button size="sm" variant="outline" onClick={() => handleRoleChange(user._id, 'customer')}>
                        Revoke Seller
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
