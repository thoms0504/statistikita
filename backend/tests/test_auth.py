import json


def test_register_success(client, db):
    resp = client.post('/api/auth/register', json={
        'nama_lengkap': 'Budi Santoso',
        'username': 'budi_santoso',
        'password': 'password123',
        'jenis_kelamin': 'L'
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert 'access_token' in data
    assert data['user']['username'] == 'budi_santoso'


def test_register_duplicate_username(client, db, regular_user):
    resp = client.post('/api/auth/register', json={
        'nama_lengkap': 'Another User',
        'username': 'user_test',
        'password': 'password123',
    })
    assert resp.status_code == 409


def test_login_success(client, db, regular_user):
    resp = client.post('/api/auth/login', json={
        'username': 'user_test',
        'password': 'userpass123'
    })
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'access_token' in data


def test_login_wrong_password(client, db, regular_user):
    resp = client.post('/api/auth/login', json={
        'username': 'user_test',
        'password': 'wrongpassword'
    })
    assert resp.status_code == 401


def test_get_me(client, db, user_token):
    resp = client.get('/api/auth/me', headers={'Authorization': f'Bearer {user_token}'})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['user']['username'] == 'user_test'


def test_get_me_no_token(client):
    resp = client.get('/api/auth/me')
    assert resp.status_code == 401


def test_jwt_validation_invalid_token(client):
    resp = client.get('/api/auth/me', headers={'Authorization': 'Bearer invalid.token.here'})
    assert resp.status_code == 401
