import { useEffect, useRef, useState, useCallback } from "react";
import { getProfile } from "../user/user.api";
import type { User } from "../user/user.type";

type RawListener = (raw: string) => void;

export function useAppWs() {
  const wsRef = useRef<WebSocket | null>(null);
  const rawListeners = useRef<RawListener[]>([]);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);
  const userIdRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);

  const sendRaw = useCallback((data: unknown) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(data));
  }, []);

  const subscribeRaw = useCallback((fn: RawListener) => {
    rawListeners.current.push(fn);
    return () => {
      rawListeners.current = rawListeners.current.filter((l) => l !== fn);
    };
  }, []);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (isUnmountedRef.current || !userIdRef.current) return;

    clearReconnectTimeout();

    reconnectAttemptsRef.current += 1;

    const delay = Math.min(1000 * 2 ** (reconnectAttemptsRef.current - 1), 10000);
    // 1s -> 2s -> 4s -> 8s -> 10s max

    reconnectTimeoutRef.current = window.setTimeout(() => {
      connect();
    }, delay);
  }, [clearReconnectTimeout]);

  const connect = useCallback(() => {
    const userId = userIdRef.current;
    if (!userId || isUnmountedRef.current) return;

    const current = wsRef.current;
    if (
      current &&
      (current.readyState === WebSocket.OPEN ||
        current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const ws = new WebSocket(`ws://localhost:8080/ws?userId=${userId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setReady(true);
      reconnectAttemptsRef.current = 0;
      clearReconnectTimeout();
    };

    ws.onmessage = (evt) => {
      const raw = String(evt.data);
      rawListeners.current.forEach((fn) => fn(raw));

      try {
        JSON.parse(raw);
      } catch {}
    };

    ws.onerror = () => {
      setReady(false);
      ws.close();
    };

    ws.onclose = () => {
      setReady(false);
      wsRef.current = null;

      if (!isUnmountedRef.current) {
        scheduleReconnect();
      }
    };
  }, [clearReconnectTimeout, scheduleReconnect]);

  useEffect(() => {
    isUnmountedRef.current = false;

    const init = async () => {
      try {
        const res: User = await getProfile();
        if (!res?.id || isUnmountedRef.current) return;

        userIdRef.current = res.id;
        connect();
      } catch {
        scheduleReconnect();
      }
    };

    init();

    return () => {
      isUnmountedRef.current = true;
      clearReconnectTimeout();
      wsRef.current?.close();
      wsRef.current = null;
      setReady(false);
    };
  }, [clearReconnectTimeout, connect, scheduleReconnect]);

  return {
    ready,
    sendRaw,
    subscribeRaw,
  };
}