from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.discard(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket) -> None:
        await websocket.send_text(message)

    async def broadcast(self, message: str) -> None:
        disconnected: set[WebSocket] = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.add(connection)
        for connection in disconnected:
            self.disconnect(connection)
