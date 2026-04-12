import os
import secrets
import uuid
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from sqlalchemy import func, or_, case
from sqlalchemy.orm import joinedload, subqueryload
from app.models import db
from app.models.pdf_file import PDFFile
from app.models.chat import ChatMessage, ChatSession
from app.models.forum import Post, Answer, Tag, Report, Vote
from app.models.user import User
from app.utils.jwt_helper import admin_required
from app.services import rag_service
from app.services.notification_service import emit_event
from app.utils.text_stats import extract_top_words
from app.utils.validation import clean_text, validate_email, validate_enum, validate_username, validate_file
from app.utils.query_helpers import (
    aggregate_answer_counts,
    aggregate_report_counts,
    aggregate_vote_counts,
)

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

ALLOWED_PDF_EXTENSIONS = {'.pdf'}
ALLOWED_PDF_MIMES = {'application/pdf', 'application/octet-stream'}
MAX_PER_PAGE = 50
MAX_STATS_SAMPLE = 2000


# ────────── PDF Management ──────────

@admin_bp.route('/pdfs', methods=['GET'])
@admin_required
def list_pdfs():
    pdfs = PDFFile.query.order_by(PDFFile.uploaded_at.desc()).all()
    return jsonify({'pdfs': [p.to_dict() for p in pdfs]}), 200


@admin_bp.route('/pdfs', methods=['POST'])
@admin_required
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'File tidak ditemukan'}), 400

    file = request.files['file']
    ext, err = validate_file(
        file,
        allowed_exts=ALLOWED_PDF_EXTENSIONS,
        allowed_mimes=ALLOWED_PDF_MIMES,
        max_bytes=current_app.config['MAX_PDF_SIZE'],
    )
    if err:
        return jsonify({'error': err}), 400

    original_name = file.filename
    filename = secure_filename(original_name)
    upload_id = request.form.get('upload_id') or f"{int(datetime.utcnow().timestamp())}"

    # Ensure unique filename
    if PDFFile.query.filter_by(filename=filename).first():
        filename = secure_filename(f"{uuid.uuid4().hex}{ext}")

    upload_dir = current_app.config['PDF_UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)

    # Capture values needed inside background thread
    user_id   = request.current_user.id
    app       = current_app._get_current_object()

    def _ingest_in_background():
        """Jalankan di background thread agar request tidak timeout."""
        def progress_cb(percent: int, stage: str):
            emit_event(user_id, 'pdf_progress', {
                'upload_id': upload_id,
                'percent': percent,
                'stage': stage,
                'original_name': original_name,
            })

        with app.app_context():
            try:
                progress_cb(5, "Mempersiapkan proses")
                chunk_count = rag_service.ingest_pdf(filepath, filename, progress_cb=progress_cb)

                # Simpan record ke DB setelah berhasil
                pdf_record = PDFFile(
                    filename=filename,
                    original_name=original_name,
                    uploaded_by=user_id,
                )
                db.session.add(pdf_record)
                db.session.commit()

                # Kirim notifikasi selesai via SocketIO
                emit_event(user_id, 'pdf_progress', {
                    'upload_id': upload_id,
                    'percent': 100,
                    'stage': f'Selesai! {chunk_count} bagian tersimpan di Pinecone',
                    'original_name': original_name,
                    'done': True,
                    'pdf': pdf_record.to_dict(),
                })

            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Background ingest error [{filename}]: {e}")
                # Hapus file jika gagal
                if os.path.exists(filepath):
                    os.remove(filepath)
                # Kirim error ke frontend via SocketIO
                emit_event(user_id, 'pdf_progress', {
                    'upload_id': upload_id,
                    'percent': -1,
                    'stage': f'Gagal: {str(e)}',
                    'original_name': original_name,
                    'done': True,
                    'error': str(e),
                })

    # Jalankan di background (non-blocking) menggunakan eventlet
    try:
        import eventlet
        eventlet.spawn(_ingest_in_background)
    except ImportError:
        # Fallback: threading standar
        import threading
        t = threading.Thread(target=_ingest_in_background, daemon=True)
        t.start()

    # Return 202 Accepted langsung — proses berjalan di background
    return jsonify({
        'message': 'PDF diterima dan sedang diproses di background. Progress akan muncul via notifikasi.',
        'upload_id': upload_id,
        'filename': filename,
        'original_name': original_name,
    }), 202



@admin_bp.route('/pdfs/<int:pdf_id>', methods=['DELETE'])
@admin_required
def delete_pdf(pdf_id):
    pdf = PDFFile.query.get_or_404(pdf_id)
    filename = pdf.filename

    # Remove from ChromaDB
    rag_service.delete_pdf_from_store(filename)

    # Remove file
    filepath = os.path.join(current_app.config['PDF_UPLOAD_FOLDER'], filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    db.session.delete(pdf)
    db.session.commit()
    return jsonify({'message': 'PDF berhasil dihapus'}), 200


# ────────── Chatbot Analytics ──────────

@admin_bp.route('/chatbot/stats', methods=['GET'])
@admin_required
def chatbot_stats():
    total_questions = ChatMessage.query.filter_by(role='user').count()

    # Questions per day (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_data = db.session.query(
        func.date(ChatMessage.created_at).label('date'),
        func.count().label('count')
    ).filter(
        ChatMessage.role == 'user',
        ChatMessage.created_at >= thirty_days_ago
    ).group_by(func.date(ChatMessage.created_at)).order_by('date').all()

    questions_per_day = [{'date': str(row.date), 'count': row.count} for row in daily_data]

    # Top words
    all_questions = [
        m.content for m in ChatMessage.query.filter_by(role='user')
        .order_by(ChatMessage.created_at.desc()).limit(MAX_STATS_SAMPLE).all()
    ]
    top_words = extract_top_words(all_questions)

    return jsonify({
        'total_questions': total_questions,
        'questions_per_day': questions_per_day,
        'top_words': top_words,
    }), 200


@admin_bp.route('/chatbot/questions', methods=['GET'])
@admin_required
def chatbot_questions():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), MAX_PER_PAGE)
    search = request.args.get('search', '').strip()
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')

    query = ChatMessage.query.filter_by(role='user')

    if search:
        query = query.filter(ChatMessage.content.ilike(f'%{search}%'))
    if date_from:
        query = query.filter(ChatMessage.created_at >= date_from)
    if date_to:
        query = query.filter(ChatMessage.created_at <= date_to + ' 23:59:59')

    total = query.count()
    messages = query.order_by(ChatMessage.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'messages': [m.to_dict() for m in messages.items],
        'total': total,
        'pages': messages.pages,
        'current_page': page
    }), 200


