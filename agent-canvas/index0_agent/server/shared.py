import os

import socketio
from dotenv import load_dotenv

from index0_agent.core.config import load_app_config
from index0_agent.server.config.openhands_config import load_openhands_config
from index0_agent.server.session import SessionManager
from index0_agent.storage import get_file_store

load_dotenv()

config = load_app_config()
openhands_config = load_openhands_config()
file_store = get_file_store(config.file_store, config.file_store_path)

client_manager = None
redis_host = os.environ.get('REDIS_HOST')
if redis_host:
    client_manager = socketio.AsyncRedisManager(
        f'redis://{redis_host}',
        redis_options={'password': os.environ.get('REDIS_PASSWORD')},
    )


sio = socketio.AsyncServer(
    async_mode='asgi', cors_allowed_origins='*', client_manager=client_manager
)

session_manager = SessionManager(sio, config, file_store)
