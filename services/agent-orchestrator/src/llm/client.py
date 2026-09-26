"""Asynchronous LiteLLM client for Agent Orchestrator."""
import json
import logging
import re
from typing import Any, Dict, List, Optional, Type, TypeVar
import httpx
from pydantic import BaseModel

from ..config import get_settings

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)


class LiteLLMClient:
    """Async client interfacing with the LiteLLM Gateway."""

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        settings = get_settings()
        self.base_url = (base_url or settings.litellm_proxy_url).rstrip("/")
        # If /v1 not at end of base_url, append /v1 for OpenAI compatibility
        if not self.base_url.endswith("/v1"):
            self.endpoint = f"{self.base_url}/v1/chat/completions"
        else:
            self.endpoint = f"{self.base_url}/chat/completions"
        self.api_key = api_key or settings.litellm_api_key

    def _extract_json_block(self, text: str) -> str:
        """Extract JSON substring if wrapped in markdown fences."""
        pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
        return text.strip()

    async def complete(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
        response_model: Optional[Type[T]] = None,
        timeout: float = 60.0
    ) -> Any:
        """Send chat completion request to LiteLLM."""
        settings = get_settings()
        target_model = model or settings.architect_model

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "X-Client": "index0-agent-orchestrator"
        }

        # If a response model is requested, augment system instruction to guarantee valid JSON
        augmented_messages = list(messages)
        if response_model is not None:
            schema_json = json.dumps(response_model.model_json_schema(), indent=2)
            json_directive = (
                f"\n\nCRITICAL REQUIREMENT: You MUST respond ONLY with a valid, raw JSON object "
                f"matching this exact schema:\n```json\n{schema_json}\n```\n"
                f"Do not include any conversational preamble or postscript."
            )
            # Append directive to system message or add as system message
            if augmented_messages and augmented_messages[0]["role"] == "system":
                augmented_messages[0] = {
                    "role": "system",
                    "content": augmented_messages[0]["content"] + json_directive
                }
            else:
                augmented_messages.insert(0, {"role": "system", "content": json_directive})

        payload: Dict[str, Any] = {
            "model": target_model,
            "messages": augmented_messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.post(self.endpoint, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                raw_content = data["choices"][0]["message"]["content"]

                if response_model is not None:
                    json_str = self._extract_json_block(raw_content)
                    return response_model.model_validate_json(json_str)

                return raw_content
            except httpx.HTTPStatusError as e:
                logger.error(f"LiteLLM error status {e.response.status_code}: {e.response.text}")
                raise
            except httpx.RequestError as e:
                logger.error(f"Failed to connect to LiteLLM at {self.endpoint}: {str(e)}")
                raise


_client_instance: Optional[LiteLLMClient] = None


def get_llm_client() -> LiteLLMClient:
    """Singleton getter for LiteLLMClient."""
    global _client_instance
    if _client_instance is None:
        _client_instance = LiteLLMClient()
    return _client_instance
