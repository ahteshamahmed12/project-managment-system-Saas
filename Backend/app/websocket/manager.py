from typing import List, Dict, Optional
from fastapi import WebSocket
import json
import uuid


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}  # connection_id -> websocket
        
    async def connect(self, websocket: WebSocket, connection_id: str | None = None):
        await websocket.accept()
        if connection_id is None:
            connection_id = str(uuid.uuid4())
        self.active_connections[connection_id] = websocket
        
    def disconnect(self, connection_id: str):
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
            
    async def send_personal_message(self, message: str, connection_id: str):
        websocket = self.active_connections.get(connection_id)
        if websocket:
            await websocket.send_text(message)
            
    async def broadcast_to_board(self, board_id: int, message: dict):
        message_str = json.dumps(message)
        for connection in self.active_connections.values():
            try:
                await connection.send_text(message_str)
            except:
                pass
                
    async def broadcast_to_user(self, user_id: str, message: dict):
        message_str = json.dumps(message)
        for connection_id, connection in self.active_connections.items():
            # In a real app, you'd track which connection belongs to which user
            try:
                await connection.send_text(message_str)
            except:
                pass
                
    async def broadcast_task_event(self, event: dict, board_id: int | None = None, user_id: str | None = None):
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
            except:
                pass