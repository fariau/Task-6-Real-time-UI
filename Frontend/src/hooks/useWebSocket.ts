import { useEffect, useState, useCallback } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  icon: string;
  read: boolean;
  timestamp: string;
}

interface WebSocketMessage {
  event: string;
  data: any;
}

export function useWebSocket(userId: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [isConnected, setIsConnected] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter((n) => !n.read).length;
    setUnreadCount(count);
  };

  useEffect(() => {
    let websocket: WebSocket;

    const connectWebSocket = () => {
      websocket = new WebSocket(
        `wss://task-6-real-time-ui-production.up.railway.app/ws/${userId}`
      );

      websocket.onopen = () => {
        console.log('✅ WebSocket Connected');
        setIsConnected(true);
      };

      websocket.onmessage = (event: MessageEvent) => {
        const data: WebSocketMessage = JSON.parse(event.data);

        console.log('📨 Message:', data);

        if (data.event === 'initial_notifications') {
          setNotifications(data.data);
          updateUnreadCount(data.data);
        }

        else if (data.event === 'new_notification') {
          setNotifications((prev) => {
            const updated = [data.data, ...prev];
            updateUnreadCount(updated);
            return updated;
          });
        }

        else if (data.event === 'notification_read') {
          setNotifications((prev) => {
            const updated = prev.map((n) =>
              n.id === data.data.notification_id
                ? { ...n, read: true }
                : n
            );

            updateUnreadCount(updated);

            return updated;
          });
        }

        else if (data.event === 'notification_deleted') {
          setNotifications((prev) => {
            const updated = prev.filter(
              (n) => n.id !== data.data.notification_id
            );

            updateUnreadCount(updated);

            return updated;
          });
        }
      };

      websocket.onerror = (error) => {
        console.error('❌ WebSocket Error:', error);
        setIsConnected(false);
      };

      websocket.onclose = () => {
        console.log('❌ WebSocket Disconnected');

        setIsConnected(false);

        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      setWs(websocket);
    };

    connectWebSocket();

    return () => {
      websocket?.close();
    };
  }, [userId]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            action: 'mark_read',
            notification_id: notificationId,
          })
        );
      }
    },
    [ws]
  );

  const deleteNotification = useCallback(
    (notificationId: string) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            action: 'delete',
            notification_id: notificationId,
          })
        );
      }
    },
    [ws]
  );

  return {
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    deleteNotification,
    ws,
  };
}