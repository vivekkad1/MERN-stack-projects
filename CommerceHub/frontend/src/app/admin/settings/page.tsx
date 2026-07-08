"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Settings, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Flag State
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/features/feature-flags');
      if (res.data.success) {
        setFlags(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch feature flags", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/features/feature-flags/${id}`, { isEnabled: !currentStatus });
      fetchFlags();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update flag");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/features/feature-flags', { name: newName, description: newDesc, isEnabled: false });
      setShowNew(false);
      setNewName('');
      setNewDesc('');
      fetchFlags();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create flag");
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">Manage global feature flags and configuration.</p>
        </div>
        <Button onClick={() => setShowNew(!showNew)}>
          {showNew ? 'Cancel' : 'Create Feature Flag'}
        </Button>
      </div>

      {showNew && (
        <div className="bg-card rounded-xl border p-6 shadow-sm mb-6 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">New Feature Flag</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Flag Key Name (e.g., ENABLE_NEW_UI)</label>
              <input required value={newName} onChange={(e) => setNewName(e.target.value.toUpperCase().replace(/\s+/g, '_'))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="FEATURE_NAME" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <input required value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="What does this feature flag control?" />
            </div>
            <Button type="submit">Save Feature Flag</Button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {flags.length === 0 ? (
          <div className="p-12 border rounded-xl bg-card text-center text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Feature Flags</h3>
            <p>Create a feature flag to toggle experimental features on or off.</p>
          </div>
        ) : flags.map(flag => (
          <div key={flag._id} className="p-6 border rounded-xl bg-card flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold font-mono text-lg">{flag.name}</h3>
                {flag.isEnabled ? (
                  <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Enabled
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    <XCircle className="w-3 h-3 mr-1" /> Disabled
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{flag.description}</p>
            </div>
            
            <button 
              onClick={() => handleToggle(flag._id, flag.isEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${flag.isEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
