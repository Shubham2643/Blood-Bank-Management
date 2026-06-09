import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/env.js";
import { getAuthToken } from "../utils/auth.js";

const CAMP_EVENTS = [
  "new-camp",
  "camp-updated",
  "camp-completed",
  "camp-deleted",
];

/**
 * Subscribe to real-time blood camp updates via Socket.io.
 * Calls onUpdate when camps are created, updated, completed, or deleted.
 */
export function useCampRealtime(onUpdate, options = {}) {
  const { enabled = true, publicOnly = false, debounceMs = 400 } = options;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const token = getAuthToken();
    const usePublic = publicOnly || !token;

    const socket = usePublic
      ? io(`${SOCKET_URL}/public`, {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
        })
      : io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
        });

    const scheduleUpdate = (payload, event) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onUpdateRef.current?.({ event, ...payload });
      }, debounceMs);
    };

    CAMP_EVENTS.forEach((event) => {
      socket.on(event, (payload) => scheduleUpdate(payload, event));
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      CAMP_EVENTS.forEach((event) => {
        socket.off(event);
      });
      socket.disconnect();
    };
  }, [enabled, publicOnly, debounceMs]);
}

export default useCampRealtime;
