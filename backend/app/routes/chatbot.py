from flask import Blueprint, request, jsonify, current_app
from app.models import db
from app.models.chat import ChatSession, ChatMessage
from app.utils.jwt_helper import jwt_required
from app.services import rag_service, gemini_service

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api/chat')


@chatbot_bp.route('/message', methods=['POST'])
@jwt_required
def send_message():
    data = request.get_json() or {}
    user_message = str(data.get('message', '')).strip()
    session_id = data.get('session_id')

    if not user_message:
        return jsonify({'error': 'Pesan tidak boleh kosong'}), 400
    if len(user_message) > current_app.config['MAX_CHAT_MESSAGE_LENGTH']:
        return jsonify({'error': f'Pesan maksimal {current_app.config["MAX_CHAT_MESSAGE_LENGTH"]} karakter'}), 400

    user = request.current_user

    # Get or create session
    if session_id:
        session = ChatSession.query.filter_by(id=session_id, user_id=user.id).first()
        if not session:
            return jsonify({'error': 'Sesi tidak ditemukan'}), 404
    else:
        session = ChatSession(user_id=user.id)
        db.session.add(session)
        db.session.flush()

    # Save user message
    user_msg = ChatMessage(session_id=session.id, role='user', content=user_message)
    db.session.add(user_msg)

    # Get conversation history for context (including current user message)
    history = ChatMessage.query.filter_by(session_id=session.id).order_by(ChatMessage.created_at).limit(20).all()
    messages = [{'role': m.role, 'content': m.content} for m in history]

    # Retrieve RAG context with conversational chain (last few user turns)
    recent_user_msgs = [m['content'] for m in messages if m['role'] == 'user']
    retrieval_query = "\n".join(recent_user_msgs[-3:]) if recent_user_msgs else user_message
    context = rag_service.retrieve_context(retrieval_query)

    # Call Gemini API
    try:
        assistant_response = gemini_service.chat_with_gemini(messages, context)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 503

    # Save assistant message
    assistant_msg = ChatMessage(session_id=session.id, role='assistant', content=assistant_response)
    db.session.add(assistant_msg)
    db.session.commit()

    return jsonify({
        'session_id': session.id,
        'user_message': user_msg.to_dict(),
        'assistant_message': assistant_msg.to_dict(),
    }), 200


@chatbot_bp.route('/sessions', methods=['GET'])
@jwt_required
def get_sessions():
    sessions = ChatSession.query.filter_by(user_id=request.current_user.id)\
        .order_by(ChatSession.created_at.desc()).limit(5).all()
    return jsonify({'sessions': [s.to_dict() for s in sessions]}), 200


@chatbot_bp.route('/sessions/<int:session_id>/messages', methods=['GET'])
@jwt_required
def get_session_messages(session_id):
    session = ChatSession.query.filter_by(id=session_id, user_id=request.current_user.id).first()
    if not session:
        return jsonify({'error': 'Sesi tidak ditemukan'}), 404
    messages = ChatMessage.query.filter_by(session_id=session.id).order_by(ChatMessage.created_at).all()
    return jsonify({'session': session.to_dict(), 'messages': [m.to_dict() for m in messages]}), 200


@chatbot_bp.route('/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required
def delete_session(session_id):
    session = ChatSession.query.filter_by(id=session_id, user_id=request.current_user.id).first()
    if not session:
        return jsonify({'error': 'Sesi tidak ditemukan'}), 404
    db.session.delete(session)
    db.session.commit()
    return jsonify({'message': 'Sesi dihapus'}), 200
