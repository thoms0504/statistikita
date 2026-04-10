import logging
from typing import List, Dict

import requests
from flask import current_app

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Anda adalah asisten virtual StatistiKita, layanan statistik terpadu BPS Provinsi Lampung.
Tugas Anda adalah membantu masyarakat dan pengguna mendapatkan informasi statistik yang akurat.

Panduan:
1. Jawab dalam Bahasa Indonesia yang ramah dan profesional.
2. Gunakan konteks dokumen yang diberikan untuk menjawab pertanyaan dengan akurat.
3. Jika informasi tidak tersedia dalam konteks, sampaikan dengan jujur bahwa informasi tersebut belum tersedia.
4. Berikan sumber informasi jika relevan.
5. Untuk pertanyaan umum tentang statistik, berikan penjelasan yang mudah dipahami.
"""


def _to_gemini_contents(messages: List[Dict[str, str]]) -> List[Dict[str, object]]:
    contents = []
    for msg in messages:
        role = msg.get("role")
        text = msg.get("content", "")
        if not text:
            continue
        if role == "assistant":
            role = "model"
        elif role != "user":
            continue
        contents.append({"role": role, "parts": [{"text": text}]})
    return contents


def chat_with_gemini(messages: list, context: str = "") -> str:
    """
    Call Gemini API with system prompt, RAG context, and conversation history.
    messages: list of {'role': 'user'|'assistant', 'content': '...'}
    """
    try:
        api_key = current_app.config["GEMINI_API_KEY"]
        base_url = current_app.config["GEMINI_BASE_URL"].rstrip("/")
        model = current_app.config["GEMINI_MODEL"]

        if not api_key:
            raise RuntimeError("GEMINI_API_KEY belum diisi di .env")

        system_content = SYSTEM_PROMPT
        if context:
            system_content += f"\n\nKonteks dokumen yang relevan:\n{context}"

        payload = {
            "systemInstruction": {"parts": [{"text": system_content}]},
            "contents": _to_gemini_contents(messages),
            "generationConfig": {
                "maxOutputTokens": 1024,
                "temperature": 0.7,
            },
        }

        url = f"{base_url}/models/{model}:generateContent"
        resp = requests.post(url, params={"key": api_key}, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()

        candidates = data.get("candidates", [])
        if not candidates:
            raise RuntimeError("Tidak ada respons dari Gemini")

        parts = candidates[0].get("content", {}).get("parts", [])
        text = "".join(p.get("text", "") for p in parts).strip()
        if not text:
            raise RuntimeError("Respons Gemini kosong")
        return text

    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        raise RuntimeError(f"Gagal menghubungi layanan AI: {str(e)}")
