from typing import Dict, List, Set
import json
import uuid

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # connection_id -> websocket
        self.active_connections: Dict[str, WebSocket] = {}
        # user_id -> set of connection_ids
        self.user_connections: Dict[str, Set[str]] = {}

    async def connect(
        self,
        websocket: WebSocket,
        connection_id: str | None = None,
    ) -> str:
        await websocket.accept()
        if connection_id is None:
            connection_id = str(uuid.uuid4())
        self.active_connections[connection_id] = websocket
        return connection_id

    def register_user(self, connection_id: str, user_id: str) -> None:
        self.user_connections.setdefault(user_id, set()).add(connection_id)

    def disconnect(self, connection_id: str) -> None:
        self.active_connections.pop(connection_id, None)
        for connections in self.user_connections.values():
            connections.discard(connection_id)

    async def send_personal_message(self, message: str, connection_id: str) -> None:
        websocket = self.active_connections.get(connection_id)
        if websocket:
            try:
                await websocket.send_text(message)
            except Exception:
                self.disconnect(connection_id)

    async def send_to_user(self, user_id: str, message: dict) -> None:
        connection_ids = list(self.user_connections.get(str(user_id), set()))
        for connection_id in connection_ids:
            websocket = self.active_connections.get(connection_id)
            if websocket:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception:
                    self.disconnect(connection_id)

    async def broadcast_to_board(self, board_id: int, message: dict) -> None:
        message_str = json.dumps(message)
        for connection in self.active_connections.values():
            try:
                await connection.send_text(message_str)
            except Exception:
                pass

    async def broadcast_to_user(
        self, user_id: str, message: dict
    ) -> None:
        await self.send_to_user(user_id, message)

    async def broadcast_task_event(
        self,
        event: dict,
        board_id: int | None = None,
        user_id: str | None = None,
    ) -> None:
        """Broadcast task status change events."""
        message = {
            "type": "task_event",
            "event": event,
            "board_id": board_id,
        }
        message_str = json.dumps(message)
        for connection in self.active_connections.values():
            try:
                await connection.send_text(message_str)
            except Exception:
                pass


# Shared connection manager used across the application.
manager = ConnectionManager()
