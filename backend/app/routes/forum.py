import os
from flask import Blueprint, request, jsonify, current_app
import uuid
from werkzeug.utils import secure_filename
from sqlalchemy.orm import joinedload, subqueryload
from app.models import db
from app.models.forum import Post, Answer, Tag, Vote, Report, Notification
from app.utils.jwt_helper import jwt_required, optional_jwt
from app.services.notification_service import send_notification
from app.utils.validation import clean_text, normalize_tags, validate_file
from app.utils.query_helpers import (
    aggregate_answer_counts,
    aggregate_report_counts,
    aggregate_user_votes,
    aggregate_vote_counts,
)

forum_bp = Blueprint('forum', __name__, url_prefix='/api/forum')

ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'}
ALLOWED_MIMES = {
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
}

MAX_PER_PAGE = 50
TITLE_MIN_LEN = 5
TITLE_MAX_LEN = 255
DESC_MIN_LEN = 10
DESC_MAX_LEN = 5000
ANSWER_MIN_LEN = 3
ANSWER_MAX_LEN = 5000
REPORT_MIN_LEN = 5
REPORT_MAX_LEN = 1000

def _save_forum_file(file):
    ext, err = validate_file(
        file,
        allowed_exts=ALLOWED_EXTENSIONS,
        allowed_mimes=ALLOWED_MIMES,
        max_bytes=current_app.config['MAX_FORUM_FILE_SIZE'],
    )
    if err:
        return None, err
    filename = secure_filename(f"{uuid.uuid4().hex}{ext}")
    upload_dir = os.path.join(current_app.config['PDF_UPLOAD_FOLDER'], 'forum')
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)
    return f'/uploads/forum/{filename}', None


@forum_bp.route('/posts', methods=['GET'])
@optional_jwt
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), MAX_PER_PAGE)
    search = request.args.get('search', '').strip()
    tag_name = request.args.get('tag', '').strip().lower()

    query = Post.query.options(joinedload(Post.author), subqueryload(Post.tags)).filter_by(is_hidden=False)

    if search:
        query = query.filter(
            Post.judul.ilike(f'%{search}%') | Post.deskripsi.ilike(f'%{search}%')
        )

    if tag_name:
        tag = Tag.query.filter_by(name=tag_name).first()
        if tag:
            query = query.filter(Post.tags.contains(tag))
        else:
            return jsonify({'posts': [], 'total': 0, 'pages': 0}), 200

    total = query.count()
    posts = query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    user = getattr(request, 'current_user', None)
    post_ids = [p.id for p in posts.items]
    vote_counts = aggregate_vote_counts('post', post_ids)
    answer_counts = aggregate_answer_counts(post_ids)
    report_counts = aggregate_report_counts('post', post_ids)
    user_votes = aggregate_user_votes(user.id, 'post', post_ids) if user else {}

    result = []
    for post in posts.items:
        result.append(post.to_dict(
            user_vote=user_votes.get(post.id),
            vote_count=vote_counts.get(post.id, 0),
            answer_count=answer_counts.get(post.id, 0),
            report_count=report_counts.get(post.id, 0),
        ))

    return jsonify({'posts': result, 'total': total, 'pages': posts.pages, 'current_page': page}), 200


@forum_bp.route('/posts/<int:post_id>', methods=['GET'])
@optional_jwt
def get_post(post_id):
    post = Post.query.options(joinedload(Post.author), subqueryload(Post.tags)).get_or_404(post_id)
    if post.is_hidden:
        user = getattr(request, 'current_user', None)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Post ini disembunyikan'}), 403

    user = getattr(request, 'current_user', None)
    post_user_vote = None
    if user:
        v = Vote.query.filter_by(user_id=user.id, target_type='post', target_id=post.id).first()
        post_user_vote = v.value if v else None

    answers = Answer.query.filter_by(post_id=post_id).order_by(Answer.created_at).all()
    answer_ids = [a.id for a in answers]
    answer_vote_counts = aggregate_vote_counts('answer', answer_ids)
    answer_report_counts = aggregate_report_counts('answer', answer_ids)
    answer_user_votes = aggregate_user_votes(user.id, 'answer', answer_ids) if user else {}
    answer_list = [
        ans.to_dict(
            user_vote=answer_user_votes.get(ans.id),
            vote_count=answer_vote_counts.get(ans.id, 0),
            report_count=answer_report_counts.get(ans.id, 0),
        )
        for ans in answers
    ]

    post_vote_counts = aggregate_vote_counts('post', [post.id])
    post_answer_counts = aggregate_answer_counts([post.id])
    post_report_counts = aggregate_report_counts('post', [post.id])

    return jsonify({
        'post': post.to_dict(
            user_vote=post_user_vote,
            vote_count=post_vote_counts.get(post.id, 0),
            answer_count=post_answer_counts.get(post.id, 0),
            report_count=post_report_counts.get(post.id, 0),
        ),
        'answers': answer_list
    }), 200


