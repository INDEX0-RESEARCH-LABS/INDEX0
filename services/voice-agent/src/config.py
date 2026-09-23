"""Configuration for Voice Agent service."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="VOICE_",
        env_file=".env",
        extra="ignore"
    )

    host: str = "0.0.0.0"
    port: int = 8020
    environment: str = "development"
    debug: bool = False

    # LiveKit Server Settings
    livekit_url: str = "ws://localhost:7880"
    livekit_api_key: str = "devkey"
    livekit_api_secret: str = "secret"

    # Pipecat & Pipeline Defaults
    sample_rate: int = 16000
    stt_provider: str = "whisper"
    tts_provider: str = "elevenlabs"
    tts_voice_id: str = "default"

    # Gateway & Router
    litellm_proxy_url: str = "http://localhost:4000"
    agent_orchestrator_url: str = "http://localhost:8000"


@lru_cache
def get_settings() -> Settings:
    return Settings()
