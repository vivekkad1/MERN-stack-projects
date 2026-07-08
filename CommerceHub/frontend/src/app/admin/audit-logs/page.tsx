"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ShieldAlert, Activity, User } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/features/audit-logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Review administrative actions and security events.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 bg-muted/20 border-b flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-muted-foreground">Recent Security Events</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Target Resource</th>
                <th className="px-6 py-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No audit logs found.
                  </td>
                </tr>
              ) : logs.map(log => (
                <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {log.user?.name || 'Unknown User'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 ml-6">{log.user?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {log.targetResource || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {log.details ? (
                      <pre className="text-[10px] bg-muted/50 p-2 rounded max-w-xs overflow-auto text-muted-foreground">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-muted-foreground">-</span>
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
