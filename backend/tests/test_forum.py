import pytest


@pytest.fixture
def sample_post(db, regular_user):
    from app.models.forum import Post
    post = Post(user_id=regular_user.id, judul='Test Post', deskripsi='Deskripsi test post ini')
    db.session.add(post)
    db.session.commit()
    return post


def test_get_posts_public(client):
    resp = client.get('/api/forum/posts')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'posts' in data


def test_create_post_requires_auth(client):
    resp = client.post('/api/forum/posts', data={
        'judul': 'Test', 'deskripsi': 'Test desc'
    })
    assert resp.status_code == 401


def test_create_post_success(client, db, user_token):
    resp = client.post('/api/forum/posts',
        data={'judul': 'Pertanyaan Statistik', 'deskripsi': 'Bagaimana cara membaca data BPS?', 'tags': ['statistik']},
        headers={'Authorization': f'Bearer {user_token}'}
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data['post']['judul'] == 'Pertanyaan Statistik'
    assert len(data['post']['tags']) == 1


def test_get_post_detail(client, db, sample_post):
    resp = client.get(f'/api/forum/posts/{sample_post.id}')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['post']['id'] == sample_post.id


def test_add_answer(client, db, user_token, sample_post, admin_user):
    # Answer as admin user (different from post owner)
    from app.utils.jwt_helper import generate_token
    admin_token = generate_token(admin_user.id, admin_user.role)
    resp = client.post(
        f'/api/forum/posts/{sample_post.id}/answers',
        json={'content': 'Ini jawaban saya untuk pertanyaan tersebut.'},
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data['answer']['content'] == 'Ini jawaban saya untuk pertanyaan tersebut.'


def test_vote_post(client, db, user_token, sample_post):
    resp = client.post('/api/forum/vote',
        json={'target_type': 'post', 'target_id': sample_post.id, 'value': 1},
        headers={'Authorization': f'Bearer {user_token}'}
    )
    assert resp.status_code == 201
    assert resp.get_json()['action'] == 'added'

    # Vote again same value removes it
    resp2 = client.post('/api/forum/vote',
        json={'target_type': 'post', 'target_id': sample_post.id, 'value': 1},
        headers={'Authorization': f'Bearer {user_token}'}
    )
    assert resp2.get_json()['action'] == 'removed'


def test_report_post(client, db, user_token, sample_post):
    resp = client.post('/api/forum/report',
        json={'target_type': 'post', 'target_id': sample_post.id, 'isi_laporan': 'Konten tidak pantas'},
        headers={'Authorization': f'Bearer {user_token}'}
    )
    assert resp.status_code == 201


def test_delete_post_owner(client, db, user_token, sample_post):
    resp = client.delete(
        f'/api/forum/posts/{sample_post.id}',
        headers={'Authorization': f'Bearer {user_token}'}
    )
    assert resp.status_code == 200


def test_get_tags(client, db):
    resp = client.get('/api/forum/tags')
    assert resp.status_code == 200
    assert 'tags' in resp.get_json()
