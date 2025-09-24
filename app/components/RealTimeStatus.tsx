"use client";

import { useState, useEffect } from "react";
import { useWebSocketUpdates } from "@/lib/websocket";

export default function RealTimeStatus() {
  const { isConnected, lastUpdate } = useWebSocketUpdates();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (lastUpdate) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdate]);

  return (
    <div className="realtime-status">
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        <i className={`fas fa-circle ${isConnected ? 'connected' : 'disconnected'}`}></i>
        <span>{isConnected ? 'Kết nối' : 'Mất kết nối'}</span>
      </div>
      
      {isVisible && lastUpdate && (
        <div className="update-notification">
          <i className="fas fa-sync-alt"></i>
          <span>Dữ liệu đã cập nhật</span>
        </div>
      )}
    </div>
  );
}
