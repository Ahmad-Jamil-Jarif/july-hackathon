from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Depends, Header, Request
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import shutil
import os
import uuid
from typing import Optional
import logging
import json
import time
from collections import defaultdict

from forensics import extract_exif, analyze_deepfake_score, calculate_file_hash, analyze_image_comprehensive

logger = logging.getLogger(__name__)
audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)

# Create handler for audit log if not already configured
if not audit_logger.handlers:
    handler = logging.FileHandler("audit.log")
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    audit_logger.addHandler(handler)
    audit_logger.propagate = False  # Don't propagate to root logger

# Security configurations
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_IMAGE_MAGIC = {
    b'\xff\xd8\xff': 'image/jpeg',
    b'\x89PNG\r\n\x1a\n': 'image/png',
    b'GIF87a': 'image/gif',
    b'GIF89a': 'image/gif',
    b'BM': 'image/bmp',
    b'II*\x00': 'image/tiff',
    b'MM\x00*': 'image/tiff'
}
ALLOWED_VIDEO_MAGIC = {
    b'\x00\x00\x00 ftypmp4': 'video/mp4',
    b'\x00\x00\x00 ftyp': 'video/mp4',  # Generic MP4
    b'RIFF\x00\x00\x00 avi': 'video/avi'  # AVI files
}

def validate_file_content(file_content: bytes, declared_type: str) -> tuple[bool, str]:
    """
    Validate file content matches declared type using magic bytes.

    Args:
        file_content: First few bytes of the file
        declared_type: MIME type from client

    Returns:
        Tuple of (is_valid, detected_type)
    """
    if not file_content:
        return False, "Empty file"

    # Check image magic bytes
    for magic, mime_type in ALLOWED_IMAGE_MAGIC.items():
        if file_content.startswith(magic):
            if "image" in declared_type or declared_type == "":
                return True, mime_type
            break

    # Check video magic bytes
    for magic, mime_type in ALLOWED_VIDEO_MAGIC.items():
        if file_content.startswith(magic):
            if "video" in declared_type or declared_type == "":
                return True, mime_type
            break

    # If we got here, either no match or type mismatch
    detected_type = "unknown"
    for magic, mime_type in {**ALLOWED_IMAGE_MAGIC, **ALLOWED_VIDEO_MAGIC}.items():
        if file_content.startswith(magic):
            detected_type = mime_type
            break

    return False, f"File content does not match declared type {declared_type}. Detected: {detected_type}"

def log_audit_event(event_type: str, user_id: str, ip_address: str, details: dict, success: bool = True):
    """
    Log audit events for security and compliance tracking.

    Args:
        event_type: Type of event (e.g., 'image_analysis', 'video_analysis')
        user_id: User identifier from API key or authentication
        ip_address: Client IP address
        details: Additional event details
        success: Whether the operation was successful
    """
    import json  # Import here to avoid circular imports if needed
    audit_entry = {
        "timestamp": time.time(),
        "event_type": event_type,
        "user_id": user_id or "anonymous",
        "ip_address": ip_address,
        "success": success,
        "details": details
    }
    audit_logger.info(f"AUDIT: {json.dumps(audit_entry)}")

# Security
API_KEYS = {"dev-key-12345": "developer", "prod-key-67890": "production"}  # In production, use environment variables and secure storage
security = HTTPBearer(auto_error=False)

# Rate limiting
request_counts = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # 1 minute
RATE_LIMIT_MAX_REQUESTS = 10  # Max requests per window
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_IMAGE_MAGIC = {
    b'\xff\xd8\xff': 'image/jpeg',
    b'\x89PNG\r\n\x1a\n': 'image/png',
    b'GIF87a': 'image/gif',
    b'GIF89a': 'image/gif',
    b'BM': 'image/bmp',
    b'\x49\x49\x2A\x00': 'image/tiff',  # Little-endian TIFF
    b'\x4D\x4D\x00\x2A': 'image/tiff',  # Big-endian TIFF
}
ALLOWED_VIDEO_MAGIC = {
    b'\x00\x00\x00\x18ftypmp4': 'video/mp4',
    b'\x00\x00\x00\x18ftypav': 'video/mp4',
    b'\x00\x00\x01\xba': 'video/mpeg',
    b'\x00\x00\x01\xb3': 'video/mpeg',
}

