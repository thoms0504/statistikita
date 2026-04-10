from datetime import datetime
from . import db

class PDFFile(db.Model):
    __tablename__ = 'pdf_files'

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), unique=True, nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)

    uploader = db.relationship('User', backref='uploaded_pdfs', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_name': self.original_name,
            'uploaded_at': self.uploaded_at.isoformat(),
            'uploaded_by': self.uploaded_by,
            'uploader': self.uploader.username if self.uploader else None,
        }
