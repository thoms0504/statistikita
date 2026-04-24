import pytest
from app import create_app
from app.models import db as _db


@pytest.fixture(scope='session')
def app():
    app = create_app('testing')
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    return app.test_client()


@pytest.fixture(scope='function')
def db(app):
    with app.app_context():
        yield _db
        _db.session.remove()
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()


@pytest.fixture
def admin_user(db):
    from app.models.user import User
    user = User(nama_lengkap='Admin Test', username='admin_test', email='admin@test.com', role='admin')
    user.set_password('adminpass123')
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def regular_user(db):
    from app.models.user import User
    user = User(nama_lengkap='User Test', username='user_test', email='user@test.com', role='user')
    user.set_password('userpass123')
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def user_token(app, regular_user):
    from app.utils.jwt_helper import generate_token
    with app.app_context():
        return generate_token(regular_user.id, regular_user.role)


@pytest.fixture
def admin_token(app, admin_user):
    from app.utils.jwt_helper import generate_token
    with app.app_context():
        return generate_token(admin_user.id, admin_user.role)
