from flask import Blueprint, current_app, jsonify, request
from sqlalchemy.orm import joinedload
from app.models import db
from app.models.support import SupportConversation, SupportMessage
from app.models.user import User
from app.services.notification_service import emit_event, emit_room_event
from app.utils.time_helper import jakarta_now
from app.utils.jwt_helper import admin_required, jwt_required

support_bp = Blueprint('support', __name__, url_prefix='/api/support')
admin_support_bp = Blueprint('admin_support', __name__, url_prefix='/api/admin/support')


def _serialize_user(user: User | None):
    if not user:
        return None
    return {
        'id': user.id,
        'nama_lengkap': user.nama_lengkap,
        'username': user.username,
        'role': user.role,
        'avatar_url': user.avatar_url,
        'email': user.email,
    }


def _validate_content(raw_content):
    content = str(raw_content or '').strip()
    if not content:
        return None, 'Pesan tidak boleh kosong'
    if len(content) > current_app.config['MAX_CHAT_MESSAGE_LENGTH']:
        return None, f'Pesan maksimal {current_app.config["MAX_CHAT_MESSAGE_LENGTH"]} karakter'
    return content, None


def _last_message(conversation: SupportConversation):
    return SupportMessage.query.filter_by(conversation_id=conversation.id) \
        .order_by(SupportMessage.created_at.desc(), SupportMessage.id.desc()) \
        .first()


def _count_unread(conversation: SupportConversation, recipient_role: str) -> int:
    since = conversation.admin_last_read_at if recipient_role == 'admin' else conversation.user_last_read_at
    sender_role = 'user' if recipient_role == 'admin' else 'admin'
    threshold = since or conversation.created_at
    return conversation.messages.filter(
        SupportMessage.sender_role == sender_role,
        SupportMessage.created_at > threshold,
    ).count()


def _conversation_payload(conversation: SupportConversation):
    last_message = _last_message(conversation)
    return conversation.to_dict(
        user=_serialize_user(conversation.user),
        last_message=last_message.to_dict(include_sender=True) if last_message else None,
        unread_for_admin=_count_unread(conversation, 'admin'),
        unread_for_user=_count_unread(conversation, 'user'),
    )


def _emit_conversation_update(conversation: SupportConversation, message: SupportMessage | None = None):
    summary = _conversation_payload(conversation)
    emit_event(conversation.user_id, 'support_conversation', summary)
    emit_room_event('admins', 'support_conversation', summary)

    if message:
        payload = {
            'conversation_id': conversation.id,
            'conversation': summary,
            'message': message.to_dict(include_sender=True),
        }
        emit_event(conversation.user_id, 'support_message', payload)
        emit_room_event('admins', 'support_message', payload)


def _latest_conversation_for_user(user_id: int):
    return SupportConversation.query.options(joinedload(SupportConversation.user)) \
        .filter_by(user_id=user_id) \
        .order_by(SupportConversation.last_message_at.desc(), SupportConversation.created_at.desc()) \
        .first()


def _open_conversation_for_user(user_id: int):
    return SupportConversation.query.options(joinedload(SupportConversation.user)) \
        .filter_by(user_id=user_id, status='open') \
        .order_by(SupportConversation.last_message_at.desc(), SupportConversation.created_at.desc()) \
        .first()


@support_bp.route('/conversation', methods=['GET'])
@jwt_required
def get_my_conversation():
    conversation = _latest_conversation_for_user(request.current_user.id)
    if not conversation:
        return jsonify({'conversation': None, 'messages': []}), 200

    messages = SupportMessage.query.filter_by(conversation_id=conversation.id) \
        .order_by(SupportMessage.created_at.asc(), SupportMessage.id.asc()) \
        .all()

    return jsonify({
        'conversation': _conversation_payload(conversation),
        'messages': [message.to_dict(include_sender=True) for message in messages],
    }), 200


@support_bp.route('/conversation/messages', methods=['POST'])
@jwt_required
def send_support_message():
    content, err = _validate_content((request.get_json() or {}).get('content'))
    if err:
        return jsonify({'error': err}), 400

    now = jakarta_now()
    conversation = _open_conversation_for_user(request.current_user.id)
    if not conversation:
        conversation = SupportConversation(
            user_id=request.current_user.id,
            status='open',
            created_at=now,
            updated_at=now,
            last_message_at=now,
            user_last_read_at=now,
            admin_last_read_at=None,
        )
        db.session.add(conversation)
        db.session.flush()

    message = SupportMessage(
        conversation_id=conversation.id,
        sender_id=request.current_user.id,
        sender_role='user',
        content=content,
    )
    db.session.add(message)
    conversation.status = 'open'
    conversation.last_message_at = now
    conversation.updated_at = now
    conversation.user_last_read_at = now
    db.session.commit()

    conversation = SupportConversation.query.options(joinedload(SupportConversation.user)).get(conversation.id)
    _emit_conversation_update(conversation, message)

    return jsonify({
        'conversation': _conversation_payload(conversation),
        'message': message.to_dict(include_sender=True),
    }), 200


@support_bp.route('/conversation/read', methods=['PATCH'])
@jwt_required
def mark_my_conversation_read():
    conversation = _latest_conversation_for_user(request.current_user.id)
    if not conversation:
        return jsonify({'conversation': None}), 200

    conversation.user_last_read_at = jakarta_now()
    db.session.commit()
    _emit_conversation_update(conversation)

    return jsonify({'conversation': _conversation_payload(conversation)}), 200


@admin_support_bp.route('/conversations', methods=['GET'])
@admin_required
def list_support_conversations():
    status = request.args.get('status', '').strip()
    search = request.args.get('search', '').strip()

    query = SupportConversation.query.options(joinedload(SupportConversation.user))

    if status in {'open', 'closed'}:
        query = query.filter(SupportConversation.status == status)

    if search:
        like = f'%{search}%'
        query = query.join(User).filter(
            (User.username.ilike(like)) |
            (User.nama_lengkap.ilike(like)) |
            (User.email.ilike(like))
        )

    conversations = query.order_by(SupportConversation.last_message_at.desc(), SupportConversation.created_at.desc()).all()

    return jsonify({
        'conversations': [_conversation_payload(conversation) for conversation in conversations],
    }), 200


@admin_support_bp.route('/conversations/<int:conversation_id>/messages', methods=['GET'])
@admin_required
def get_support_conversation_messages(conversation_id: int):
    conversation = SupportConversation.query.options(joinedload(SupportConversation.user)).get_or_404(conversation_id)
    messages = SupportMessage.query.filter_by(conversation_id=conversation.id) \
        .order_by(SupportMessage.created_at.asc(), SupportMessage.id.asc()) \
        .all()

    return jsonify({
        'conversation': _conversation_payload(conversation),
        'messages': [message.to_dict(include_sender=True) for message in messages],
    }), 200


@admin_support_bp.route('/conversations/<int:conversation_id>/messages', methods=['POST'])
@admin_required
def reply_support_conversation(conversation_id: int):
    content, err = _validate_content((request.get_json() or {}).get('content'))
    if err:
        return jsonify({'error': err}), 400

    conversation = SupportConversation.query.options(joinedload(SupportConversation.user)).get_or_404(conversation_id)
    now = jakarta_now()

    message = SupportMessage(
        conversation_id=conversation.id,
        sender_id=request.current_user.id,
        sender_role='admin',
        content=content,
    )
    db.session.add(message)
    conversation.status = 'open'
    conversation.last_message_at = now
    conversation.updated_at = now
    conversation.admin_last_read_at = now
    db.session.commit()

    conversation = SupportConversation.query.options(joinedload(SupportConversation.user)).get(conversation.id)
    _emit_conversation_update(conversation, message)

    return jsonify({
        'conversation': _conversation_payload(conversation),
        'message': message.to_dict(include_sender=True),
    }), 200


@admin_support_bp.route('/conversations/<int:conversation_id>/read', methods=['PATCH'])
@admin_required
def mark_support_conversation_read(conversation_id: int):
    conversation = SupportConversation.query.options(joinedload(SupportConversation.user)).get_or_404(conversation_id)
    conversation.admin_last_read_at = jakarta_now()
    db.session.commit()
    _emit_conversation_update(conversation)
    return jsonify({'conversation': _conversation_payload(conversation)}), 200


@admin_support_bp.route('/conversations/<int:conversation_id>/status', methods=['PATCH'])
@admin_required
def update_support_conversation_status(conversation_id: int):
    status = str((request.get_json() or {}).get('status', '')).strip()
    if status not in {'open', 'closed'}:
        return jsonify({'error': 'Status tidak valid'}), 400

    conversation = SupportConversation.query.options(joinedload(SupportConversation.user)).get_or_404(conversation_id)
    conversation.status = status
    conversation.updated_at = jakarta_now()
    if status == 'closed':
        conversation.admin_last_read_at = conversation.updated_at
    db.session.commit()
    _emit_conversation_update(conversation)
    return jsonify({'conversation': _conversation_payload(conversation)}), 200


@admin_support_bp.route('/chat-log', methods=['GET'])
@admin_required
def list_support_chat_log():
    messages = SupportMessage.query.order_by(
        SupportMessage.created_at.desc(),
        SupportMessage.id.desc(),
    ).all()
    return jsonify({
        'messages': [message.to_chat_log_dict() for message in messages],
    }), 200
