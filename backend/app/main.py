# FastAPI(...) creates your backend application.

# CORSMiddleware allows your React frontend to communicate with the backend from a different development port.

# @app.get("/") creates your homepage API endpoint.

# @app.get("/health") creates a simple endpoint to check whether the backend is working.


# uvicorn app.main:app --reload      run this to start the api server
# gemma4:e4b

# Backend homepage
# Checks the basic response.
# http://127.0.0.1:8000/


# Health check
# Checks whether the API is healthy.
# http://127.0.0.1:8000/health


# Interactive API documentation
# Lets you execute endpoints directly from the browser.
# http://127.0.0.1:8000/docs

from app.api.ai import router as ai_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Canvas API",
    description="Backend for the AI Canvas application",
    version="0.1.0",
)
# Allow requests from your frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)

@app.get("/")
def home():
    return {
        "message": "AI Canvas backend is running!",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }
