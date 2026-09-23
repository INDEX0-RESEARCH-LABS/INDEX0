"""Pydantic Models matching @index0/contracts/v1/voice."""
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field


class VoiceSessionStatus(str, Enum):
    CONNECTING = "connecting"
    CONNECTED = "connected"
    ACTIVE = "active"
    PAUSED = "paused"
    DISCONNECTED = "disconnected"
    FAILED = "failed"


class VoiceEventType(str, Enum):
    SESSION_CREATED = "voice.session.created"
    SESSION_CONNECTED = "voice.session.connected"
    TRANSCRIPTION = "voice.transcription"
    AGENT_RESPONSE = "voice.agent.response"
    AGENT_THINKING = "voice.agent.thinking"
    TURN_STARTED = "voice.turn.started"
    TURN_ENDED = "voice.turn.ended"
    SESSION_ENDED = "voice.session.ended"


class VoiceSession(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    agent_run_id: Optional[str] = Field(None, alias="agentRunId")
    room_name: str = Field(..., alias="roomName")
    user_id: str = Field(..., alias="userId")
    organization_id: str = Field(..., alias="organizationId")
    status: VoiceSessionStatus = VoiceSessionStatus.CONNECTING
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), alias="createdAt")
    ended_at: Optional[str] = Field(None, alias="endedAt")
    duration_ms: Optional[float] = Field(None, alias="durationMs")


class VoiceTokenRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    room_name: str = Field(..., alias="roomName")
    user_id: str = Field(..., alias="userId")
    organization_id: str = Field(..., alias="organizationId")
    user_name: Optional[str] = Field(None, alias="userName")


class VoiceTokenResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    token: str
    room_name: str = Field(..., alias="roomName")
    livekit_url: str = Field(..., alias="livekitUrl")
    session_id: str = Field(..., alias="sessionId")
    expires_at: str = Field(..., alias="expiresAt")


class VoiceEvent(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    session_id: str = Field(..., alias="sessionId")
    type: VoiceEventType
    payload: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AudioTranscriptionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    session_id: str = Field(..., alias="sessionId")
    audio_base64: Optional[str] = Field(None, alias="audioBase64")
    text_fallback: Optional[str] = Field(None, alias="textFallback")
