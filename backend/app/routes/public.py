from flask import Blueprint, jsonify
from app.models.chat import ChatMessage
from app.models.forum import Post
from app.utils.text_stats import extract_top_words

MAX_STATS_SAMPLE = 1000

public_bp = Blueprint('public', __name__, url_prefix='/api/public')


@public_bp.route('/stats', methods=['GET'])
def public_stats():
    total_forum_questions = Post.query.filter_by(is_hidden=False).count()
    total_chat_questions = ChatMessage.query.filter_by(role='user').count()

    forum_titles = [
        row.judul for row in
        Post.query.filter_by(is_hidden=False)
        .with_entities(Post.judul)
        .order_by(Post.created_at.desc())
        .limit(MAX_STATS_SAMPLE)
        .all()
    ]
    chat_questions = [
        row.content for row in
        ChatMessage.query.filter_by(role='user')
        .with_entities(ChatMessage.content)
        .order_by(ChatMessage.created_at.desc())
        .limit(MAX_STATS_SAMPLE)
        .all()
    ]

    return jsonify({
        'forum': {
            'total_questions': total_forum_questions,
            'top_words': extract_top_words(forum_titles, top_n=10),
        },
        'chat': {
            'total_questions': total_chat_questions,
            'top_words': extract_top_words(chat_questions, top_n=10),
        }
    }), 200
