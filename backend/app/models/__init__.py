from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .chat import ChatSession, ChatMessage
from .forum import Tag, Post, Answer, Vote, Report, Notification, post_tags
from .pdf_file import PDFFile

__all__ = [
    'db', 'User', 'ChatSession', 'ChatMessage',
    'Tag', 'Post', 'Answer', 'Vote', 'Report', 'Notification', 'post_tags',
    'PDFFile'
]
