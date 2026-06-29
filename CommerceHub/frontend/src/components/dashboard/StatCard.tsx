import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number; // percentage
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all border-none shadow-sm bg-card/50 backdrop-blur-xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
          
          {trend !== undefined && (
            <span className={cn(
              "flex items-center text-sm font-medium",
              trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
            )}>
              {trend > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : trend < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : null}
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
