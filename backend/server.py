"""
CERMONT API Proxy - FastAPI wrapper for NestJS backend
Este servidor actúa como proxy al backend NestJS en apps/api
"""

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
import subprocess
import signal
import sys

app = FastAPI(
    title="CERMONT API Proxy",
    description="Proxy to NestJS backend",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NestJS backend URL
NESTJS_URL = os.getenv("NESTJS_URL", "http://localhost:3000")

nestjs_process = None

@app.on_event("startup")
async def startup_event():
    """Start NestJS backend on startup"""
    global nestjs_process
    
    # Check if NestJS is already running
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{NESTJS_URL}/api/health", timeout=2.0)
            if response.status_code == 200:
                print("✅ NestJS backend already running")
                return
    except:
        pass
    
    # Start NestJS backend
    print("🚀 Starting NestJS backend...")
    nestjs_process = subprocess.Popen(
        ["node", "dist/src/main.js"],
        cwd="/app/apps/api",
        env={
            **os.environ,
            "NODE_ENV": "development",
            "PORT": "3000",
            "DATABASE_URL": os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/cermont?schema=public"),
            "JWT_SECRET": os.getenv("JWT_SECRET", "cermont-jwt-secret-key"),
            "JWT_EXPIRY": os.getenv("JWT_EXPIRY", "24h"),
        }
    )
    print(f"✅ NestJS backend started (PID: {nestjs_process.pid})")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop NestJS backend on shutdown"""
    global nestjs_process
    if nestjs_process:
        print("🛑 Stopping NestJS backend...")
        nestjs_process.terminate()
        try:
            nestjs_process.wait(timeout=10)
        except:
            nestjs_process.kill()

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "cermont-proxy"}

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_to_nestjs(request: Request, path: str):
    """Proxy all /api/* requests to NestJS backend"""
    
    # Build target URL
    target_url = f"{NESTJS_URL}/api/{path}"
    
    # Get request body if present
    body = None
    if request.method in ["POST", "PUT", "PATCH"]:
        body = await request.body()
    
    # Forward headers
    headers = dict(request.headers)
    headers.pop("host", None)
    
    # Make request to NestJS
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                params=dict(request.query_params)
            )
            
            # Return response
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers)
            )
    except httpx.ConnectError:
        return JSONResponse(
            status_code=503,
            content={"error": "NestJS backend not available", "detail": "Service temporarily unavailable"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/")
async def root():
    """Root endpoint - redirect info"""
    return {
        "service": "CERMONT API Proxy",
        "api_docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