@forum_bp.route('/posts', methods=['POST'])
@jwt_required
def create_post():
    user = request.current_user
    judul, err = clean_text(request.form.get('judul'), 'Judul', min_len=TITLE_MIN_LEN, max_len=TITLE_MAX_LEN)
    if err:
        return jsonify({'error': err}), 400
    deskripsi, err = clean_text(request.form.get('deskripsi'), 'Deskripsi', min_len=DESC_MIN_LEN, max_len=DESC_MAX_LEN)
    if err:
        return jsonify({'error': err}), 400
    tag_names, err = normalize_tags(request.form.getlist('tags'))
    if err:
        return jsonify({'error': err}), 400

    file_path = None
    if 'file' in request.files:
        file_path, err = _save_forum_file(request.files['file'])
        if err:
            return jsonify({'error': err}), 400

    post = Post(user_id=user.id, judul=judul, deskripsi=deskripsi, file_path=file_path)

    # Handle tags
    for tag_name in tag_names:
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
        post.tags.append(tag)

    db.session.add(post)
    db.session.commit()
    return jsonify({'post': post.to_dict()}), 201


@forum_bp.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required
def update_post(post_id):
    post = Post.query.get_or_404(post_id)
    user = request.current_user
    if post.user_id != user.id:
        return jsonify({'error': 'Tidak diizinkan'}), 403

    data = request.get_json() or {}
    if data.get('judul') is not None:
        judul, err = clean_text(data.get('judul'), 'Judul', min_len=TITLE_MIN_LEN, max_len=TITLE_MAX_LEN)
        if err:
            return jsonify({'error': err}), 400
        post.judul = judul
    if data.get('deskripsi') is not None:
        deskripsi, err = clean_text(data.get('deskripsi'), 'Deskripsi', min_len=DESC_MIN_LEN, max_len=DESC_MAX_LEN)
        if err:
            return jsonify({'error': err}), 400
        post.deskripsi = deskripsi

    if 'tags' in data:
        tag_names, err = normalize_tags(data.get('tags', []))
        if err:
            return jsonify({'error': err}), 400
        post.tags = []
        for tag_name in tag_names:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            post.tags.append(tag)

    db.session.commit()
    return jsonify({'post': post.to_dict()}), 200


@forum_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    user = request.current_user
    if post.user_id != user.id and user.role != 'admin':
        return jsonify({'error': 'Tidak diizinkan'}), 403
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post dihapus'}), 200


@forum_bp.route('/my-posts', methods=['GET'])
@jwt_required
def my_posts():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), MAX_PER_PAGE)
    user = request.current_user
    posts = Post.query.options(joinedload(Post.author), subqueryload(Post.tags))\
        .filter_by(user_id=user.id).order_by(Post.created_at.desc())\
        .paginate(page=page, per_page=per_page)
    post_ids = [p.id for p in posts.items]
    vote_counts = aggregate_vote_counts('post', post_ids)
    answer_counts = aggregate_answer_counts(post_ids)
    report_counts = aggregate_report_counts('post', post_ids)
    return jsonify({
        'posts': [
            p.to_dict(
                vote_count=vote_counts.get(p.id, 0),
                answer_count=answer_counts.get(p.id, 0),
                report_count=report_counts.get(p.id, 0),
            ) for p in posts.items
        ],
        'total': posts.total,
        'pages': posts.pages
    }), 200


@forum_bp.route('/posts/<int:post_id>/answers', methods=['POST'])
@jwt_required
def add_answer(post_id):
    post = Post.query.get_or_404(post_id)
    if post.is_hidden:
        return jsonify({'error': 'Post ini disembunyikan'}), 403

    data = request.get_json() or {}
    content, err = clean_text(data.get('content'), 'Konten jawaban', min_len=ANSWER_MIN_LEN, max_len=ANSWER_MAX_LEN)
    if err:
        return jsonify({'error': err}), 400

    user = request.current_user
    answer = Answer(post_id=post_id, user_id=user.id, content=content)
    db.session.add(answer)
    db.session.commit()

    # Send notification to post owner
    if post.user_id != user.id:
        send_notification(
            user_id=post.user_id,
            notif_type='new_answer',
            message=f'{user.username} menjawab pertanyaan Anda: "{post.judul[:50]}"',
            ref_id=post_id
        )

    return jsonify({'answer': answer.to_dict()}), 201


