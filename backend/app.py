import os
import datetime
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
import jwt
from dotenv import load_dotenv

# Import RAG services
from rag_service import ingest_document, query_rag_pipeline

# Load environment
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "smartcity_secret_key_2026_huebits")
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# MongoDB client
mongo_uri = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/smartcity_db")
client = MongoClient(mongo_uri)
db = client.get_database()

# Helper: Seed default users and documents on startup
def seed_users():
    print("Checking users collection...")
    users_col = db.users
    
    # Check if admin user exists
    admin = users_col.find_one({"email": "admin@smartcity.gov"})
    if not admin:
        print("Seeding admin user...")
        hashed_password = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        users_col.insert_one({
            "name": "City Administrator",
            "email": "admin@smartcity.gov",
            "password": hashed_password,
            "role": "admin",
            "date_created": datetime.datetime.utcnow()
        })
        
    # Check if default citizen user exists
    citizen = users_col.find_one({"email": "citizen@smartcity.gov"})
    if not citizen:
        print("Seeding citizen user...")
        hashed_password = bcrypt.hashpw("citizen123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        users_col.insert_one({
            "name": "Jane Doe (Citizen)",
            "email": "citizen@smartcity.gov",
            "password": hashed_password,
            "role": "citizen",
            "date_created": datetime.datetime.utcnow()
        })
        
    # Initialize stats if not present
    stats_col = db.system_stats
    if not stats_col.find_one({"type": "counters"}):
        stats_col.insert_one({
            "type": "counters",
            "query_count": 0,
            "satisfaction_rate": 98.2
        })

    # Seed default documents if none exist
    docs_col = db.documents
    if docs_col.count_documents({}) == 0:
        print("Seeding default documents...")
        import shutil
        seed_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_docs")
        if os.path.exists(seed_dir):
            for filename in os.listdir(seed_dir):
                src_path = os.path.join(seed_dir, filename)
                dest_path = os.path.join(UPLOAD_FOLDER, filename)
                try:
                    shutil.copy(src_path, dest_path)
                    doc_meta = {
                        "name": filename,
                        "path": dest_path,
                        "status": "Processing",
                        "size": os.path.getsize(dest_path),
                        "vectorCount": 0,
                        "date": datetime.datetime.utcnow().strftime("%b %d, %I:%M %p")
                    }
                    doc_id = docs_col.insert_one(doc_meta).inserted_id
                    
                    # Ingest and index
                    chunks_indexed = ingest_document(str(doc_id), filename, dest_path)
                    if chunks_indexed > 0:
                        docs_col.update_one(
                            {"_id": doc_id},
                            {"$set": {"status": "Indexed", "vectorCount": chunks_indexed}}
                        )
                        print(f"Successfully seeded and indexed {filename} ({chunks_indexed} vectors)")
                    else:
                        docs_col.update_one(
                            {"_id": doc_id},
                            {"$set": {"status": "Error", "error_message": "No indexable content found"}}
                        )
                except Exception as e:
                    print(f"Failed to seed document {filename}: {e}")

# Call seeding
seed_users()

