from __future__ import annotations

import json
from dataclasses import dataclass

from index0_agent.core.config.app_config import AppConfig
from index0_agent.server.settings import Settings
from index0_agent.storage import get_file_store
from index0_agent.storage.files import FileStore
from index0_agent.storage.settings.settings_store import SettingsStore
from index0_agent.utils.async_utils import call_sync_from_async


@dataclass
class FileSettingsStore(SettingsStore):
    file_store: FileStore
    path: str = 'settings.json'

    async def load(self) -> Settings | None:
        try:
            json_str = await call_sync_from_async(self.file_store.read, self.path)
            kwargs = json.loads(json_str)
            settings = Settings(**kwargs)
            return settings
        except FileNotFoundError:
            return None

    async def store(self, settings: Settings):
        json_str = json.dumps(settings.__dict__)
        await call_sync_from_async(self.file_store.write, self.path, json_str)

    @classmethod
    async def get_instance(cls, config: AppConfig, token: str | None):
        file_store = get_file_store(config.file_store, config.file_store_path)
        return FileSettingsStore(file_store)
