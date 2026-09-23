"""FastAPI Application for INDEX0 Voice Agent."""
from datetime import datetime, timezone
from typing import Any, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .livekit.session_manager import LiveKitSessionManager
from .models import AudioTranscriptionRequest, VoiceTokenRequest, VoiceTokenResponse
from .pipeline.pipecat_pipeline import PipecatVoicePipeline

settings = get_settings()
session_manager = LiveKitSessionManager(settings)
pipeline = PipecatVoicePipeline(sample_rate=settings.sample_rate)

app = FastAPI(
    title="INDEX0 Voice Agent",
    description="Sub-100ms Multimodal WebRTC Voice & Pipecat Service",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "voice-agent",
        "version": "0.1.0",
        "livekit_url": settings.livekit_url,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.post("/voice/tokens", response_model=VoiceTokenResponse)
async def create_voice_token(req: VoiceTokenRequest):
    return session_manager.create_session(
        room_name=req.room_name,
        user_id=req.user_id,
        organization_id=req.organization_id,
        user_name=req.user_name
    )


@app.get("/voice/sessions/{session_id}")
async def get_session(session_id: str):
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Voice session not found: {session_id}")
    return session


@app.post("/voice/sessions/{session_id}/end")
async def end_session(session_id: str):
    session = session_manager.close_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Voice session not found: {session_id}")
    return session


@app.post("/voice/transcribe")
async def transcribe(req: AudioTranscriptionRequest) -> Dict[str, Any]:
    text = req.text_fallback or "[Audio stream processed]"
    result = await pipeline.process_user_speech(text, req.session_id)
    return result
