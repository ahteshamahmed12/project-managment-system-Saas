import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import ConnectionManager

router = APIRouter()

manager = ConnectionManager()


@router.websocket("/ws/{connection_id}")
async def websocket_endpoint(websocket: WebSocket, connection_id: str):
    await manager.connect(websocket, connection_id)
    try:
        while True:
            message = await websocket.receive_text()
            # Handle incoming messages if needed
            await manager.send_personal_message(
                f"Server received: {message}",
                connection_id,
            )
    except WebSocketDisconnect:
        manager.disconnect(connection_id)


@router.post("/notify/{connection_id}")
async def notify_connection(
    connection_id: str,
    message: dict,
):
    await manager.send_personal_message(
        json.dumps(message),
        connection_id,
    )
    return {"status": "sent"}