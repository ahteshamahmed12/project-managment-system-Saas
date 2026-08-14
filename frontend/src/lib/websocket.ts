export type WebSocketMessageHandler = (message: string) => void;

let socket: WebSocket | null = null;

export function connectWebSocket(onMessage: WebSocketMessageHandler): WebSocket | null {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  const base = import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:8000";
  socket = new WebSocket(`${base}/ws?token=${encodeURIComponent(token)}`);

  socket.onmessage = (event) => onMessage(event.data);
  socket.onclose = () => { socket = null; };
  return socket;
}

export function disconnectWebSocket(): void {
  socket?.close();
  socket = null;
}
