import asyncio

from index0_agent.core.config import AppConfig
from index0_agent.events.stream import EventStream
from index0_agent.runtime import get_runtime_cls
from index0_agent.runtime.base import Runtime
from index0_agent.security import SecurityAnalyzer, options
from index0_agent.storage.files import FileStore
from index0_agent.utils.async_utils import call_sync_from_async


class Conversation:
    sid: str
    file_store: FileStore
    event_stream: EventStream
    runtime: Runtime

    def __init__(
        self,
        sid: str,
        file_store: FileStore,
        config: AppConfig,
    ):
        self.sid = sid
        self.config = config
        self.file_store = file_store
        self.event_stream = EventStream(sid, file_store)
        if config.security.security_analyzer:
            self.security_analyzer = options.SecurityAnalyzers.get(
                config.security.security_analyzer, SecurityAnalyzer
            )(self.event_stream)

        runtime_cls = get_runtime_cls(self.config.runtime)
        self.runtime = runtime_cls(
            config=config,
            event_stream=self.event_stream,
            sid=self.sid,
            attach_to_existing=True,
            headless_mode=False,
        )

    async def connect(self):
        await self.runtime.connect()

    async def disconnect(self):
        asyncio.create_task(call_sync_from_async(self.runtime.close))
