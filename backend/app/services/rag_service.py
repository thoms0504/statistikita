import os
import logging

logger = logging.getLogger(__name__)

_pinecone_client = None
_index = None

PINECONE_INDEX_NAME = os.environ.get("PINECONE_INDEX_NAME", "statistikita")
EMBEDDING_MODEL = "multilingual-e5-large"


def _get_client():
    global _pinecone_client
    if _pinecone_client is None:
        from pinecone import Pinecone
        _pinecone_client = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
    return _pinecone_client


def _get_index():
    global _index
    if _index is None:
        pc = _get_client()
        _index = pc.Index(PINECONE_INDEX_NAME)
    return _index


def _embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed teks menggunakan Pinecone Inference API."""
    pc = _get_client()
    result = pc.inference.embed(
        model=EMBEDDING_MODEL,
        inputs=texts,
        parameters={"input_type": "passage", "truncate": "END"}
    )
    return [item["values"] for item in result]


def _embed_query(query: str) -> list[float]:
    """Embed query untuk search."""
    pc = _get_client()
    result = pc.inference.embed(
        model=EMBEDDING_MODEL,
        inputs=[query],
        parameters={"input_type": "query", "truncate": "END"}
    )
    return result[0]["values"]


def ingest_pdf(filepath: str, filename: str, progress_cb=None) -> int:
    """Load PDF, split, embed via Pinecone Inference, store ke Pinecone."""
    try:
        from langchain_community.document_loaders import PyPDFLoader
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        batch_size = 32

        def report(percent: int, stage: str):
            if progress_cb:
                try:
                    progress_cb(int(percent), stage)
                except Exception:
                    pass

        report(5, "Membaca PDF")
        loader = PyPDFLoader(filepath)
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        chunks = splitter.split_documents(documents)

        if not chunks:
            logger.warning(f"No chunks extracted from {filename}")
            report(100, "Selesai")
            return 0

        report(20, f"Membagi dokumen ({len(chunks)} bagian)")

        index = _get_index()

        texts = [chunk.page_content for chunk in chunks]
        metadatas = [
            {
                "source": filename,
                "page": chunk.metadata.get("page", 0),
                "text": chunk.page_content
            }
            for chunk in chunks
        ]
        ids = [f"{filename}_chunk_{i}" for i in range(len(chunks))]

        total = len(chunks)
        done = 0

        for i in range(0, total, batch_size):
            batch_texts = texts[i:i + batch_size]
            batch_metas = metadatas[i:i + batch_size]
            batch_ids = ids[i:i + batch_size]

            # Embed via Pinecone Inference API
            embeds = _embed_texts(batch_texts)

            vectors = [
                {"id": bid, "values": emb, "metadata": meta}
                for bid, emb, meta in zip(batch_ids, embeds, batch_metas)
            ]
            index.upsert(vectors=vectors)

            done += len(batch_texts)
            percent = 20 + int(70 * done / total)
            report(percent, f"Memproses embedding {done}/{total}")

        report(95, "Menyimpan indeks")
        report(100, "Selesai")

        logger.info(f"Ingested {len(chunks)} chunks from {filename}")
        return len(chunks)

    except Exception as e:
        logger.error(f"Error ingesting PDF {filename}: {e}")
        raise


def retrieve_context(query: str, k: int = 5) -> str:
    """Semantic search dari Pinecone, returns concatenated context."""
    try:
        index = _get_index()

        query_embedding = _embed_query(query)

        results = index.query(
            vector=query_embedding,
            top_k=k,
            include_metadata=True
        )

        if not results.matches:
            return ""

        context_parts = []
        for match in results.matches:
            meta = match.metadata
            source = meta.get('source', 'unknown')
            page = meta.get('page', 0)
            text = meta.get('text', '')
            context_parts.append(f"[Sumber: {source}, Halaman: {page+1}]\n{text}")

        return "\n\n---\n\n".join(context_parts)

    except Exception as e:
        logger.error(f"Error retrieving context: {e}")
        return ""


def delete_pdf_from_store(filename: str) -> bool:
    """Hapus semua chunks PDF dari Pinecone berdasarkan filename."""
    try:
        index = _get_index()

        # Fetch semua ID dengan filter metadata source
        query_embed = _embed_query(filename)
        results = index.query(
            vector=query_embed,
            top_k=10000,
            include_metadata=True,
            filter={"source": {"$eq": filename}}
        )

        ids_to_delete = [match.id for match in results.matches]
        if ids_to_delete:
            index.delete(ids=ids_to_delete)
            logger.info(f"Deleted {len(ids_to_delete)} chunks for {filename}")

        return True

    except Exception as e:
        logger.error(f"Error deleting PDF {filename} from store: {e}")
        return False