@forum_bp.route('/answers/<int:answer_id>', methods=['PUT'])
@jwt_required
def update_answer(answer_id):
    answer = Answer.query.get_or_404(answer_id)
    user = request.current_user
    if answer.user_id != user.id:
        return jsonify({'error': 'Tidak diizinkan'}), 403
    data = request.get_json() or {}
    if data.get('content') is not None:
        content, err = clean_text(data.get('content'), 'Konten jawaban', min_len=ANSWER_MIN_LEN, max_len=ANSWER_MAX_LEN)
        if err:
            return jsonify({'error': err}), 400
        answer.content = content
    db.session.commit()
    return jsonify({'answer': answer.to_dict()}), 200


@forum_bp.route('/answers/<int:answer_id>', methods=['DELETE'])
@jwt_required
def delete_answer(answer_id):
    answer = Answer.query.get_or_404(answer_id)
    user = request.current_user
    if answer.user_id != user.id and user.role != 'admin':
        return jsonify({'error': 'Tidak diizinkan'}), 403
    db.session.delete(answer)
    db.session.commit()
    return jsonify({'message': 'Jawaban dihapus'}), 200


@forum_bp.route('/vote', methods=['POST'])
@jwt_required
def vote():
    data = request.get_json() or {}
    target_type = data.get('target_type')
    target_id = data.get('target_id')
    value = data.get('value')

    try:
        target_id = int(target_id)
    except Exception:
        return jsonify({'error': 'Data vote tidak valid'}), 400

    if target_type not in ('post', 'answer') or value not in (1, -1):
        return jsonify({'error': 'Data vote tidak valid'}), 400

    if target_type == 'post' and not Post.query.get(target_id):
        return jsonify({'error': 'Post tidak ditemukan'}), 404
    if target_type == 'answer' and not Answer.query.get(target_id):
        return jsonify({'error': 'Jawaban tidak ditemukan'}), 404

    user = request.current_user
    existing = Vote.query.filter_by(
        user_id=user.id, target_type=target_type, target_id=target_id
    ).first()

    if existing:
        if existing.value == value:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({'message': 'Vote dihapus', 'action': 'removed'}), 200
        else:
            existing.value = value
            db.session.commit()
            return jsonify({'message': 'Vote diperbarui', 'action': 'updated'}), 200
    else:
        vote_obj = Vote(user_id=user.id, target_type=target_type, target_id=target_id, value=value)
        db.session.add(vote_obj)
        db.session.commit()
        return jsonify({'message': 'Vote ditambahkan', 'action': 'added'}), 201


@forum_bp.route('/report', methods=['POST'])
@jwt_required
def report_content():
    data = request.get_json() or {}
    target_type = data.get('target_type')
    target_id = data.get('target_id')
    try:
        target_id = int(target_id)
    except Exception:
        return jsonify({'error': 'Data laporan tidak valid'}), 400
    isi_laporan, err = clean_text(data.get('isi_laporan'), 'Isi laporan', min_len=REPORT_MIN_LEN, max_len=REPORT_MAX_LEN)
    if err:
        return jsonify({'error': err}), 400
    if target_type not in ('post', 'answer'):
        return jsonify({'error': 'Data laporan tidak valid'}), 400
    if target_type == 'post' and not Post.query.get(target_id):
        return jsonify({'error': 'Post tidak ditemukan'}), 404
    if target_type == 'answer' and not Answer.query.get(target_id):
        return jsonify({'error': 'Jawaban tidak ditemukan'}), 404

    user = request.current_user
    report = Report(
        user_id=user.id,
        target_type=target_type,
        target_id=target_id,
        isi_laporan=isi_laporan
    )
    db.session.add(report)
    db.session.commit()
    return jsonify({'message': 'Laporan berhasil dikirim', 'report': report.to_dict()}), 201


@forum_bp.route('/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.order_by(Tag.name).all()
    return jsonify({'tags': [t.to_dict() for t in tags]}), 200


@forum_bp.route('/notifications', methods=['GET'])
@jwt_required
def get_notifications():
    user = request.current_user
    notifications = Notification.query.filter_by(user_id=user.id)\
        .order_by(Notification.created_at.desc()).limit(50).all()
    unread_count = Notification.query.filter_by(user_id=user.id, is_read=False).count()
    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    }), 200


@forum_bp.route('/notifications/<int:notif_id>/read', methods=['PATCH'])
@jwt_required
def mark_notification_read(notif_id):
    notif = Notification.query.filter_by(id=notif_id, user_id=request.current_user.id).first_or_404()
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notifikasi ditandai dibaca'}), 200
