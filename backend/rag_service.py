import os
import math
import pypdf
import docx
import requests
import json
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Configure GenAI Key
genai_key = os.getenv("GEMINI_API_KEY")

# Connect to MongoDB
mongo_uri = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/smartcity_db")
client = MongoClient(mongo_uri)
db = client.get_database()

def extract_text_from_pdf(file_path):
    """Extracts text from a PDF file with page metadata."""
    pages_text = []
    try:
        reader = pypdf.PdfReader(file_path)
        for idx, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages_text.append({
                    "text": text,
                    "page_num": idx + 1
                })
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
    return pages_text

def extract_text_from_docx(file_path):
    """Extracts text from a DOCX file with paragraph metadata."""
    paragraphs_text = []
    try:
        doc = docx.Document(file_path)
        for idx, para in enumerate(doc.paragraphs):
            text = para.text.strip()
            if text:
                paragraphs_text.append({
                    "text": text,
                    "para_num": idx + 1
                })
    except Exception as e:
        print(f"Error reading DOCX {file_path}: {e}")
    return paragraphs_text

def extract_text_from_txt(file_path):
    """Extracts text from plain text or CSV files."""
    lines_text = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            for idx, line in enumerate(f):
                text = line.strip()
                if text:
                    lines_text.append({
                        "text": text,
                        "line_num": idx + 1
                    })
    except Exception as e:
        print(f"Error reading text file {file_path}: {e}")
    return lines_text

def chunk_extracted_content(extracted_content, file_type, chunk_size=800, chunk_overlap=120):
    """Splits text content into semantic chunks with overlaps, preserving source location metadata."""
    chunks = []
    
    for item in extracted_content:
        text = item["text"]
        meta_key = "page" if file_type == "pdf" else ("paragraph" if file_type == "docx" else "line")
        meta_val = item["page_num"] if file_type == "pdf" else (item["para_num"] if file_type == "docx" else item["line_num"])
        
        # Simple character-based splitting with overlap
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]
            
            chunks.append({
                "text": chunk_text,
                "metadata": {
                    meta_key: meta_val
                }
            })
            
            # If we reached the end, break
            if end >= len(text):
                break
                
            # Move start back by overlap
            start = end - chunk_overlap
            # Prevent infinite loops if progress is not made
            if start <= 0 or start >= end:
                start = end
                
    return chunks

def generate_embedding(text):
    """Calls Gemini REST API to get embeddings for a text block."""
    if not genai_key:
        print("GEMINI_API_KEY not set")
        return [0.0] * 768
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={genai_key}"
        payload = {
            "content": {
                "parts": [{"text": text}]
            }
        }
        res = requests.post(url, json=payload, timeout=15)
        if res.status_code == 200:
            return res.json()["embedding"]["values"]
        else:
            print(f"Embedding API error: {res.text}")
            return [0.0] * 768
    except Exception as e:
        print(f"Embedding generation exception: {e}")
        return [0.0] * 768

def generate_query_embedding(query_text):
    """Calls Gemini REST API to get embeddings for a search query."""
    return generate_embedding(query_text)

