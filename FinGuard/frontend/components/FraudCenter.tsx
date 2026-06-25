'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FraudCenter() {
  const [vendor, setVendor] = useState('Amazon AWS');
  const [amount, setAmount] = useState('49.99');
  const [category, setCategory] = useState('SaaS');
  const [isInjecting, setIsInjecting] = useState(false);
  
  const queryClient = useQueryClient();
  const { addTransaction, alerts, addAlert } = useStore();

  const handleInject = async () => {
    setIsInjecting(true);
    try {
      const { data } = await api.post('/transactions', {
        vendor,
        amount: Number(amount),
        category
      });
      
      addTransaction(data.transaction);
      
      if (data.triggerAlert) {
        addAlert(data.transaction);
      }
      
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (error) {
      console.error('Failed to inject transaction', error);
    }
    setIsInjecting(false);
  };

  const simulateRapidFire = async () => {
    setIsInjecting(true);
    try {
      const payload = { vendor, amount: Number(amount), category };
      
      const { data: data1 } = await api.post('/transactions', payload);
      addTransaction(data1.transaction);
      if (data1.triggerAlert) addAlert(data1.transaction);
      
      await new Promise(res => setTimeout(res, 500));
      
      const { data: data2 } = await api.post('/transactions', payload);
      addTransaction(data2.transaction);
      if (data2.triggerAlert) addAlert(data2.transaction);
      
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (error) {
      console.error('Rapid fire failed', error);
    }
    setIsInjecting(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center mb-4">
          <Zap className="mr-2 text-cyan-400" size={20} />
          Transaction Sandbox Tester
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Input 
            placeholder="Vendor" 
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="bg-slate-900 border-slate-700 text-slate-100"
          />
          <Input 
            type="number"
            placeholder="Amount" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-slate-900 border-slate-700 text-slate-100"
          />
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-900 border-slate-700 text-slate-100 rounded-md px-3 py-2 text-sm"
          >
            <option value="SaaS">SaaS</option>
            <option value="Food">Food</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Housing">Housing</option>
            <option value="Utilities">Utilities</option>
            <option value="Misc">Misc</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <Button 
            onClick={handleInject} 
            disabled={isInjecting}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
          >
            Inject Single
          </Button>
          <Button 
            onClick={simulateRapidFire} 
            disabled={isInjecting}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            Simulate Rapid-Fire
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Live Alert Feed</h3>
        <div className="min-h-[150px]">
          <AnimatePresence>
            {alerts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-[100px] border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm"
              >
                Monitoring active. No patterns detected.
              </motion.div>
            ) : (
              alerts.map((alert, i) => (
                <motion.div
                  key={`${alert._id}-${i}`}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-red-950/40 border border-red-500/50 rounded-lg p-4 mb-3 flex items-start space-x-4 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <ShieldAlert className="text-red-500 mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="text-red-400 font-bold">Duplicate Charge Detected</h4>
                    <p className="text-slate-300 text-sm mt-1">
                      Rapid succession pattern flagged for <span className="text-slate-100 font-semibold">{alert.vendor}</span> (${alert.amount}). Timestamp: {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