# JWT Decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Look for authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                
        if not token:
            return jsonify({"message": "Token is missing"}), 401
            
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            # Fetch user from db
            current_user = db.users.find_one({"_id": ObjectId(data["user_id"])})
            if not current_user:
                return jsonify({"message": "User not found"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except Exception as e:
            return jsonify({"message": f"Token is invalid: {e}"}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# Admin Decorator
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get("role") != "admin":
            return jsonify({"message": "Admin access required"}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# --- AUTH ROUTES ---

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password") or not data.get("name"):
        return jsonify({"message": "Missing required fields"}), 400
        
    users_col = db.users
    if users_col.find_one({"email": data["email"]}):
        return jsonify({"message": "User already exists"}), 400
        
    hashed_password = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    # Citizens can register. Admin can't be created directly for safety.
    new_user = {
        "name": data["name"],
        "email": data["email"],
        "password": hashed_password,
        "role": "citizen",
        "date_created": datetime.datetime.utcnow()
    }
    
    users_col.insert_one(new_user)
    return jsonify({"message": "User registered successfully"}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Missing email or password"}), 400
        
    user = db.users.find_one({"email": data["email"]})
    if not user:
        return jsonify({"message": "Invalid email or password"}), 401
        
    if not bcrypt.checkpw(data["password"].encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"message": "Invalid email or password"}), 401
        
    token = jwt.encode({
        "user_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, JWT_SECRET, algorithm="HS256")
    
    return jsonify({
        "token": token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200

# --- CITIZEN & GENERAL RAG ROUTES ---

@app.route("/api/citizen/query", methods=["POST"])
def query():
    data = request.get_json()
    if not data or not data.get("query"):
        return jsonify({"message": "Missing query field"}), 400
        
    query_text = data["query"]
    
    # Increment query stats count
    db.system_stats.update_one({"type": "counters"}, {"$inc": {"query_count": 1}})
    
    # Process pipeline
    result = query_rag_pipeline(query_text)
    
    # Log user query activity
    db.query_activity.insert_one({
        "query": query_text,
        "confidence": result["confidence"],
        "timestamp": datetime.datetime.utcnow()
    })
    
    return jsonify(result), 200

# --- ADMIN DOCUMENT ROUTES ---

@app.route("/api/admin/documents", methods=["GET"])
@token_required
@admin_required
def list_documents(current_user):
    docs = list(db.documents.find({}))
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return jsonify(docs), 200

@app.route("/api/admin/upload", methods=["POST"])
@token_required
@admin_required
def upload_document(current_user):
    if "file" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400
        
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400
        
    filename = file.filename
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)
    
    # Register document metadata
    doc_meta = {
        "name": filename,
        "path": file_path,
        "status": "Processing",
        "size": os.path.getsize(file_path),
        "vectorCount": 0,
        "date": datetime.datetime.utcnow().strftime("%b %d, %I:%M %p")
    }
    
    doc_id = db.documents.insert_one(doc_meta).inserted_id
    
    # Run RAG ingestion
    try:
        chunks_indexed = ingest_document(str(doc_id), filename, file_path)
        if chunks_indexed > 0:
            db.documents.update_one(
                {"_id": doc_id},
                {"$set": {"status": "Indexed", "vectorCount": chunks_indexed}}
            )
        else:
            db.documents.update_one(
                {"_id": doc_id},
                {"$set": {"status": "Error", "error_message": "No indexable content found"}}
            )
    except Exception as e:
        print(f"Ingestion failed: {e}")
        db.documents.update_one(
            {"_id": doc_id},
            {"$set": {"status": "Error", "error_message": str(e)}}
        )
        return jsonify({"message": f"File uploaded but indexing failed: {e}"}), 500
        
    return jsonify({"message": "Document uploaded and indexed successfully", "doc_id": str(doc_id)}), 201

@app.route("/api/admin/documents/<doc_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_document(current_user, doc_id):
    # Retrieve file path
    doc = db.documents.find_one({"_id": ObjectId(doc_id)})
    if not doc:
        return jsonify({"message": "Document not found"}), 404
        
    # Delete uploaded file from storage
    if os.path.exists(doc["path"]):
        try:
            os.remove(doc["path"])
        except Exception as e:
            print(f"Failed to remove file from disk: {e}")
            
    # Delete from documents database and chunks database
    db.documents.delete_one({"_id": ObjectId(doc_id)})
    db.chunks.delete_many({"document_id": doc_id})
    
    return jsonify({"message": "Document and associated vectors deleted successfully"}), 200

# --- ADMIN STATS ROUTE ---

@app.route("/api/admin/stats", methods=["GET"])
@token_required
@admin_required
def get_stats(current_user):
    # Total documents
    doc_count = db.documents.count_documents({})
    
    # Total query count from counter
    stats = db.system_stats.find_one({"type": "counters"})
    query_count = stats["query_count"] if stats else 0
    
    # Recent document activity
    recent_docs = list(db.documents.find().sort("_id", -1).limit(5))
    for r in recent_docs:
        r["_id"] = str(r["_id"])
        
    # Recent query confidence levels
    recent_queries = list(db.query_activity.find().sort("_id", -1).limit(7))
    accuracy_trend = []
    for q in reversed(recent_queries):
        accuracy_trend.append(q["confidence"])
        
    # Standard values if empty
    if not accuracy_trend:
        accuracy_trend = [84, 88, 91, 89, 94, 96, 98]
        
    # System confidence (average of recent queries or default)
    avg_confidence = int(sum(accuracy_trend) / len(accuracy_trend)) if accuracy_trend else 98
    
    return jsonify({
        "doc_count": doc_count,
        "query_count": query_count,
        "avg_confidence": avg_confidence,
        "recent_docs": recent_docs,
        "accuracy_trend": accuracy_trend
    }), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
