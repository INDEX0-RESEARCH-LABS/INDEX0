"""Configuration for Agent Orchestrator service."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="ORCHESTRATOR_",
        env_file=".env",
        extra="ignore"
    )

    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"
    debug: bool = False

    # External Service URLs
    sandbox_manager_url: str = "http://localhost:3002"
    litellm_proxy_url: str = "http://localhost:4000"
    openhands_url: str = "http://localhost:3000"

    # Orchestrator Policy Defaults
    max_review_iterations: int = 5
    architect_model: str = "claude-3-7-sonnet"
    developer_model: str = "claude-3-5-sonnet"
    critic_model: str = "claude-3-5-sonnet"
    qa_model: str = "claude-3-5-haiku"


@lru_cache
def get_settings() -> Settings:
    return Settings()
