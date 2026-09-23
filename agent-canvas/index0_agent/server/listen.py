import socketio

from index0_agent.server.app import app as base_app
from index0_agent.server.listen_socket import sio
from index0_agent.server.static import SPAStaticFiles

base_app.mount(
    '/', SPAStaticFiles(directory='./frontend/build', html=True), name='dist'
)

app = socketio.ASGIApp(sio, other_asgi_app=base_app)
