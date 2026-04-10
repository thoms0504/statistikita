from datetime import datetime
from sqlalchemy import Index
from . import db

# Many-to-many join table
post_tags = db.Table('post_tags',
    db.Column('post_id', db.Integer, db.ForeignKey('posts.id', ondelete='CASCADE'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

class Tag(db.Model):
    __tablename__ = 'tags'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    def to_dict(self):
        return {'id': self.id, 'name': self.name}


class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    judul = db.Column(db.String(255), nullable=False)
    deskripsi = db.Column(db.Text, nullable=False)
    file_path = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_hidden = db.Column(db.Boolean, default=False, index=True)

    tags = db.relationship('Tag', secondary=post_tags, lazy='subquery', backref=db.backref('posts', lazy=True))
    answers = db.relationship('Answer', backref='post', lazy='dynamic', cascade='all, delete-orphan')

    @property
    def vote_count(self):
        from sqlalchemy import func
        result = db.session.query(func.sum(Vote.value)).filter(
            Vote.target_type == 'post', Vote.target_id == self.id
        ).scalar()
        return result or 0

    @property
    def answer_count(self):
        return self.answers.count()

    @property
    def report_count(self):
        return Report.query.filter_by(target_type='post', target_id=self.id).count()

    def to_dict(self, include_author=True, user_vote=None, vote_count=None, answer_count=None, report_count=None):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'judul': self.judul,
            'deskripsi': self.deskripsi,
            'file_path': self.file_path,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_hidden': self.is_hidden,
            'tags': [t.to_dict() for t in self.tags],
            'vote_count': self.vote_count if vote_count is None else vote_count,
            'answer_count': self.answer_count if answer_count is None else answer_count,
            'report_count': self.report_count if report_count is None else report_count,
            'user_vote': user_vote,
        }
        if include_author and self.author:
            data['author'] = {
                'id': self.author.id,
                'username': self.author.username,
                'nama_lengkap': self.author.nama_lengkap,
                'role': self.author.role,
                'avatar_url': self.author.avatar_url,
            }
        return data


class Answer(db.Model):
    __tablename__ = 'answers'

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def vote_count(self):
        from sqlalchemy import func
        result = db.session.query(func.sum(Vote.value)).filter(
            Vote.target_type == 'answer', Vote.target_id == self.id
        ).scalar()
        return result or 0

    @property
    def report_count(self):
        return Report.query.filter_by(target_type='answer', target_id=self.id).count()

    def to_dict(self, user_vote=None, vote_count=None, report_count=None):
        data = {
            'id': self.id,
            'post_id': self.post_id,
            'user_id': self.user_id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'vote_count': self.vote_count if vote_count is None else vote_count,
            'report_count': self.report_count if report_count is None else report_count,
            'user_vote': user_vote,
        }
        if self.author:
            data['author'] = {
                'id': self.author.id,
                'username': self.author.username,
                'nama_lengkap': self.author.nama_lengkap,
                'role': self.author.role,
                'avatar_url': self.author.avatar_url,
            }
        return data


class Vote(db.Model):
    __tablename__ = 'votes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    target_type = db.Column(db.Enum('post', 'answer'), nullable=False, index=True)
    target_id = db.Column(db.Integer, nullable=False, index=True)
    value = db.Column(db.Integer, nullable=False)  # +1 or -1

    __table_args__ = (
        db.UniqueConstraint('user_id', 'target_type', 'target_id', name='uq_user_vote'),
        Index('ix_votes_target', 'target_type', 'target_id'),
    )


class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    target_type = db.Column(db.Enum('post', 'answer'), nullable=False, index=True)
    target_id = db.Column(db.Integer, nullable=False, index=True)
    isi_laporan = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'isi_laporan': self.isi_laporan,
            'created_at': self.created_at.isoformat(),
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    ref_id = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat(),
            'ref_id': self.ref_id,
        }
