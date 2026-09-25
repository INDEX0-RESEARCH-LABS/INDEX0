import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, ArrowRight, Activity } from 'lucide-react';

export type VoiceSessionState = 'disconnected' | 'connecting' | 'listening' | 'processing' | 'speaking';

export interface IVoiceMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  latencyMs?: number;
}

export interface IVoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchToOrchestrator?: (prompt: string) => void;
  voiceServerUrl?: string;
  theme?: 'dark' | 'light';
}

export const VoiceAgentModal: React.FC<IVoiceAgentModalProps> = ({
  isOpen,
  onClose,
  onDispatchToOrchestrator,
  voiceServerUrl = 'ws://localhost:7880',
  theme = 'dark'
}) => {
  const [sessionState, setSessionState] = useState<VoiceSessionState>('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<IVoiceMessage[]>([
    {
      id: 'msg-init',
      sender: 'agent',
      text: 'INDEX0 Sub-100ms Voice Agent ready. Speak your architectural intent or task directives.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const isLight = theme === 'light';

  // Theme styling tokens
  const styles = {
    overlay: isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.75)',
    modalBg: isLight ? '#f7f7f4' : '#0e111a',
    cardBg: isLight ? '#ffffff' : '#141826',
    border: isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
    text: isLight ? '#1a1915' : '#f1f5f9',
    textMuted: isLight ? '#66645e' : '#94a3b8',
    accent: '#f54e00',
    waveColor: isLight ? '#f54e00' : '#818cf8',
    bubbleUser: isLight ? 'rgba(245, 78, 0, 0.1)' : 'rgba(99, 102, 241, 0.15)',
    bubbleAgent: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'
  };

  // Connect / Disconnect Simulation & WebRTC loop
  const handleToggleConnection = () => {
    if (sessionState === 'disconnected') {
      setSessionState('connecting');
      setTimeout(() => {
        setSessionState('listening');
      }, 600);
    } else {
      setSessionState('disconnected');
      setCurrentTranscript('');
    }
  };

  // Send simulated or transcribed speech
  const handleSimulateSpeech = (sampleText: string) => {
    if (sessionState === 'disconnected') return;

    setSessionState('processing');
    setCurrentTranscript(sampleText);

    setTimeout(() => {
      const userMsg: IVoiceMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: sampleText,
        timestamp: new Date().toLocaleTimeString()
      };

      const agentReply: IVoiceMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: `Understood: "${sampleText}". Bridging to LangGraph 4-Tier review loop.`,
        timestamp: new Date().toLocaleTimeString(),
        latencyMs: 78
      };

      setMessages((prev) => [...prev, userMsg, agentReply]);
      setCurrentTranscript('');
      setSessionState('speaking');

      setTimeout(() => {
        setSessionState('listening');
      }, 1500);
    }, 450);
  };

  // Waveform visualization loop
  useEffect(() => {
    if (!isOpen || sessionState === 'disconnected') {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isSpeakingOrListening = sessionState === 'listening' || sessionState === 'speaking' || sessionState === 'processing';
      const amplitude = isSpeakingOrListening ? (sessionState === 'speaking' ? 24 : 14) : 3;

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = styles.waveColor;

      const centerY = canvas.height / 2;
      for (let x = 0; x < canvas.width; x += 3) {
        const sinVal = Math.sin((x * 0.05) + phase);
        const y = centerY + sinVal * amplitude * Math.sin((x / canvas.width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.12;
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, sessionState, styles.waveColor]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: styles.overlay,
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
      data-testid="voice-agent-modal"
    >
      <div
        style={{
          width: '640px',
          maxWidth: '100%',
          background: styles.modalBg,
          border: `1px solid ${styles.border}`,
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${styles.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: styles.cardBg
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background:
                  sessionState === 'listening' || sessionState === 'speaking'
                    ? '#10b981'
                    : sessionState === 'connecting'
                    ? '#f59e0b'
                    : '#64748b',
                boxShadow: sessionState === 'listening' ? '0 0 10px #10b981' : 'none'
              }}
            />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: styles.text }}>
              LiveKit & Pipecat Voice Agent (Sub-100ms WebRTC)
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: styles.textMuted }}>
              SFU: <code style={{ fontSize: '0.7rem' }}>{voiceServerUrl}</code>
            </span>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: styles.textMuted, cursor: 'pointer', padding: 4 }}
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Audio Waveform & Status Section */}
        <div style={{ padding: '24px', background: styles.cardBg, borderBottom: `1px solid ${styles.border}`, textAlign: 'center' }}>
          <canvas
            ref={waveCanvasRef}
            width={480}
            height={60}
            style={{ width: '100%', height: '60px', borderRadius: '8px', background: isLight ? '#f1f1ee' : 'rgba(0,0,0,0.3)' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: styles.text, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} color={styles.accent} />
              Status: <span style={{ textTransform: 'capitalize' }}>{sessionState}</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: styles.textMuted }}>
              Target: <span style={{ color: '#10b981', fontWeight: 600 }}>&lt;100ms VAD</span>
            </div>
          </div>
        </div>

        {/* Transcript Conversation Stream */}
        <div
          style={{
            height: '240px',
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
          data-testid="voice-transcript-stream"
        >
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: isUser ? styles.bubbleUser : styles.bubbleAgent,
                  border: `1px solid ${styles.border}`,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  color: styles.text
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.7rem', color: isUser ? styles.accent : '#818cf8' }}>
                    {isUser ? 'Developer Intent' : 'Voice Agent (Pipecat)'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: styles.textMuted }}>
                    {m.timestamp} {m.latencyMs ? `(${m.latencyMs}ms)` : ''}
                  </span>
                </div>
                <div>{m.text}</div>
              </div>
            );
          })}

          {currentTranscript && (
            <div
              style={{
                alignSelf: 'flex-end',
                background: styles.bubbleUser,
                border: '1px dashed #f54e00',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.75rem',
                color: styles.textMuted
              }}
            >
              Listening... <em>"{currentTranscript}"</em>
            </div>
          )}
        </div>

        {/* Sample Directives Quick Bar */}
        <div style={{ padding: '8px 20px', background: isLight ? '#eeeeea' : 'rgba(255,255,255,0.02)', borderTop: `1px solid ${styles.border}`, display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.7rem', color: styles.textMuted, alignSelf: 'center', whiteSpace: 'nowrap' }}>Try speaking:</span>
          {['"Refactor database connection pool"', '"Run full pytest suite"', '"Audit zero-day security"'].map((directive) => (
            <button
              key={directive}
              onClick={() => handleSimulateSpeech(directive.replace(/"/g, ''))}
              style={{
                background: isLight ? '#ffffff' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${styles.border}`,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.7rem',
                color: styles.text,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {directive}
            </button>
          ))}
        </div>

        {/* Modal Controls Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: `1px solid ${styles.border}`,
            background: styles.cardBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleToggleConnection}
              style={{
                background: sessionState === 'disconnected' ? styles.accent : 'rgba(239, 68, 68, 0.2)',
                color: sessionState === 'disconnected' ? '#ffffff' : '#ef4444',
                border: sessionState === 'disconnected' ? 'none' : '1px solid #ef4444',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              data-testid="toggle-voice-btn"
            >
              <Mic size={14} />
              {sessionState === 'disconnected' ? 'Start Voice Pairing' : 'Disconnect'}
            </button>

            {sessionState !== 'disconnected' && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  background: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  color: isMuted ? '#ef4444' : styles.text,
                  border: `1px solid ${styles.border}`,
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem'
                }}
              >
                {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                {isMuted ? 'Muted' : 'Mute'}
              </button>
            )}
          </div>

          {onDispatchToOrchestrator && messages.length > 1 && (
            <button
              onClick={() => {
                const lastUser = [...messages].reverse().find((m) => m.sender === 'user');
                if (lastUser) onDispatchToOrchestrator(lastUser.text);
                onClose();
              }}
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '6px',
                padding: '8px 14px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Dispatch to Review Loop</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
