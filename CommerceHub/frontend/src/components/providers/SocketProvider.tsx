"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Determine backend URL, assuming standard Next.js proxy or process.env setup
    const URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const socketInstance = io(URL, {
      autoConnect: false,
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    if (user) {
      socket.connect();

      socket.on('connect', () => {
        setIsConnected(true);
        // Register the user ID with the backend
        socket.emit('register', user.id);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      // Listen for notifications
      socket.on('notification', (data) => {
        // We'll use standard alert or a custom toast
        // You could replace this with a proper toast library like sonner or react-hot-toast
        
        // Let's create a custom styled toast element appended to the body
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-[100] p-4 rounded-lg shadow-lg max-w-sm w-full animate-in slide-in-from-top-2 fade-in duration-300 ${
          data.type === 'success' ? 'bg-green-500 text-white' : 
          data.type === 'error' ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
        }`;
        
        toast.innerHTML = `
          <h4 class="font-bold mb-1">${data.title}</h4>
          <p class="text-sm opacity-90">${data.message}</p>
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
          toast.classList.add('animate-out', 'fade-out', 'slide-out-to-top-2');
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 300);
        }, 5000);
      });

    } else {
      socket.disconnect();
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('notification');
    };
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
