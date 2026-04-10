import os
import logging
from flask import current_app

logger = logging.getLogger(__name__)

_chroma_client = None
_collection = None
_embeddings = None

COLLECTION_NAME = "statistikita_docs"


def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        from langchain_huggingface import HuggingFaceEmbeddings
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )
    return _embeddings


def _get_collection():
    global _chroma_client, _collection
    if _collection is None:
        import chromadb
        chroma_path = current_app.config['CHROMA_DB_PATH']
        os.makedirs(chroma_path, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(path=chroma_path)
        _collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )
    return _collection


def ingest_pdf(filepath: str, filename: str, progress_cb=None) -> int:
    """Load PDF, split into chunks, embed, and store in ChromaDB. Returns chunk count."""
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

        embeddings = _get_embeddings()
        collection = _get_collection()

        texts = [chunk.page_content for chunk in chunks]
        metadatas = [{"source": filename, "page": chunk.metadata.get("page", 0)} for chunk in chunks]
        ids = [f"{filename}_chunk_{i}" for i in range(len(chunks))]

        total = len(chunks)
        done = 0
        for i in range(0, total, batch_size):
            batch_texts = texts[i:i + batch_size]
            batch_metas = metadatas[i:i + batch_size]
            batch_ids = ids[i:i + batch_size]

            # Embed batch
            embeds = embeddings.embed_documents(batch_texts)

            collection.upsert(
                ids=batch_ids,
                embeddings=embeds,
                documents=batch_texts,
                metadatas=batch_metas
            )

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
    """Semantic search from ChromaDB, returns concatenated context."""
    try:
        embeddings = _get_embeddings()
        collection = _get_collection()

        if collection.count() == 0:
            return ""

        query_embedding = embeddings.embed_query(query)

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(k, collection.count()),
            include=["documents", "metadatas"]
        )

        if not results['documents'] or not results['documents'][0]:
            return ""

        context_parts = []
        for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
            source = meta.get('source', 'unknown')
            page = meta.get('page', 0)
            context_parts.append(f"[Sumber: {source}, Halaman: {page+1}]\n{doc}")

        return "\n\n---\n\n".join(context_parts)

    except Exception as e:
        logger.error(f"Error retrieving context: {e}")
        return ""


def delete_pdf_from_store(filename: str) -> bool:
    """Delete all chunks of a PDF from ChromaDB."""
    try:
        collection = _get_collection()
        results = collection.get(where={"source": filename})
        if results['ids']:
            collection.delete(ids=results['ids'])
            logger.info(f"Deleted {len(results['ids'])} chunks for {filename}")
        return True
    except Exception as e:
        logger.error(f"Error deleting PDF {filename} from store: {e}")
        return False
