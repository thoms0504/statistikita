from datetime import datetime
from . import db


class SupportConversation(db.Model):
    __tablename__ = 'support_conversations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    status = db.Column(db.Enum('open', 'closed'), nullable=False, default='open', index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    admin_last_read_at = db.Column(db.DateTime, nullable=True)
    user_last_read_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship('User', backref=db.backref('support_conversations', lazy='dynamic', cascade='all, delete-orphan'))
    messages = db.relationship(
        'SupportMessage',
        backref='conversation',
        lazy='dynamic',
        cascade='all, delete-orphan',
        order_by='SupportMessage.created_at',
    )

    def to_dict(self, *, user=None, last_message=None, unread_for_admin=0, unread_for_user=0):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'last_message_at': self.last_message_at.isoformat() if self.last_message_at else None,
            'admin_last_read_at': self.admin_last_read_at.isoformat() if self.admin_last_read_at else None,
            'user_last_read_at': self.user_last_read_at.isoformat() if self.user_last_read_at else None,
            'user': user,
            'last_message': last_message,
            'unread_for_admin': unread_for_admin,
            'unread_for_user': unread_for_user,
        }

    def __repr__(self):
        return f'<SupportConversation {self.id}>'


class SupportMessage(db.Model):
    __tablename__ = 'support_messages'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('support_conversations.id', ondelete='CASCADE'), nullable=False, index=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    sender_role = db.Column(db.Enum('user', 'admin'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    sender = db.relationship('User', backref=db.backref('support_messages', lazy='dynamic'))

    def to_dict(self, *, include_sender=True):
        payload = {
            'id': self.id,
            'chat_id': self.id,
            'conversation_id': self.conversation_id,
            'sender_id': self.sender_id,
            'user_id': self.sender_id,
            'sender_role': self.sender_role,
            'content': self.content,
            'isi_chat': self.content,
            'created_at': self.created_at.isoformat(),
            'dikirim_pada': self.created_at.isoformat(),
        }
        if include_sender:
            payload['sender'] = {
                'id': self.sender.id if self.sender else self.sender_id,
                'nama_lengkap': self.sender.nama_lengkap if self.sender else None,
                'username': self.sender.username if self.sender else None,
                'role': self.sender.role if self.sender else self.sender_role,
                'avatar_url': self.sender.avatar_url if self.sender else None,
            }
        return payload

    def to_chat_log_dict(self):
        return {
            'chat_id': self.id,
            'user_id': self.sender_id,
            'isi_chat': self.content,
            'dikirim_pada': self.created_at.isoformat(),
            'conversation_id': self.conversation_id,
            'sender_role': self.sender_role,
        }

    def __repr__(self):
        return f'<SupportMessage {self.id} sender_role={self.sender_role}>'
