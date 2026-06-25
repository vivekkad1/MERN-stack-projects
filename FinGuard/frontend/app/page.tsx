import AuthTabs from '@/components/AuthTabs';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
      
      <div className="z-10 w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-3 text-emerald-400">
            <Activity size={40} />
            <h1 className="text-4xl font-extrabold tracking-tight">FinGuard</h1>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-slate-100 leading-tight">
            Smart Personal Finance & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Pattern Monitor
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto md:mx-0">
            Take elite control of your expenditures. Track, analyze, and proactively block duplicate transactions with our algorithmic pattern detection engine.
          </p>
        </div>
        
        <div className="flex-1 w-full">
          <AuthTabs />
        </div>
      </div>
    </main>
  );
}
