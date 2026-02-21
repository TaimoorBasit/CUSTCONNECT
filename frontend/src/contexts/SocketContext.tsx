'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        // Join private user room
        newSocket.emit('join-room', user.id);
      });

      newSocket.on('presence-update', (users: string[]) => {
        setOnlineUsers(users);
      });

      newSocket.on('new-message', (data) => {
        // Global notification for new message
        toast.success(`${data.message.sender.firstName}: ${data.message.content}`, {
          icon: '💬',
          duration: 4000,
        });
      });

      newSocket.on('new-story', (data) => {
        toast(`${data.author.firstName} shared a new story!`, {
          icon: '📸',
          duration: 3000,
        });
      });

      newSocket.on('notification', (data) => {
        toast(data.message, {
          icon: '🔔',
          duration: 3000,
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
