from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.manager import ConnectionManager


router = APIRouter()

manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            message = await websocket.receive_text()

            await manager.send_personal_message(
                f"Server received: {message}",
                websocket,
            )

    except WebSocketDisconnect:
        manager.disconnect(websocket)