def validate_file_content(file_content: bytes, declared_type: str) -> tuple[bool, str]:
    """
    Validate file content matches declared type using magic bytes.

    Args:
        file_content: First few bytes of the file
        declared_type: MIME type from client

    Returns:
        Tuple of (is_valid, detected_type)
    """
    if not file_content or len(file_content) < 4:
        return False, "File too small to determine type"

    # Check image magic bytes
    for magic, mime_type in ALLOWED_IMAGE_MAGIC.items():
        if file_content.startswith(magic):
            if "image" in declared_type or declared_type == "":
                return True, mime_type
            # If we have a declared type but it doesn't match, continue checking
            break

    # Check video magic bytes
    for magic, mime_type in ALLOWED_VIDEO_MAGIC.items():
        if file_content.startswith(magic):
            if "video" in declared_type or declared_type == "":
                return True, mime_type
            break

    # If we got here, either no match or type mismatch
    detected_type = "unknown"
    for magic, mime_type in {**ALLOWED_IMAGE_MAGIC, **ALLOWED_VIDEO_MAGIC}.items():
        if file_content.startswith(magic):
            detected_type = mime_type
            break

    return False, f"File content does not match declared type {declared_type}. Detected: {detected_type}"

app = FastAPI(
    title="JulyNexus AI Forensics Engine",
    description="AI-powered media forensics service for deepfake detection, EXIF extraction, and authenticity verification",
    version="1.0.0"
)

# Authentication and rate limiting dependencies
async def verify_api_key(authorization: Optional[str] = Header(None)):
    """Verify API key from Authorization header."""
    if not authorization:
        # For development, allow requests without API key
        # In production, this should raise HTTPException
        return None

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        if token not in API_KEYS:
            raise HTTPException(status_code=401, detail="Invalid API key")

        return API_KEYS[token]
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

async def rate_limit(request: Request, api_key_info: str = Depends(verify_api_key)):
    """Simple rate limiting based on client IP."""
    client_ip = request.client.host
    current_time = time.time()

    # Clean old requests
    request_counts[client_ip] = [req_time for req_time in request_counts[client_ip]
                                if current_time - req_time < RATE_LIMIT_WINDOW]

    # Check if rate limit exceeded
    if len(request_counts[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    # Add current request
    request_counts[client_ip].append(current_time)

    return True

# Security configurations
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_IMAGE_MAGIC = {
    b'\xff\xd8\xff': 'image/jpeg',
    b'\x89PNG\r\n\x1a\n': 'image/png',
    b'GIF87a': 'image/gif',
    b'GIF89a': 'image/gif',
    b'BM': 'image/bmp',
    b'II*\x00': 'image/tiff',
    b'MM\x00*': 'image/tiff'
}
ALLOWED_VIDEO_MAGIC = {
    b'\x00\x00\x00 ftypmp4': 'video/mp4',
    b'\x00\x00\x00 ftyp': 'video/mp4',  # Generic MP4
    b'RIFF': 'video/avi'  # AVI files start with RIFF
}

def validate_file_content(file_content: bytes, declared_type: str) -> tuple[bool, str]:
    """
    Validate file content matches declared type using magic bytes.

    Args:
        file_content: First few bytes of the file
        declared_type: MIME type from client

    Returns:
        Tuple of (is_valid, detected_type)
    """
    if not file_content:
        return False, "Empty file"

    # Check image magic bytes
    for magic, mime_type in ALLOWED_IMAGE_MAGIC.items():
        if file_content.startswith(magic):
            if "image" in declared_type or declared_type == "":
                return True, mime_type
            break

    # Check video magic bytes
    for magic, mime_type in ALLOWED_VIDEO_MAGIC.items():
        if file_content.startswith(magic):
            if "video" in declared_type or declared_type == "":
                return True, mime_type
            break

    # If we got here, either no match or type mismatch
    detected_type = "unknown"
    for magic, mime_type in {**ALLOWED_IMAGE_MAGIC, **ALLOWED_VIDEO_MAGIC}.items():
        if file_content.startswith(magic):
            detected_type = mime_type
            break

    return False, f"File content does not match declared type {declared_type}. Detected: {detected_type}"
UPLOAD_DIR = "./temp_uploads"
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff"
}
ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo"
}

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.on_event("startup")
async def startup_event():
    logger.info("JulyNexus AI Forensics Engine starting up")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("JulyNexus AI Forensics Engine shutting down")
    # Clean up temp files
    if os.path.exists(UPLOAD_DIR):
        shutil.rmtree(UPLOAD_DIR)

@app.post("/api/v1/analyze/image")
async def analyze_image(
    file: UploadFile = File(...),
    extract_exif_data: bool = Form(True),
    check_deepfake: bool = Form(True),
    api_key_info: str = Depends(verify_api_key),
    _: bool = Depends(rate_limit)
):
    """
    Analyze an image for authenticity, EXIF data, and deepfake indicators.
    """
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

    # Generate unique filename to avoid conflicts
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    temp_file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")

    try:
        # Read file content for validation
        file_content = await file.read()

        # Validate file size
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size allowed is {MAX_FILE_SIZE // (1024*1024)} MB"
            )

        # Validate file content matches declared type
        is_valid, validation_message = validate_file_content(file_content, file.content_type)
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail=f"File content validation failed: {validation_message}"
            )

        # Reset file position for saving
        file.file.seek(0)

        # Save uploaded file temporarily
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_content)

        logger.info(f"Saved uploaded file to {temp_file_path}")

        # Audit log for file upload
        log_audit_event(
            event_type="file_upload",
            user_id=api_key_info,
            ip_address=request.client.host,
            details={
                "filename": file.filename,
                "content_type": file.content_type,
                "file_size": len(file_content),
                "file_id": file_id
            }
        )

        # Perform analysis
        results = {
            "file_id": file_id,
            "original_filename": file.filename,
            "file_size": len(file_content),
            "content_type": file.content_type
        }

        # Extract EXIF data if requested
        if extract_exif_data:
            exif_data = extract_exif(temp_file_path)
            results["exif_data"] = exif_data

        # Check for deepfake if requested
        if check_deepfake:
            deepfake_score = analyze_deepfake_score(temp_file_path)
            results["deepfake_score"] = deepfake_score
            results["is_authentic"] = deepfake_score < 0.5  # Threshold for authenticity

            # Additional comprehensive analysis
            comprehensive_results = analyze_image_comprehensive(temp_file_path)
            results["comprehensive_analysis"] = comprehensive_results

        # Calculate file hash for duplicate detection
        file_hash = calculate_file_hash(temp_file_path)
        results["file_hash"] = file_hash

        # Determine overall trust score (simplified)
        trust_score = max(0, min(100, int((1 - results.get("deepfake_score", 0)) * 100)))
        results["trust_score"] = trust_score

        # Audit log for successful analysis
        log_audit_event(
            event_type="image_analysis_complete",
            user_id=api_key_info,
            ip_address=request.client.host,
            details={
                "file_id": file_id,
                "filename": file.filename,
                "deepfake_score": results.get("deepfake_score"),
                "is_authentic": results.get("is_authentic"),
                "trust_score": results.get("trust_score"),
                "analysis_type": "image"
            }
        )

        return JSONResponse(content=results)

    except HTTPException as he:
        # Audit log for failed analysis (HTTP exceptions)
        log_audit_event(
            event_type="image_analysis_failed",
            user_id=api_key_info,
            ip_address=request.client.host,
            details={
                "file_id": file_id,
                "filename": file.filename,
                "error": str(he.detail),
                "status_code": he.status_code,
                "analysis_type": "image"
            },
            success=False
        )
        raise
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        # Audit log for failed analysis (unexpected exceptions)
        log_audit_event(
            event_type="image_analysis_failed",
            user_id=api_key_info,
            ip_address=request.client.host,
            details={
                "file_id": file_id,
                "filename": file.filename,
                "error": str(e),
                "analysis_type": "image"
            },
            success=False
        )
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                logger.info(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as e:
                logger.warning(f"Failed to remove temporary file {temp_file_path}: {e}")

@app.post("/api/v1/analyze/video")
async def analyze_video(
    file: UploadFile = File(...),
    extract_frames: bool = Form(False),
    check_deepfake: bool = Form(True),
    api_key_info: str = Depends(verify_api_key),
    _: bool = Depends(rate_limit)
):
    """
    Analyze a video for authenticity and deepfake indicators.
    """
    # Validate file type
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed types: {', '.join(ALLOWED_VIDEO_TYPES)}"
        )

    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".mp4"
    temp_file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")

    try:
        # Read file content for validation
        file_content = await file.read()

        # Validate file size
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size allowed is {MAX_FILE_SIZE // (1024*1024)} MB"
            )

        # Validate file content matches declared type
        is_valid, validation_message = validate_file_content(file_content, file.content_type)
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail=f"File content validation failed: {validation_message}"
            )

        # Reset file position for saving
        file.file.seek(0)

        # Save uploaded file temporarily
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_content)

        logger.info(f"Saved uploaded video to {temp_file_path}")

        # Perform analysis
        results = {
            "file_id": file_id,
            "original_filename": file.filename,
            "file_size": len(file_content),
            "content_type": file.content_type
        }

        # Audit log for video analysis start
        log_audit_event(
            event_type="video_analysis_start",
            user_id=api_key_info,
            ip_address=request.client.host,
            details={
                "file_id": file_id,
                "filename": file.filename,
                "content_type": file.content_type,
                "file_size": len(file_content),
                "check_deepfake": check_deepfake,
                "extract_frames": extract_frames
            }
        )

        # Check for deepfake if requested
        if check_deepfake:
            deepfake_score = analyze_video_deepfake(temp_file_path)
            results["deepfake_score"] = deepfake_score
            results["is_authentic"] = deepfake_score < 0.5  # Threshold for authenticity

        # Extract frames if requested (for further analysis)
        if extract_frames:
            frames = extract_video_frames(temp_file_path)
            results["extracted_frames_count"] = len(frames)
            results["extracted_frames"] = frames[:5]  # Limit to first 5 for response size

        # Calculate file hash for duplicate detection
        file_hash = calculate_file_hash(temp_file_path)
        results["file_hash"] = file_hash

        # Determine overall trust score
        trust_score = max(0, min(100, int((1 - results.get("deepfake_score", 0)) * 100)))
        results["trust_score"] = trust_score

        # Audit log for successful video analysis
        log_audit_event(
            event_type="video_analysis_complete",
            user_id=api_key_info,
            ip_address=request.client.host,
            details={
                "file_id": file_id,
                "filename": file.filename,
                "deepfake_score": results.get("deepfake_score"),
                "is_authentic": results.get("is_authentic"),
                "trust_score": results.get("trust_score"),
                "analysis_type": "video"
            }
        )

        return JSONResponse(content=results)

    except HTTPException as he:
        # Audit log for failed video analysis (HTTP exceptions)
        log_audit_event(
            event_type="video_analysis_failed",
            user_id=api_key_info,
            ip_address=request.client.host,
            details={
                "file_id": file_id,
                "filename": file.filename,
                "error": str(he.detail),
                "status_code": he.status_code,
                "analysis_type": "video"
            },
            success=False
        )
        raise
    except Exception as e:
        logger.error(f"Error analyzing video: {e}")
        # Audit log for failed video analysis (unexpected exceptions)
        log_audit_event(
            event_type="video_analysis_failed",
            user_id=api_key_info,
            ip_address=request.client.host,
            details={
                "file_id": file_id,
                "filename": file.filename,
                "error": str(e),
                "analysis_type": "video"
            },
            success=False
        )
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                logger.info(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as e:
                logger.warning(f"Failed to remove temporary file {temp_file_path}: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "JulyNexus AI Forensics Engine"}

@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "JulyNexus AI Forensics Engine",
        "version": "1.0.0",
        "description": "AI-powered media forensics for deepfake detection and authenticity verification",
        "endpoints": {
            "POST /api/v1/analyze/image": "Analyze image for authenticity",
            "POST /api/v1/analyze/video": "Analyze video for authenticity",
            "GET /health": "Health check"
        }
    }