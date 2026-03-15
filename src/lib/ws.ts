export type WsOptions = {
  url: string;                 // vd: ws://localhost:8080/ws/chat?conversationId=1
  token?: string;              // nếu bạn xác thực bằng token
  onMessage: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (e: Event) => void;
};

export function createWsClient(opts: WsOptions) {
  const { url, token, onMessage, onOpen, onClose, onError } = opts;

  // Nếu backend bạn bắt token qua query param:
  const finalUrl = token ? `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}` : url;

  const ws = new WebSocket(finalUrl);

  ws.onopen = () => onOpen?.();
  ws.onclose = () => onClose?.();
  ws.onerror = (e) => onError?.(e);
  ws.onmessage = (evt) => {
    try {
      onMessage(JSON.parse(evt.data));
    } catch {
      onMessage(evt.data);
    }
  };

  return {
    ws,
    send: (payload: any) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(typeof payload === "string" ? payload : JSON.stringify(payload));
      }
    },
    close: () => ws.close(),
  };
}