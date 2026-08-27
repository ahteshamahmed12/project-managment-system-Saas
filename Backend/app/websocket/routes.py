import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.websocket.manager import ConnectionManager
from auth.jwt_handler import decode_access_token

router = APIRouter()

manager = ConnectionManager()


@router.websocket("/ws/notifications")
async def notifications_websocket(
    websocket: WebSocket,
    token: str | None = Query(None),
):
    """Authenticated websocket used to push real-time notifications.

    The client connects with its JWT as a query parameter:
        ws://host/ws/notifications?token=<access_token>
    """
    if not token:
        await websocket.close(code=1008)
        return

    payload = decode_access_token(token)
    if payload is None or not payload.get("sub"):
        await websocket.close(code=1008)
        return

    user_id = str(payload["sub"])

    connection_id = await manager.connect(websocket)
    manager.register_user(connection_id, user_id)

    try:
        # Keep the connection open; the server pushes, client may send pings.
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
