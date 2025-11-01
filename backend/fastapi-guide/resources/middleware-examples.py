"""
FastAPI Middleware Examples

Production-ready middleware for logging, authentication, rate limiting,
CORS, and error handling.

Usage:
    from middleware_examples import setup_middleware
    setup_middleware(app)
"""

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import time
import logging
import structlog
from datetime import datetime


# ====================
# LOGGING MIDDLEWARE
# ====================

# Configure structured logging
logger = structlog.get_logger()


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests and responses"""

    async def dispatch(self, request: Request, call_next: Callable):
        # Generate request ID
        request_id = f"{int(time.time() * 1000)}-{id(request)}"
        request.state.request_id = request_id

        # Log request
        logger.info(
            "request_started",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            client_host=request.client.host if request.client else None,
        )

        # Process request
        start_time = time.time()
        try:
            response = await call_next(request)
        except Exception as e:
            # Log error
            duration = time.time() - start_time
            logger.error(
                "request_failed",
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                duration_ms=round(duration * 1000, 2),
                error=str(e),
                error_type=type(e).__name__,
            )
            raise

        # Log response
        duration = time.time() - start_time
        logger.info(
            "request_completed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration * 1000, 2),
        )

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        return response


# ====================
# RATE LIMITING MIDDLEWARE
# ====================

from collections import defaultdict
from datetime import datetime, timedelta


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting"""

    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next: Callable):
        # Skip rate limiting for health check
        if request.url.path == "/health":
            return await call_next(request)

        # Get client identifier (IP address)
        client_id = request.client.host if request.client else "unknown"

        # Clean old requests
        now = datetime.utcnow()
        minute_ago = now - timedelta(minutes=1)
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > minute_ago
        ]

        # Check rate limit
        if len(self.requests[client_id]) >= self.requests_per_minute:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "detail": f"Maximum {self.requests_per_minute} requests per minute"
                }
            )

        # Record request
        self.requests[client_id].append(now)

        return await call_next(request)


# ====================
# AUTHENTICATION MIDDLEWARE
# ====================

class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Add user info to request state"""

    async def dispatch(self, request: Request, call_next: Callable):
        # Public endpoints that don't require auth
        public_paths = ["/health", "/docs", "/redoc", "/openapi.json", "/auth/login", "/auth/register"]

        if any(request.url.path.startswith(path) for path in public_paths):
            return await call_next(request)

        # Get token from header
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"error": "Authentication required"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = auth_header.split(" ")[1]

        try:
            # Verify token (implement your JWT verification)
            # This is a placeholder
            user_id = verify_token(token)
            request.state.user_id = user_id
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"error": "Invalid or expired token"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        return await call_next(request)


# ====================
# SECURITY HEADERS MIDDLEWARE
# ====================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""

    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        return response


# ====================
# TIMING MIDDLEWARE
# ====================

class TimingMiddleware(BaseHTTPMiddleware):
    """Add Server-Timing header for performance monitoring"""

    async def dispatch(self, request: Request, call_next: Callable):
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time

        # Add timing header
        response.headers["Server-Timing"] = f"total;dur={duration * 1000:.2f}"

        return response


# ====================
# ERROR HANDLING MIDDLEWARE
# ====================

from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "Validation failed",
            "details": errors,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    # Log the error
    logger.error(
        "unhandled_exception",
        error=str(exc),
        error_type=type(exc).__name__,
        path=request.url.path,
        method=request.method,
    )

    # Don't expose internal errors in production
    from app.core.config import settings
    detail = str(exc) if settings.DEBUG else "Internal server error"

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": detail,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )


# ====================
# MAINTENANCE MODE MIDDLEWARE
# ====================

class MaintenanceModeMiddleware(BaseHTTPMiddleware):
    """Enable maintenance mode via environment variable"""

    async def dispatch(self, request: Request, call_next: Callable):
        from app.core.config import settings

        # Allow health check during maintenance
        if request.url.path == "/health":
            return await call_next(request)

        if settings.MAINTENANCE_MODE:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "error": "Service under maintenance",
                    "message": settings.MAINTENANCE_MESSAGE or "We'll be back soon!",
                }
            )

        return await call_next(request)


# ====================
# SETUP FUNCTION
# ====================

def setup_middleware(app: FastAPI):
    """
    Set up all middleware for the FastAPI application

    Call this function after creating your FastAPI app:
        app = FastAPI()
        setup_middleware(app)
    """

    # CORS (must be first)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure based on settings
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Custom middleware (order matters)
    app.add_middleware(MaintenanceModeMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RateLimitMiddleware, requests_per_minute=100)
    app.add_middleware(TimingMiddleware)
    app.add_middleware(RequestLoggingMiddleware)

    # Exception handlers
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    logging.info("Middleware setup complete")


# ====================
# UTILITY FUNCTIONS
# ====================

def verify_token(token: str) -> int:
    """
    Verify JWT token and return user ID

    This is a placeholder - implement with your JWT library
    """
    import jwt
    from app.core.config import settings

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise ValueError("Invalid token payload")
        return int(user_id)
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


# ====================
# EXAMPLE USAGE
# ====================

"""
# main.py

from fastapi import FastAPI
from middleware_examples import setup_middleware
from routes import users, auth

app = FastAPI(
    title="My API",
    description="API with comprehensive middleware",
    version="1.0.0"
)

# Setup middleware
setup_middleware(app)

# Include routers
app.include_router(users.router)
app.include_router(auth.router)

# Health check
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat()
    }
"""
