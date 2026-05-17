from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
from uuid import uuid4
from datetime import datetime
import json

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active websocket connections
active_connections: Dict[str, WebSocket] = {}

# Store notifications
notifications_db: Dict[str, List[dict]] = {}


# Home Route
@app.get("/")
async def home():
    return {"message": "✅ FastAPI Notification Server Running"}


# WebSocket Route
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()

    active_connections[user_id] = websocket

    print(f"✅ User Connected: {user_id}")

    # Create user notifications array if not exists
    if user_id not in notifications_db:
        notifications_db[user_id] = []

    # Send old notifications
    await websocket.send_text(
        json.dumps({
            "event": "initial_notifications",
            "data": notifications_db[user_id]
        })
    )

    try:
        while True:
            data = await websocket.receive_text()

            parsed = json.loads(data)

            # MARK AS READ
            if parsed["action"] == "mark_read":
                notif_id = parsed["notification_id"]

                for notif in notifications_db[user_id]:
                    if notif["id"] == notif_id:
                        notif["read"] = True

                await websocket.send_text(
                    json.dumps({
                        "event": "notification_read",
                        "data": {
                            "notification_id": notif_id
                        }
                    })
                )

            # DELETE NOTIFICATION
            elif parsed["action"] == "delete":
                notif_id = parsed["notification_id"]

                notifications_db[user_id] = [
                    n for n in notifications_db[user_id]
                    if n["id"] != notif_id
                ]

                await websocket.send_text(
                    json.dumps({
                        "event": "notification_deleted",
                        "data": {
                            "notification_id": notif_id
                        }
                    })
                )

    except WebSocketDisconnect:
        print(f"❌ User Disconnected: {user_id}")

        active_connections.pop(user_id, None)


# Send Notification API
@app.post("/send-notification")
async def send_notification(
    user_id: str,
    title: str,
    message: str,
    notif_type: str,
    icon: str = "🔔"
):
    notification = {
        "id": str(uuid4()),
        "title": title,
        "message": message,
        "type": notif_type,
        "icon": icon,
        "read": False,
        "timestamp": datetime.utcnow().isoformat()
    }

    # Create user storage if not exists
    if user_id not in notifications_db:
        notifications_db[user_id] = []

    # Save notification
    notifications_db[user_id].insert(0, notification)

    # Send realtime notification
    websocket = active_connections.get(user_id)

    if websocket:
        await websocket.send_text(
            json.dumps({
                "event": "new_notification",
                "data": notification
            })
        )

    return {
        "success": True,
        "notification": notification
    }