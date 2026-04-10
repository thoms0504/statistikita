import os
import uuid
from flask import Blueprint, request, jsonify, current_app, redirect
from werkzeug.utils import secure_filename
from app.models import db
from app.models.user import User
from app.utils.jwt_helper import generate_token, jwt_required
from app.utils.validation import (
    clean_text,
    validate_email,
    validate_enum,
    validate_file,
    validate_password,
    validate_username,
)
import requests as http_requests

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

ALLOWED_AVATAR_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}
ALLOWED_AVATAR_MIMES = {'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/pjpeg'}

def _save_avatar_file(file):
    ext, err = validate_file(
        file,
        allowed_exts=ALLOWED_AVATAR_EXTENSIONS,
        allowed_mimes=ALLOWED_AVATAR_MIMES,
        max_bytes=current_app.config['MAX_AVATAR_SIZE'],
    )
    if err:
        return None, err

    filename = secure_filename(f"{uuid.uuid4().hex}{ext}")
    upload_dir = current_app.config['AVATAR_UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)
    return f"/uploads/avatars/{filename}", None

def _delete_local_avatar(avatar_url: str | None):
    if not avatar_url or not avatar_url.startswith('/uploads/avatars/'):
        return
    filename = avatar_url.replace('/uploads/avatars/', '', 1)
    filepath = os.path.join(current_app.config['AVATAR_UPLOAD_FOLDER'], filename)
    if os.path.exists(filepath):
        os.remove(filepath)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or request.form
    nama_lengkap, err = clean_text(data.get('nama_lengkap'), 'nama_lengkap', min_len=2, max_len=100)
    if err:
        return jsonify({'error': err}), 400

    username, err = validate_username(data.get('username'))
    if err:
        return jsonify({'error': err}), 400

    password, err = validate_password(data.get('password'))
    if err:
        return jsonify({'error': err}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username sudah digunakan'}), 409

    email, err = validate_email(data.get('email'))
    if err:
        return jsonify({'error': err}), 400
    if email and User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email sudah digunakan'}), 409

    jenis_kelamin = None
    if 'jenis_kelamin' in data:
        jenis_kelamin, err = validate_enum(data.get('jenis_kelamin'), {'L', 'P'}, 'Jenis kelamin')
        if err:
            return jsonify({'error': err}), 400

    avatar_url = None
    if 'photo' in request.files:
        avatar_url, err = _save_avatar_file(request.files.get('photo'))
        if err:
            return jsonify({'error': err}), 400

    user = User(
        nama_lengkap=nama_lengkap,
        username=username,
        email=email,
        jenis_kelamin=jenis_kelamin,
        avatar_url=avatar_url,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id, user.role)
    return jsonify({'message': 'Registrasi berhasil', 'access_token': token, 'user': user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', ''))

    if not username or not password:
        return jsonify({'error': 'Username dan password wajib diisi'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Username atau password salah'}), 401

    if not user.is_active:
        return jsonify({'error': 'Akun tidak aktif'}), 403

    token = generate_token(user.id, user.role)
    return jsonify({'access_token': token, 'user': user.to_dict()}), 200


@auth_bp.route('/google', methods=['GET'])
def google_login():
    """Redirect to Google OAuth."""
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={current_app.config['GOOGLE_CLIENT_ID']}"
        "&response_type=code"
        f"&redirect_uri={current_app.config['FRONTEND_URL']}/auth/google/callback"
        "&scope=openid%20email%20profile"
    )
    return redirect(google_auth_url)


@auth_bp.route('/google/callback', methods=['POST'])
def google_callback():
    """Exchange Google auth code for user info and return JWT."""
    data = request.get_json()
    code = data.get('code')
    if not code:
        return jsonify({'error': 'Kode otorisasi tidak ditemukan'}), 400

    # Exchange code for tokens
    token_response = http_requests.post(
    'https://oauth2.googleapis.com/token',
    data={
        'code': code,
        'client_id': current_app.config['GOOGLE_CLIENT_ID'],
        'client_secret': current_app.config['GOOGLE_CLIENT_SECRET'],
        # SAMAKAN DENGAN YANG ADA DI google_login
        'redirect_uri': f"{current_app.config['FRONTEND_URL']}/auth/google/callback",
        'grant_type': 'authorization_code',
        }
    )   

    if token_response.status_code != 200:
        try:
            detail = token_response.json()
        except Exception:
            detail = token_response.text
        current_app.logger.error(f"Google token exchange failed: {detail}")
        return jsonify({'error': 'Gagal mendapatkan token dari Google', 'detail': detail}), 400

    tokens = token_response.json()
    access_token = tokens.get('access_token')

    # Get user info from Google
    userinfo_response = http_requests.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        headers={'Authorization': f'Bearer {access_token}'}
    )

    if userinfo_response.status_code != 200:
        return jsonify({'error': 'Gagal mendapatkan informasi pengguna dari Google'}), 400

    userinfo = userinfo_response.json()
    google_id = userinfo.get('id')
    email = userinfo.get('email')
    name = userinfo.get('name', email)
    picture = userinfo.get('picture')

    # Upsert user
    user = User.query.filter_by(google_id=google_id).first()
    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
        else:
            username_base = email.split('@')[0] if email else f'user_{google_id[:8]}'
            username = username_base
            counter = 1
            while User.query.filter_by(username=username).first():
                username = f"{username_base}{counter}"
                counter += 1

            user = User(
                nama_lengkap=name,
                username=username,
                email=email,
                google_id=google_id,
                avatar_url=picture,
            )
            db.session.add(user)
    if picture and (not user.avatar_url or 'googleusercontent.com' in user.avatar_url):
        user.avatar_url = picture

    db.session.commit()

    jwt_token = generate_token(user.id, user.role)
    return jsonify({'access_token': jwt_token, 'user': user.to_dict()}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required
def get_me():
    return jsonify({'user': request.current_user.to_dict()}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required
def update_profile():
    user = request.current_user
    data = request.get_json(silent=True) or request.form

    nama_lengkap, err = clean_text(data.get('nama_lengkap'), 'nama_lengkap', min_len=2, max_len=100, allow_empty=True)
    if err:
        return jsonify({'error': err}), 400
    username, err = validate_username(data.get('username')) if data.get('username') else (None, None)
    if err:
        return jsonify({'error': err}), 400
    email, err = validate_email(data.get('email'))
    if err:
        return jsonify({'error': err}), 400
    jenis_kelamin, err = validate_enum(data.get('jenis_kelamin'), {'L', 'P'}, 'Jenis kelamin')
    if err:
        return jsonify({'error': err}), 400

    if username and username != user.username:
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username sudah digunakan'}), 409
        user.username = username

    if email != user.email:
        if email and User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email sudah digunakan'}), 409
        user.email = email or None

    if nama_lengkap:
        user.nama_lengkap = nama_lengkap

    if 'jenis_kelamin' in data:
        user.jenis_kelamin = jenis_kelamin

    if 'photo' in request.files:
        avatar_url, err = _save_avatar_file(request.files.get('photo'))
        if err:
            return jsonify({'error': err}), 400
        _delete_local_avatar(user.avatar_url)
        user.avatar_url = avatar_url

    db.session.commit()
    return jsonify({'message': 'Profil diperbarui', 'user': user.to_dict()}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required
def logout():
    # JWT is stateless; client should discard the token
    return jsonify({'message': 'Logout berhasil'}), 200
