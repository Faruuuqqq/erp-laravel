import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <Badge variant="destructive" className="flex items-center gap-2 px-4 py-2 shadow-lg">
        <WifiOff className="h-4 w-4" />
        <span>Anda sedang offline. Data mungkin tidak up-to-date.</span>
      </Badge>
    </div>
  );
};