def cosine_similarity(v1, v2):
    """Computes cosine similarity between two vector lists."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def ingest_document(doc_id, filename, file_path):
    """Parses a document, splits it into chunks, embeds them, and saves them to MongoDB."""
    ext = filename.split(".")[-1].lower()
    
    # Extract text content
    if ext == "pdf":
        extracted = extract_text_from_pdf(file_path)
        file_type = "pdf"
    elif ext in ["docx", "doc"]:
        extracted = extract_text_from_docx(file_path)
        file_type = "docx"
    else:
        extracted = extract_text_from_txt(file_path)
        file_type = "txt"
        
    if not extracted:
        return 0
        
    # Chunk text
    chunks = chunk_extracted_content(extracted, file_type)
    
    # Embed chunks and write to DB
    chunk_docs = []
    for idx, c in enumerate(chunks):
        embedding = generate_embedding(c["text"])
        
        chunk_doc = {
            "document_id": doc_id,
            "filename": filename,
            "chunk_index": idx,
            "text": c["text"],
            "metadata": c["metadata"],
            "embedding": embedding
        }
        chunk_docs.append(chunk_doc)
        
    if chunk_docs:
        db.chunks.insert_many(chunk_docs)
        
    return len(chunk_docs)
def _build_fallback_answer(query, valid_chunks):
    """Builds a readable answer from retrieved chunks when LLM synthesis is unavailable."""
    lines = [
        f"Based on official municipal documents, here is the relevant information about your question:\n",
        f"**Query:** {query}\n",
    ]
    for i, c in enumerate(valid_chunks[:3]):  # Show top 3 most relevant chunks
        meta_str = ""
        if "page" in c["metadata"]:
            meta_str = f"Page {c['metadata']['page']}"
        elif "paragraph" in c["metadata"]:
            meta_str = f"Paragraph {c['metadata']['paragraph']}"
        elif "line" in c["metadata"]:
            meta_str = f"Line {c['metadata']['line']}"
        lines.append(f"**From [{c['filename']}] ({meta_str}):**")
        lines.append(f"{c['text'].strip()}\n")
    lines.append("_Note: This response was assembled directly from official documents. Please consult the cited source documents for full details._")
    return "\n".join(lines)

def query_rag_pipeline(query, top_k=5):
    """Executes semantic search and LLM synthesis to answer a question."""
    # 1. Get query embedding
    query_emb = generate_query_embedding(query)
    
    # 2. Fetch chunks from DB
    chunks_cursor = db.chunks.find({}, {"embedding": 1, "text": 1, "filename": 1, "metadata": 1})
    all_chunks = list(chunks_cursor)
    
    if not all_chunks:
        return {
            "answer": "No city documents have been uploaded to the system yet. Please contact the administrator to upload documents.",
            "citations": [],
            "confidence": 0
        }
        
    # 3. Calculate similarity score for each chunk
    scored_chunks = []
    for c in all_chunks:
        score = cosine_similarity(query_emb, c["embedding"])
        scored_chunks.append({
            "filename": c["filename"],
            "text": c["text"],
            "metadata": c["metadata"],
            "score": score
        })
        
    # 4. Sort and pick top K
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    top_chunks = scored_chunks[:top_k]
    
    # Filter out chunks with very low similarity (e.g. < 0.25)
    valid_chunks = [tc for tc in top_chunks if tc["score"] > 0.2]
    
    if not valid_chunks:
        return {
            "answer": "I cannot find any relevant information in the uploaded official documents to answer your question.",
            "citations": [],
            "confidence": 0
        }
        
    # Calculate confidence based on top match score
    best_score = valid_chunks[0]["score"]
    confidence_percentage = int(min(max(best_score * 100, 10), 99))
    
    # 5. Compile context
    context_str = ""
    for idx, c in enumerate(valid_chunks):
        meta_str = ""
        if "page" in c["metadata"]:
            meta_str = f"Page {c['metadata']['page']}"
        elif "paragraph" in c["metadata"]:
            meta_str = f"Paragraph {c['metadata']['paragraph']}"
        elif "line" in c["metadata"]:
            meta_str = f"Line {c['metadata']['line']}"
            
        context_str += f"Source: {c['filename']} ({meta_str})\nContent: {c['text']}\n\n"
        
    # 6. Call LLM for completion
    prompt = f"""
You are the official Smart City AI Knowledge Assistant. You answer citizen queries about city regulations, civic services, waste management, transportation, and public utilities.

Use the provided source context from official municipal documents to answer the question. 
Follow these rules strictly:
1. Base your answer ONLY on the provided Context. Do not invent details or pull facts from outside this context.
2. If the context does not contain the answer, state: "I cannot find the answer in the uploaded official documents."
3. Cite your sources directly in your response by mentioning the file name and page/paragraph numbers where appropriate (e.g. "[Waste_Management_Policy.pdf, Page 12]").
4. Keep your answer professional, clear, and structured.

Context:
{context_str}

User Question: {query}
"""
    try:
        if not genai_key:
            answer = "Error: GEMINI_API_KEY environment variable not set."
        else:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={genai_key}"
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
            res = requests.post(url, json=payload, timeout=30)
            if res.status_code == 200:
                answer = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
            elif res.status_code == 429:
                # Rate limit: synthesize a clean answer directly from the retrieved chunks
                print(f"LLM rate limited (429), using fallback answer from retrieved context.")
                answer = _build_fallback_answer(query, valid_chunks)
            else:
                print(f"LLM API error: {res.text}")
                answer = _build_fallback_answer(query, valid_chunks)
    except Exception as e:
        print(f"LLM generation exception: {e}")
        answer = _build_fallback_answer(query, valid_chunks)
        
    # 7. Format citations
    citations = []
    for c in valid_chunks:
        meta_label = ""
        if "page" in c["metadata"]:
            meta_label = f"p. {c['metadata']['page']}"
        elif "paragraph" in c["metadata"]:
            meta_label = f"para. {c['metadata']['paragraph']}"
        elif "line" in c["metadata"]:
            meta_label = f"line {c['metadata']['line']}"
            
        citations.append({
            "filename": c["filename"],
            "meta": meta_label,
            "text_excerpt": c["text"][:150] + "..." if len(c["text"]) > 150 else c["text"]
        })
        
    return {
        "answer": answer,
        "citations": citations,
        "confidence": confidence_percentage
    }
