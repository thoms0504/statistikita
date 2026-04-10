from datetime import datetime
from . import db

class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    messages = db.relationship('ChatMessage', backref='session', lazy='dynamic', cascade='all, delete-orphan', order_by='ChatMessage.created_at')

    def to_dict(self):
        first_msg = self.messages.filter_by(role='user').first()
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title or (first_msg.content[:60] + '...' if first_msg and len(first_msg.content) > 60 else (first_msg.content if first_msg else 'Sesi Baru')),
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<ChatSession {self.id}>'


class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id', ondelete='CASCADE'), nullable=False, index=True)
    role = db.Column(db.Enum('user', 'assistant'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'role': self.role,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<ChatMessage {self.id} role={self.role}>'
