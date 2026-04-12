import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 24))

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URI',
        os.environ.get('MYSQL_DATABASE_URI', 'mysql+pymysql://root:@localhost/statistikita_db')
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_size': int(os.environ.get('DB_POOL_SIZE', 10)),
        'max_overflow': int(os.environ.get('DB_MAX_OVERFLOW', 20)),
    }

    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    GEMINI_BASE_URL = os.environ.get('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta')
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-3.1-flash-lite-preview')

    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')

    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

    BASE_DIR = BASE_DIR
    PDF_UPLOAD_FOLDER = os.path.join(BASE_DIR, 'pdfs')
    AVATAR_UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads', 'avatars')
    CHROMA_DB_PATH = os.path.join(BASE_DIR, 'chroma_db')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB
    MAX_AVATAR_SIZE = int(os.environ.get('MAX_AVATAR_SIZE', 2 * 1024 * 1024))  # 2MB
    MAX_FORUM_FILE_SIZE = int(os.environ.get('MAX_FORUM_FILE_SIZE', 10 * 1024 * 1024))  # 10MB
    MAX_PDF_SIZE = int(os.environ.get('MAX_PDF_SIZE', 20 * 1024 * 1024))  # 20MB
    MAX_CHAT_MESSAGE_LENGTH = int(os.environ.get('MAX_CHAT_MESSAGE_LENGTH', 2000))

    SOCKETIO_CORS_ALLOWED_ORIGINS = [
        o.strip()
        for o in os.environ.get('FRONTEND_URL', 'http://localhost:3000').split(',')
        if o.strip()
    ] + ['http://localhost:3000', 'http://127.0.0.1:3000']

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'test-jwt-secret'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
