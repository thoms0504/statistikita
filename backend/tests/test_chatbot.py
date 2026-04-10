from unittest.mock import patch, MagicMock


def test_send_message_no_auth(client):
    resp = client.post('/api/chat/message', json={'message': 'Halo'})
    assert resp.status_code == 401


@patch('app.services.gemini_service.chat_with_gemini', return_value='Halo! Saya asisten StatistiKita.')
@patch('app.services.rag_service.retrieve_context', return_value='')
def test_send_message_success(mock_rag, mock_gemini, client, db, user_token):
    resp = client.post(
        '/api/chat/message',
        json={'message': 'Apa itu BPS?'},
        headers={'Authorization': f'Bearer {user_token}'}
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'session_id' in data
    assert data['assistant_message']['content'] == 'Halo! Saya asisten StatistiKita.'
    assert data['user_message']['role'] == 'user'


@patch('app.services.gemini_service.chat_with_gemini', return_value='Jawaban lanjutan.')
@patch('app.services.rag_service.retrieve_context', return_value='konteks relevan')
def test_send_message_with_session(mock_rag, mock_gemini, client, db, user_token):
    # First message creates session
    resp1 = client.post(
        '/api/chat/message',
        json={'message': 'Pertanyaan pertama'},
        headers={'Authorization': f'Bearer {user_token}'}
    )
    session_id = resp1.get_json()['session_id']

    # Second message uses same session
    resp2 = client.post(
        '/api/chat/message',
        json={'message': 'Pertanyaan lanjutan', 'session_id': session_id},
        headers={'Authorization': f'Bearer {user_token}'}
    )
    assert resp2.status_code == 200
    assert resp2.get_json()['session_id'] == session_id


def test_get_sessions(client, db, user_token):
    resp = client.get('/api/chat/sessions', headers={'Authorization': f'Bearer {user_token}'})
    assert resp.status_code == 200
    assert 'sessions' in resp.get_json()


@patch('app.services.rag_service.retrieve_context', return_value='')
def test_rag_context_called(mock_rag, client, db, user_token):
    with patch('app.services.gemini_service.chat_with_gemini', return_value='response'):
        client.post(
            '/api/chat/message',
            json={'message': 'Test RAG'},
            headers={'Authorization': f'Bearer {user_token}'}
        )
    mock_rag.assert_called_once_with('Test RAG')
