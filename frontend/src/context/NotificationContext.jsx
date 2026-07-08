/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getAuthToken, isAuthenticated } from "../utils/auth";
import { SocketManager } from "../utils/socket";
import { notificationApi } from "../services/api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(getAuthToken());

  // Check for login/logout (token changes)
  useEffect(() => {
    const checkToken = () => {
      const currentToken = getAuthToken();
      if (currentToken !== token) {
        setToken(currentToken);
      }
    };

    window.addEventListener("storage", checkToken);
    const interval = setInterval(checkToken, 1000);

    return () => {
      window.removeEventListener("storage", checkToken);
      clearInterval(interval);
    };
  }, [token]);

  const fetchNotifications = async () => {
    if (!isAuthenticated()) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setIsLoading(true);
    try {
      const response = await notificationApi.getNotifications();
      if (response.data?.success) {
        const data = response.data.data;
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await notificationApi.markAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      fetchNotifications(); // Rollback if API fails
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      await notificationApi.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      fetchNotifications(); // Rollback if API fails
    }
  };

  // Connect WebSockets and fetch initial notifications on token change
  useEffect(() => {
    if (!token || !isAuthenticated()) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const ws = new SocketManager(
      token,
      (data) => {
        console.log("WebSocket event received:", data);

        // Standard notification event from our notifyUser/notifyRole helpers
        if (data.type === "notification" || data._id || data.recipient) {
          const newNotif = {
            _id: data._id || Date.now().toString(),
            message: data.message,
            read: data.read || false,
            type: data.type || "info",
            createdAt: data.createdAt || new Date().toISOString(),
          };

          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show a beautiful toast
          toast(data.message, {
            icon: "🔔",
            duration: 5000,
            position: "top-right",
            style: {
              background: "#1e293b",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            },
          });
        } 
        // Also support special system dispatches (like emergency requests, etc. that aren't stored as user-notifications directly but should display toasts)
        else if (data.type === "alert" || data.type === "emergency") {
          toast[data.severity || "info"](data.message, {
            duration: 6000,
            position: "top-right",
          });
        }
      },
      (error) => {
        console.error("WebSocket error:", error);
      }
    );

    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, [token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
