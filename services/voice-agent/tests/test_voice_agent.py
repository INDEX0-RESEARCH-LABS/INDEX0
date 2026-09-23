"""Unit tests for Voice Agent service."""
import pytest
from src.config import Settings
from src.livekit.session_manager import LiveKitSessionManager
from src.pipeline.pipecat_pipeline import AudioFrame, PipecatVoicePipeline
from src.models import VoiceSessionStatus


def test_livekit_session_creation():
    settings = Settings()
    manager = LiveKitSessionManager(settings)

    resp = manager.create_session(
        room_name="test-room-101",
        user_id="user-123",
        organization_id="org-index0",
        user_name="Alice Developer"
    )

    assert resp.room_name == "test-room-101"
    assert resp.token is not None
    assert len(resp.token) > 20
    assert resp.session_id.startswith("voice-")

    # Verify session lookup
    session = manager.get_session(resp.session_id)
    assert session is not None
    assert session.status == VoiceSessionStatus.CONNECTED

    # Verify session close
    closed = manager.close_session(resp.session_id)
    assert closed.status == VoiceSessionStatus.DISCONNECTED
    assert closed.ended_at is not None


@pytest.mark.asyncio
async def test_pipecat_pipeline_process_speech():
    pipeline = PipecatVoicePipeline(sample_rate=16000)
    result = await pipeline.process_user_speech(
        text_or_audio="Refactor the authentication middleware to use Zitadel",
        session_id="voice-test-session"
    )

    assert result["sessionId"] == "voice-test-session"
    assert "Refactor" in result["transcription"]
    assert "Understood" in result["agentResponse"]
    assert result["latencyMs"] < 100.0


@pytest.mark.asyncio
async def test_pipecat_frame_streaming():
    pipeline = PipecatVoicePipeline(sample_rate=16000)
    frames = [
        AudioFrame(data=b"\x00" * 320),
        AudioFrame(data=b"\x00" * 320)
    ]

    text_frames = []
    async for tf in pipeline.stream_audio_frames(frames):
        text_frames.append(tf)

    assert len(text_frames) == 1
    assert text_frames[0].speaker == "user"
    assert "Transcribed 640 bytes" in text_frames[0].text
