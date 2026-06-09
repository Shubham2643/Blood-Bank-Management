import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/env.js";

export class SocketManager {
  constructor(token, onMessage, onError) {
    this.token = token;
    this.onMessage = onMessage;
    this.onError = onError;
    this.socket = null;
  }

  connect() {
    if (!this.token) return;

    this.socket = io(SOCKET_URL, {
      auth: { token: this.token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket.io connected:", this.socket.id);
    });

    this.socket.onAny((event, ...args) => {
      if (this.onMessage) {
        const payload = args[0] ?? { type: event };
        this.onMessage(typeof payload === "object" ? { ...payload, type: payload.type || event } : { type: event, message: payload });
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.io connect error:", error.message);
      if (this.onError) this.onError(error);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.io disconnected:", reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}
