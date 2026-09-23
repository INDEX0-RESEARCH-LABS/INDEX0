"""LiveKit Session Manager and Access Token Generation."""
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import json
import base64
import uuid
from typing import Dict, Optional
from ..config import Settings
from ..models import VoiceSession, VoiceSessionStatus, VoiceTokenResponse


class LiveKitSessionManager:
    """Manages LiveKit WebRTC rooms and creates authenticated client join tokens."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self._sessions: Dict[str, VoiceSession] = {}

    def _generate_jwt_token(self, room_name: str, identity: str, name: Optional[str] = None) -> str:
        """Generate LiveKit-compatible JWT token (with or without livekit-api package)."""
        try:
            from livekit import api
            token = (
                api.AccessToken(self.settings.livekit_api_key, self.settings.livekit_api_secret)
                .with_identity(identity)
                .with_name(name or identity)
                .with_grants(
                    api.VideoGrants(
                        room_join=True,
                        room=room_name,
                        can_publish=True,
                        can_subscribe=True,
                    )
                )
            )
            return token.to_jwt()
        except ImportError:
            # Fallback self-contained JWT generator with LiveKit claims
            header = {"alg": "HS256", "typ": "JWT"}
            now = int(datetime.now(timezone.utc).timestamp())
            exp = now + 3600

            payload = {
                "sub": identity,
                "iss": self.settings.livekit_api_key,
                "nbf": now - 10,
                "exp": exp,
                "name": name or identity,
                "video": {
                    "room": room_name,
                    "roomJoin": True,
                    "canPublish": True,
                    "canSubscribe": True
                }
            }

            def b64url(data: bytes) -> str:
                return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

            encoded_header = b64url(json.dumps(header).encode("utf-8"))
            encoded_payload = b64url(json.dumps(payload).encode("utf-8"))
            signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
            sig = hmac.new(
                self.settings.livekit_api_secret.encode("utf-8"),
                signing_input,
                hashlib.sha256
            ).digest()
            encoded_sig = b64url(sig)
            return f"{encoded_header}.{encoded_payload}.{encoded_sig}"

    def create_session(
        self,
        room_name: str,
        user_id: str,
        organization_id: str,
        user_name: Optional[str] = None
    ) -> VoiceTokenResponse:
        """Create a new voice session and return the WebRTC access token."""
        session_id = f"voice-{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        expires_at = (now + timedelta(hours=1)).isoformat()

        session = VoiceSession(
            id=session_id,
            roomName=room_name,
            userId=user_id,
            organizationId=organization_id,
            status=VoiceSessionStatus.CONNECTED,
            createdAt=now.isoformat()
        )
        self._sessions[session_id] = session

        token = self._generate_jwt_token(room_name, user_id, user_name)

        return VoiceTokenResponse(
            token=token,
            roomName=room_name,
            livekitUrl=self.settings.livekit_url,
            sessionId=session_id,
            expiresAt=expires_at
        )

    def get_session(self, session_id: str) -> Optional[VoiceSession]:
        return self._sessions.get(session_id)

    def close_session(self, session_id: str) -> Optional[VoiceSession]:
        session = self._sessions.get(session_id)
        if session:
            session.status = VoiceSessionStatus.DISCONNECTED
            session.ended_at = datetime.now(timezone.utc).isoformat()
        return session
