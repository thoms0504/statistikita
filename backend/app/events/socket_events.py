import logging
from app.utils.jwt_helper import decode_token
from app.models.user import User

logger = logging.getLogger(__name__)


def register_socket_events(socketio):
    """Register all Socket.IO events."""

    @socketio.on('connect')
    def on_connect(auth):
        logger.info("Client connected")

    @socketio.on('disconnect')
    def on_disconnect():
        logger.info("Client disconnected")

    @socketio.on('join')
    def on_join(data):
        """Client joins their personal room after authenticating."""
        from flask_socketio import join_room
        token = data.get('token', '')
        try:
            payload = decode_token(token)
            user_id = payload.get('user_id')
            user = User.query.get(user_id)
            if user and user.is_active:
                room = f'user_{user_id}'
                join_room(room)
                logger.info(f"User {user_id} joined room {room}")
        except Exception as e:
            logger.warning(f"Invalid token on join: {e}")

    @socketio.on('leave')
    def on_leave(data):
        """Client leaves their personal room."""
        from flask_socketio import leave_room
        token = data.get('token', '')
        try:
            payload = decode_token(token)
            user_id = payload.get('user_id')
            room = f'user_{user_id}'
            leave_room(room)
        except Exception:
            pass
