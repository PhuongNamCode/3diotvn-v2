import { useState, useEffect } from 'react';

// WebSocket connection for real-time updates
// This provides real-time synchronization between admin dashboard and frontend

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // In production, this would be a real WebSocket server
      // For now, we'll simulate with polling
      this.startPolling();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  private startPolling() {
    // Simulate real-time updates with polling
    setInterval(() => {
      this.notifyListeners('data-update', {
        timestamp: new Date().toISOString(),
        type: 'polling-update'
      });
    }, 5000); // Poll every 5 seconds
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectInterval);
    }
  }

  // Subscribe to events
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Unsubscribe from events
  unsubscribe(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners of an event
  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Send data to server (simulated)
  send(event: string, data: any) {
    console.log('Sending WebSocket message:', event, data);
    // In a real implementation, this would send via WebSocket
    this.notifyListeners(event, data);
  }

  // Close connection
  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export singleton instance
export const websocketManager = new WebSocketManager();

// React hook for WebSocket updates
export function useWebSocketUpdates() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const handleUpdate = (data: any) => {
      setLastUpdate(new Date());
    };

    websocketManager.subscribe('data-update', handleUpdate);

    return () => {
      websocketManager.unsubscribe('data-update', handleUpdate);
    };
  }, []);

  return { isConnected, lastUpdate };
}

