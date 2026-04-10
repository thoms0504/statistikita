import logging
from app.models import db
from app.models.forum import Notification

logger = logging.getLogger(__name__)

_socketio = None

def set_socketio(socketio_instance):
    global _socketio
    _socketio = socketio_instance


def send_notification(user_id: int, notif_type: str, message: str, ref_id: int = None):
    """Save notification to DB and emit Socket.IO event."""
    try:
        notif = Notification(
            user_id=user_id,
            type=notif_type,
            message=message,
            ref_id=ref_id
        )
        db.session.add(notif)
        db.session.commit()

        # Emit to user's room
        if _socketio:
            _socketio.emit(
                'notification',
                notif.to_dict(),
                room=f'user_{user_id}'
            )

        return notif
    except Exception as e:
        logger.error(f"Error sending notification to user {user_id}: {e}")
        db.session.rollback()
        return None


def emit_event(user_id: int, event: str, payload: dict):
    """Emit Socket.IO event to a specific user room without persisting to DB."""
    try:
        if _socketio:
            _socketio.emit(event, payload, room=f'user_{user_id}')
    except Exception as e:
        logger.error(f"Error emitting event {event} to user {user_id}: {e}")