@admin_bp.route('/chatbot/questions/<int:msg_id>', methods=['DELETE'])
@admin_required
def delete_chat_message(msg_id):
    msg = ChatMessage.query.get_or_404(msg_id)
    db.session.delete(msg)
    db.session.commit()
    return jsonify({'message': 'Pesan dihapus'}), 200


# ────────── Forum Analytics ──────────

@admin_bp.route('/forum/stats', methods=['GET'])
@admin_required
def forum_stats():
    total_posts = Post.query.count()
    total_answers = Answer.query.count()

    # Posts per day (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_data = db.session.query(
        func.date(Post.created_at).label('date'),
        func.count().label('count')
    ).filter(Post.created_at >= thirty_days_ago)\
     .group_by(func.date(Post.created_at)).order_by('date').all()

    posts_per_day = [{'date': str(row.date), 'count': row.count} for row in daily_data]

    # Tag distribution
    tag_dist = db.session.query(
        Tag.name, func.count(Post.id).label('count')
    ).join(Tag.posts).group_by(Tag.name).order_by(func.count(Post.id).desc()).limit(10).all()
    tag_distribution = [{'name': t.name, 'count': t.count} for t in tag_dist]

    # Top words from post titles
    all_titles = [p.judul for p in Post.query.order_by(Post.created_at.desc()).limit(MAX_STATS_SAMPLE).all()]
    top_words = extract_top_words(all_titles)

    return jsonify({
        'total_posts': total_posts,
        'total_answers': total_answers,
        'posts_per_day': posts_per_day,
        'tag_distribution': tag_distribution,
        'top_words': top_words,
    }), 200


@admin_bp.route('/forum/posts', methods=['GET'])
@admin_required
def admin_forum_posts():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), MAX_PER_PAGE)
    search = request.args.get('search', '').strip()
    sort_by = request.args.get('sort_by', 'created_at')

    query = Post.query.options(joinedload(Post.author), subqueryload(Post.tags))
    if search:
        query = query.filter(Post.judul.ilike(f'%{search}%'))

    if sort_by == 'reports':
        query = query.outerjoin(
            Report, (Report.target_type == 'post') & (Report.target_id == Post.id)
        ).group_by(Post.id).order_by(func.count(Report.id).desc())
    else:
        query = query.order_by(Post.created_at.desc())

    total = query.count()
    posts = query.paginate(page=page, per_page=per_page, error_out=False)
    post_ids = [p.id for p in posts.items]
    post_vote_counts = aggregate_vote_counts('post', post_ids)
    post_report_counts = aggregate_report_counts('post', post_ids)
    post_answer_counts = aggregate_answer_counts(post_ids)
    answer_vote_rows = db.session.query(
        Answer.post_id,
        func.coalesce(func.sum(case((Vote.value == 1, 1), else_=0)), 0).label('upvotes'),
        func.coalesce(func.sum(case((Vote.value == -1, 1), else_=0)), 0).label('downvotes'),
    ).outerjoin(
        Vote, (Vote.target_type == 'answer') & (Vote.target_id == Answer.id)
    ).filter(
        Answer.post_id.in_(post_ids)
    ).group_by(Answer.post_id).all()
    answer_vote_by_post = {row.post_id: {'up': int(row.upvotes), 'down': int(row.downvotes)} for row in answer_vote_rows}

    def build_post_payload(post: Post):
        data = post.to_dict(
            vote_count=post_vote_counts.get(post.id, 0),
            answer_count=post_answer_counts.get(post.id, 0),
            report_count=post_report_counts.get(post.id, 0),
        )

        post_upvotes = Vote.query.filter_by(target_type='post', target_id=post.id, value=1).count()
        post_downvotes = Vote.query.filter_by(target_type='post', target_id=post.id, value=-1).count()

        answer_votes = answer_vote_by_post.get(post.id, {'up': 0, 'down': 0})
        answer_upvotes = answer_votes['up']
        answer_downvotes = answer_votes['down']

        report_items = Report.query.filter_by(
            target_type='post', target_id=post.id
        ).order_by(Report.created_at.desc()).all()

        data.update({
            'post_upvotes': post_upvotes,
            'post_downvotes': post_downvotes,
            'answer_upvotes': answer_upvotes,
            'answer_downvotes': answer_downvotes,
            'report_details': [
                {
                    'id': r.id,
                    'user_id': r.user_id,
                    'isi_laporan': r.isi_laporan,
                    'created_at': r.created_at.isoformat(),
                } for r in report_items
            ],
        })
        return data

    return jsonify({
        'posts': [build_post_payload(p) for p in posts.items],
        'total': total,
        'pages': posts.pages,
        'current_page': page
    }), 200


