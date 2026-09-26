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
    litellm_api_key: str = "sk-index0-litellm-dev"
    openhands_url: str = "http://localhost:3000"
    letta_url: str = "http://localhost:8283"

    # Orchestrator Policy Defaults
    max_review_iterations: int = 5
    architect_model: str = "azure-gpt-4o"
    developer_model: str = "azure-gpt-4o"
    critic_model: str = "azure-gpt-4o"
    qa_model: str = "azure-gpt-4o-mini"


@lru_cache
def get_settings() -> Settings:
    return Settings()
