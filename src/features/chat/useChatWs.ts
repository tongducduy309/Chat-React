import { useEffect, useRef, useState, useCallback } from "react";
import { getProfile } from "../user/user.api";
import type { User } from "../user/user.type";
import type {
  ConversationCreate,
  MessageRes,
  NameUpdateRes,
  ReadMessageRes,
} from "./chat.types";
import type { CallRes } from "../call/call.types";
import {
  ConversationEvents,
  FriendshipEvents,
} from "../websocket/websocket.types";
import type { UpdateFriendshipRes } from "../friendship/friendship.type";

type RawListener = (raw: string) => void;

type UseChatWsProps = {
  onMessage: (m: MessageRes) => void;
  onCall: (m: CallRes) => void;
  onConversationCreate: (m: ConversationCreate) => void;
  onReadMessage: (m: ReadMessageRes) => void;
  onNameUpdate: (n: NameUpdateRes, m: MessageRes) => void;
  onUpdateFriendship: (u: UpdateFriendshipRes) => void;
};

export function useChatWs({
  onMessage,
  onCall,
  onConversationCreate,
  onReadMessage,
  onNameUpdate,
  onUpdateFriendship,
}: UseChatWsProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const rawListeners = useRef<RawListener[]>([]);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);
  const userIdRef = useRef<number | null>(null);

  const onMessageRef = useRef(onMessage);
  const onCallRef = useRef(onCall);
  const onConversationCreateRef = useRef(onConversationCreate);
  const onReadMessageRef = useRef(onReadMessage);
  const onNameUpdateRef = useRef(onNameUpdate);
  const onUpdateFriendshipRef = useRef(onUpdateFriendship);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onCallRef.current = onCall;
  }, [onCall]);

  useEffect(() => {
    onConversationCreateRef.current = onConversationCreate;
  }, [onConversationCreate]);

  useEffect(() => {
    onReadMessageRef.current = onReadMessage;
  }, [onReadMessage]);

  useEffect(() => {
    onNameUpdateRef.current = onNameUpdate;
  }, [onNameUpdate]);

  useEffect(() => {
    onUpdateFriendshipRef.current = onUpdateFriendship;
  }, [onUpdateFriendship]);

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
        const parsed = JSON.parse(raw);

        if (parsed.event === ConversationEvents.CONVERSATION_CREATE) {
          onConversationCreateRef.current?.(parsed.data as ConversationCreate);
          return;
        }

        if (parsed.event === ConversationEvents.READ_MESSAGE) {
          onReadMessageRef.current?.(parsed.data as ReadMessageRes);
          return;
        }

        if (parsed.event === ConversationEvents.NAME_UPDATE) {
          onNameUpdateRef.current?.(
            parsed.data.nameUpdateRes as NameUpdateRes,
            parsed.data.messageRes as MessageRes
          );
          return;
        }

        if (parsed.event === FriendshipEvents.FRIENDSHIP_UPDATE) {
          onUpdateFriendshipRef.current?.(parsed.data as UpdateFriendshipRes);
          return;
        }

        if (parsed.event === ConversationEvents.MESSAGE) {
          onMessageRef.current?.(parsed.data as MessageRes);
          return;
        }

        onCallRef.current?.(parsed as CallRes);
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
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(
          1000 * 2 ** (reconnectAttemptsRef.current - 1),
          10000
        );

        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      }
    };
  }, [clearReconnectTimeout]);

  useEffect(() => {
    isUnmountedRef.current = false;

    const init = async () => {
      try {
        const res: User = await getProfile();
        if (!res?.id || isUnmountedRef.current) return;

        userIdRef.current = res.id;
        connect();
      } catch {
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(
          1000 * 2 ** (reconnectAttemptsRef.current - 1),
          10000
        );

        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (!isUnmountedRef.current) {
            init();
          }
        }, delay);
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
  }, [clearReconnectTimeout, connect]);

  return {
    ready,
    sendRaw,
    subscribeRaw,
  };
}