@admin_bp.route('/forum/posts/<int:post_id>/hide', methods=['PATCH'])
@admin_required
def toggle_hide_post(post_id):
    post = Post.query.get_or_404(post_id)
    post.is_hidden = not post.is_hidden
    db.session.commit()
    action = 'disembunyikan' if post.is_hidden else 'ditampilkan kembali'
    return jsonify({'message': f'Post {action}', 'is_hidden': post.is_hidden}), 200


@admin_bp.route('/forum/posts/<int:post_id>', methods=['DELETE'])
@admin_required
def admin_delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post dihapus'}), 200


# ────────── User Management ──────────

@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), MAX_PER_PAGE)
    search = request.args.get('search', '').strip()

    query = User.query
    if search:
        like = f'%{search}%'
        query = query.filter(or_(
            User.username.ilike(like),
            User.nama_lengkap.ilike(like),
            User.email.ilike(like),
        ))

    query = query.order_by(User.created_at.desc())
    users = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'users': [u.to_dict() for u in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': users.page,
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['PATCH'])
@admin_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    nama_lengkap, err = clean_text(data.get('nama_lengkap'), 'Nama lengkap', min_len=2, max_len=100, allow_empty=True)
    if err:
        return jsonify({'error': err}), 400
    username, err = validate_username(data.get('username')) if data.get('username') else (None, None)
    if err:
        return jsonify({'error': err}), 400
    email, err = validate_email(data.get('email'))
    if err:
        return jsonify({'error': err}), 400
    role, err = validate_enum(data.get('role'), {'user', 'admin'}, 'Role') if data.get('role') else (None, None)
    if err:
        return jsonify({'error': err}), 400
    is_active = data.get('is_active')

    if username and username != user.username:
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username sudah digunakan'}), 409
        user.username = username

    if email is not None and email != user.email:
        if email and User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email sudah digunakan'}), 409
        user.email = email or None

    if nama_lengkap:
        user.nama_lengkap = nama_lengkap

    if role in ('user', 'admin'):
        if user.id == request.current_user.id and role != 'admin':
            return jsonify({'error': 'Tidak bisa mengubah role akun sendiri'}), 400
        user.role = role

    if isinstance(is_active, bool):
        if user.id == request.current_user.id and not is_active:
            return jsonify({'error': 'Tidak bisa menonaktifkan akun sendiri'}), 400
        user.is_active = is_active

    db.session.commit()
    return jsonify({'message': 'Pengguna diperbarui', 'user': user.to_dict()}), 200


@admin_bp.route('/users/<int:user_id>/status', methods=['PATCH'])
@admin_required
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    if user.id == request.current_user.id:
        return jsonify({'error': 'Tidak bisa menonaktifkan akun sendiri'}), 400

    data = request.get_json() or {}
    is_active = data.get('is_active')
    if not isinstance(is_active, bool):
        user.is_active = not user.is_active
    else:
        user.is_active = is_active

    db.session.commit()
    return jsonify({'message': 'Status akun diperbarui', 'is_active': user.is_active}), 200


@admin_bp.route('/users/<int:user_id>/reset-password', methods=['POST'])
@admin_required
def reset_user_password(user_id):
    user = User.query.get_or_404(user_id)
    if user.id == request.current_user.id:
        return jsonify({'error': 'Tidak bisa reset password akun sendiri di sini'}), 400

    temp_password = secrets.token_urlsafe(8)
    user.set_password(temp_password)
    db.session.commit()
    return jsonify({'message': 'Password direset', 'temporary_password': temp_password}), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.id == request.current_user.id:
        return jsonify({'error': 'Tidak bisa menghapus akun sendiri'}), 400
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Pengguna dihapus'}), 200
