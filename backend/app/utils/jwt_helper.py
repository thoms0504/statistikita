import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from app.models.user import User


def generate_token(user_id: int, role: str) -> str:
    """Generate a JWT token for a user."""
    payload = {
        'user_id': user_id,
        'role': role,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=current_app.config['JWT_EXPIRATION_HOURS'])
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    return jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])


def get_token_from_request() -> str | None:
    """Extract token from Authorization header."""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ', 1)[1]
    return None


def jwt_required(f):
    """Decorator to require a valid JWT token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return jsonify({'error': 'Token tidak ditemukan'}), 401
        try:
            payload = decode_token(token)
            user = User.query.get(payload['user_id'])
            if not user or not user.is_active:
                return jsonify({'error': 'User tidak ditemukan atau tidak aktif'}), 401
            request.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token sudah kedaluwarsa'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token tidak valid'}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Decorator to require admin role."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return jsonify({'error': 'Token tidak ditemukan'}), 401
        try:
            payload = decode_token(token)
            user = User.query.get(payload['user_id'])
            if not user or not user.is_active:
                return jsonify({'error': 'User tidak ditemukan atau tidak aktif'}), 401
            if user.role != 'admin':
                return jsonify({'error': 'Akses ditolak. Hanya admin yang diizinkan.'}), 403
            request.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token sudah kedaluwarsa'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token tidak valid'}), 401
        return f(*args, **kwargs)
    return decorated


def optional_jwt(f):
    """Decorator to optionally parse JWT (user can be None)."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        request.current_user = None
        if token:
            try:
                payload = decode_token(token)
                user = User.query.get(payload['user_id'])
                if user and user.is_active:
                    request.current_user = user
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                pass
        return f(*args, **kwargs)
    return decorated
