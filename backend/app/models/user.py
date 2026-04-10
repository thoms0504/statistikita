from datetime import datetime
from . import db
import bcrypt

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    nama_lengkap = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    jenis_kelamin = db.Column(db.Enum('L', 'P'), nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)
    role = db.Column(db.Enum('user', 'admin'), default='user', nullable=False)
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_active = db.Column(db.Boolean, default=True, index=True)

    # Relationships
    chat_sessions = db.relationship('ChatSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    posts = db.relationship('Post', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    answers = db.relationship('Answer', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    votes = db.relationship('Vote', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    reports = db.relationship('Report', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password: str):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password: str) -> bool:
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'nama_lengkap': self.nama_lengkap,
            'username': self.username,
            'email': self.email,
            'jenis_kelamin': self.jenis_kelamin,
            'role': self.role,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active,
        }

    def __repr__(self):
        return f'<User {self.username}>'
