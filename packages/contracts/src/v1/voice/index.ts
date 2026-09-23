/**
 * Voice & Multimodal Interaction Contracts — @index0/contracts/v1/voice
 * Authoritative schema definitions for LiveKit WebRTC sessions, Pipecat pipeline
 * events, voice-to-agent bridging, and real-time audio stream lifecycle.
 */

// ---------------------------------------------------------------------------
// Voice Session Lifecycle
// ---------------------------------------------------------------------------

export type VoiceSessionStatus =
  | "connecting"
  | "connected"
  | "active"
  | "paused"
  | "disconnected"
  | "failed";

export interface IVoiceSession {
  /** Unique voice session identifier. */
  id: string;

  /** Associated agent run ID (bridged after voice prompt is processed). */
  agentRunId?: string;

  /** LiveKit room name for this session. */
  roomName: string;

  /** Authenticated user ID from JWT claims. */
  userId: string;

  /** Organization ID for tenant isolation. */
  organizationId: string;

  /** Current session lifecycle status. */
  status: VoiceSessionStatus;

  /** ISO-8601 timestamp of session creation. */
  createdAt: string;

  /** ISO-8601 timestamp of session termination. */
  endedAt?: string;

  /** Total session duration in milliseconds. */
  durationMs?: number;
}

// ---------------------------------------------------------------------------
// Voice Event Types
// ---------------------------------------------------------------------------

export type VoiceEventType =
  | "voice.session.created"
  | "voice.session.connected"
  | "voice.transcription"
  | "voice.agent.response"
  | "voice.agent.thinking"
  | "voice.turn.started"
  | "voice.turn.ended"
  | "voice.session.ended"
  | "voice.error";

export interface IVoiceEvent<TPayload = Record<string, unknown>> {
  /** Unique event identifier. */
  id: string;

  /** Voice session this event belongs to. */
  sessionId: string;

  /** Event type discriminator. */
  type: VoiceEventType;

  /** Event-specific payload. */
  payload: TPayload;

  /** ISO-8601 timestamp. */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Voice Event Payloads
// ---------------------------------------------------------------------------

export interface IVoiceTranscriptionPayload {
  /** Transcribed text from user speech. */
  text: string;

  /** Speech-to-text confidence score (0.0 – 1.0). */
  confidence: number;

  /** Whether this is a final or interim transcription. */
  isFinal: boolean;

  /** Language code (e.g., "en-US"). */
  language: string;

  /** Duration of the audio segment in milliseconds. */
  audioDurationMs: number;
}

export interface IVoiceAgentResponsePayload {
  /** Text content of the agent's spoken response. */
  text: string;

  /** Whether the response is being streamed incrementally. */
  isStreaming: boolean;

  /** Model used to generate the response. */
  model?: string;
}

export interface IVoiceTurnPayload {
  /** Turn direction: user speaking or agent speaking. */
  speaker: "user" | "agent";

  /** ISO-8601 timestamp of turn boundary. */
  boundaryTimestamp: string;

  /** Whether the turn was an interruption. */
  isInterruption: boolean;
}

export interface IVoiceErrorPayload {
  /** Error code for programmatic handling. */
  code: "ROOM_FULL" | "AUTH_FAILED" | "STT_ERROR" | "TTS_ERROR" | "TIMEOUT" | "INTERNAL";

  /** Human-readable error message. */
  message: string;

  /** Whether the session can recover from this error. */
  recoverable: boolean;
}

// ---------------------------------------------------------------------------
// LiveKit Configuration
// ---------------------------------------------------------------------------

export interface ILiveKitConfig {
  /** LiveKit server WebSocket URL (e.g., "ws://livekit:7880"). */
  url: string;

  /** API key for LiveKit authentication. */
  apiKey: string;

  /** API secret for LiveKit authentication. */
  apiSecret: string;
}

export interface ILiveKitRoomConfig {
  /** Room name (unique per voice session). */
  name: string;

  /** Maximum number of participants. */
  maxParticipants: number;

  /** Room timeout in seconds (auto-close after inactivity). */
  emptyTimeout: number;

  /** Whether to enable recording. */
  recordingEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Pipecat Pipeline Configuration
// ---------------------------------------------------------------------------

export type PipecatSTTProvider = "deepgram" | "whisper" | "azure";
export type PipecatTTSProvider = "elevenlabs" | "bark" | "azure" | "cartesia";

export interface IPipecatPipelineConfig {
  /** Speech-to-text provider selection. */
  sttProvider: PipecatSTTProvider;

  /** Text-to-speech provider selection. */
  ttsProvider: PipecatTTSProvider;

  /** LLM model to use for response generation (routed via LiteLLM). */
  llmModel: string;

  /** Minimum silence duration (seconds) before end-of-turn detection. */
  minEndpointingDelay: number;

  /** Maximum silence duration (seconds) before auto-ending turn. */
  maxSilenceDuration: number;

  /** Duration (seconds) of user speech required to interrupt agent. */
  interruptSpeechDuration: number;
}

// ---------------------------------------------------------------------------
// Voice Session Request / Response
// ---------------------------------------------------------------------------

export interface IVoiceSessionRequest {
  /** Organization context for the voice session. */
  organizationId: string;

  /** Optional: workspace to bind the voice session to. */
  workspaceId?: string;

  /** Optional: custom pipeline configuration overrides. */
  pipelineConfig?: Partial<IPipecatPipelineConfig>;
}

export interface IVoiceSessionResponse {
  /** Created voice session metadata. */
  session: IVoiceSession;

  /** LiveKit connection token for the client to join the room. */
  connectionToken: string;

  /** LiveKit server URL for the client to connect to. */
  serverUrl: string;
}
