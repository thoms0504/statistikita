import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_socketio import SocketIO
from app.config import config
from app.models import db

migrate = Migrate()
socketio = SocketIO()


def create_app(config_name: str = None) -> Flask:
    """Application factory."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config['default']))

    # Ensure upload directories exist
    os.makedirs(app.config['PDF_UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['CHROMA_DB_PATH'], exist_ok=True)
    os.makedirs(app.config['AVATAR_UPLOAD_FOLDER'], exist_ok=True)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Build list of allowed CORS origins from FRONTEND_URL (supports comma-separated)
    raw_origins = app.config.get('FRONTEND_URL', 'http://localhost:3000')
    allowed_origins = [o.strip() for o in raw_origins.split(',') if o.strip()]
    # Always also allow localhost for local dev
    for local in ['http://localhost:3000', 'http://127.0.0.1:3000']:
        if local not in allowed_origins:
            allowed_origins.append(local)

    CORS(app,
         resources={r"/api/*": {"origins": allowed_origins},
                    r"/uploads/*": {"origins": allowed_origins}},
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])

    socketio.init_app(
        app,
        cors_allowed_origins=app.config['SOCKETIO_CORS_ALLOWED_ORIGINS'],
        async_mode='eventlet',
        logger=False,
        engineio_logger=False
    )

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.chatbot import chatbot_bp
    from app.routes.forum import forum_bp
    from app.routes.admin import admin_bp
    from app.routes.public import public_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(chatbot_bp)
    app.register_blueprint(forum_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(public_bp)

    # Register socket events
    from app.events.socket_events import register_socket_events
    register_socket_events(socketio)

    # Wire socketio into notification service
    from app.services.notification_service import set_socketio
    set_socketio(socketio)

    # Serve uploaded files
    from flask import send_from_directory
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['PDF_UPLOAD_FOLDER'], filename)

    @app.route('/uploads/avatars/<path:filename>')
    def uploaded_avatar(filename):
        return send_from_directory(app.config['AVATAR_UPLOAD_FOLDER'], filename)

    @app.route('/health')
    def health():
        return {'status': 'ok', 'app': 'StatistiKita'}, 200

    return app
