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
    # No default credential: set ORCHESTRATOR_LITELLM_API_KEY / LITELLM_MASTER_KEY
    litellm_api_key: str = ""
    letta_url: str = "http://localhost:8283"
    letta_api_key: str = ""  # unset by default: no memory call without a key

    # Orchestrator Policy Defaults
    max_review_iterations: int = 5
    # Free routes by default: no Azure subscription, no card. Override with
    # ORCHESTRATOR_*_MODEL (see infra/litellm/config.yaml for available names).
    architect_model: str = "groq"
    developer_model: str = "groq"
    critic_model: str = "groq"
    qa_model: str = "groq"


@lru_cache
def get_settings() -> Settings:
    return Settings()
