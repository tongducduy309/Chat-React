import { useEffect, useRef, useState, useCallback } from "react";
import { getProfile } from "../user/user.api";
import type { User } from "../user/user.type";
import type { ConversationCreate, ConversationRes, MessageRes, NameUpdateRes, ReadMessageRes } from "./chat.types";
import type { CallRes } from "../call/call.types";
import { MessageEvent } from "../websocket/websocket.types";
type RawListener = (raw: string) => void;

export function useChatWs(onMessage: (m: MessageRes) => void, onCall: (m: CallRes) => void, onConversationCreate: (m: ConversationCreate) => void, 
onReadMessage: (m: ReadMessageRes) => void, onNameUpdate: (n: NameUpdateRes, m: MessageRes) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const rawListeners = useRef<RawListener[]>([]);
  const [ready, setReady] = useState(false);

  const sendRaw = useCallback((data: any) => {
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

  useEffect(() => {
    let ws: WebSocket;

    getProfile().then((res: User) => {
      if (!res) return;

      ws = new WebSocket(`ws://localhost:8080/ws?userId=${res.id}`);
      wsRef.current = ws;

      ws.onopen = () => setReady(true);
      ws.onclose = () => setReady(false);
      ws.onerror = () => setReady(false);

      ws.onmessage = (evt) => {
        const raw = String(evt.data);

        // cho module khác (voice call) nghe
        rawListeners.current.forEach((fn) => fn(raw));

        try {
          const parsed = JSON.parse(raw);

          if (parsed.event===MessageEvent.CONVERSATION_CREATE) {
            onConversationCreate(parsed.data);
            return
          }

          if (parsed.event===MessageEvent.READ_MESSAGE) {
            onReadMessage(parsed.data);
            return
          }

          if (parsed.event===MessageEvent.NAME_UPDATE) {
            onNameUpdate(parsed.data.nameUpdateRes, parsed.data.messageRes);
            return
          }

          if (parsed.event===MessageEvent.MESSAGE) {
            onMessage(parsed.data);
          }
          else {
            onCall(parsed);
          }
        } catch {}

      };
    });

    return () => {
      ws?.close();
      wsRef.current = null;
      setReady(false);
    };
  }, [onMessage, onCall, onConversationCreate, onReadMessage, onNameUpdate]);

  return {
    ready,
    sendRaw,
    subscribeRaw,
  };
}