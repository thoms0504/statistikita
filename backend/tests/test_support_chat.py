def test_user_can_start_support_conversation(client, db, user_token):
    resp = client.post(
        '/api/support/conversation/messages',
        json={'content': 'Halo admin, saya butuh bantuan.'},
        headers={'Authorization': f'Bearer {user_token}'}
    )

    assert resp.status_code == 200
    data = resp.get_json()
    assert data['conversation']['status'] == 'open'
    assert data['conversation']['unread_for_admin'] == 1
    assert data['message']['sender_role'] == 'user'
    assert data['message']['content'] == 'Halo admin, saya butuh bantuan.'


def test_user_can_fetch_latest_support_conversation(client, db, user_token):
    client.post(
        '/api/support/conversation/messages',
        json={'content': 'Tolong cek data saya.'},
        headers={'Authorization': f'Bearer {user_token}'}
    )

    resp = client.get(
        '/api/support/conversation',
        headers={'Authorization': f'Bearer {user_token}'}
    )

    assert resp.status_code == 200
    data = resp.get_json()
    assert data['conversation']['status'] == 'open'
    assert len(data['messages']) == 1
    assert data['messages'][0]['content'] == 'Tolong cek data saya.'


def test_admin_can_reply_support_conversation(client, db, user_token, admin_token):
    start_resp = client.post(
        '/api/support/conversation/messages',
        json={'content': 'Mohon dibantu.'},
        headers={'Authorization': f'Bearer {user_token}'}
    )
    conversation_id = start_resp.get_json()['conversation']['id']

    list_resp = client.get(
        '/api/admin/support/conversations',
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert list_resp.status_code == 200
    assert len(list_resp.get_json()['conversations']) == 1

    reply_resp = client.post(
        f'/api/admin/support/conversations/{conversation_id}/messages',
        json={'content': 'Baik, kami bantu cek sekarang.'},
        headers={'Authorization': f'Bearer {admin_token}'}
    )

    assert reply_resp.status_code == 200
    reply_data = reply_resp.get_json()
    assert reply_data['message']['sender_role'] == 'admin'
    assert reply_data['conversation']['unread_for_user'] == 1


def test_admin_can_close_support_conversation(client, db, user_token, admin_token):
    start_resp = client.post(
        '/api/support/conversation/messages',
        json={'content': 'Saya ingin konsultasi.'},
        headers={'Authorization': f'Bearer {user_token}'}
    )
    conversation_id = start_resp.get_json()['conversation']['id']

    resp = client.patch(
        f'/api/admin/support/conversations/{conversation_id}/status',
        json={'status': 'closed'},
        headers={'Authorization': f'Bearer {admin_token}'}
    )

    assert resp.status_code == 200
    data = resp.get_json()
    assert data['conversation']['status'] == 'closed'


def test_admin_can_read_flat_support_chat_log(client, db, user_token, admin_token):
    client.post(
        '/api/support/conversation/messages',
        json={'content': 'Saya ingin bertanya soal data.'},
        headers={'Authorization': f'Bearer {user_token}'}
    )

    resp = client.get(
        '/api/admin/support/chat-log',
        headers={'Authorization': f'Bearer {admin_token}'}
    )

    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data['messages']) == 1
    message = data['messages'][0]
    assert 'chat_id' in message
    assert 'user_id' in message
    assert message['isi_chat'] == 'Saya ingin bertanya soal data.'
    assert 'dikirim_pada' in message


def test_admin_can_fetch_support_stats(client, db, user_token, admin_token):
    client.post(
        '/api/support/conversation/messages',
        json={'content': 'Halo admin, saya butuh bantuan data.'},
        headers={'Authorization': f'Bearer {user_token}'}
    )

    resp = client.get(
        '/api/admin/support/stats',
        headers={'Authorization': f'Bearer {admin_token}'}
    )

    assert resp.status_code == 200
    data = resp.get_json()
    assert data['total_conversations'] == 1
    assert data['open_conversations'] == 1
    assert data['closed_conversations'] == 0
    assert data['total_messages'] == 1
    assert data['user_messages'] == 1
    assert data['admin_messages'] == 0
    assert data['unread_for_admin'] == 1
    assert data['conversations_per_day'][0]['count'] == 1
    assert data['messages_per_day'][0]['count'] == 1
    assert data['status_distribution'][0] == {'name': 'Aktif', 'count': 1}
    assert len(data['top_words']) > 0


def test_pdf_limit_has_headroom_for_multipart(app):
    assert app.config['MAX_PDF_SIZE'] == 20 * 1024 * 1024
    assert app.config['MAX_CONTENT_LENGTH'] > app.config['MAX_PDF_SIZE']
