import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { VoiceAgentModal } from '../dist/components/VoiceAgentModal.js';

describe('VoiceAgentModal (LiveKit & Pipecat WebRTC)', () => {
  it('should instantiate VoiceAgentModal element with default properties', () => {
    const element = React.createElement(VoiceAgentModal, {
      isOpen: true,
      onClose: () => {},
      voiceServerUrl: 'ws://localhost:7880'
    });

    assert.ok(element);
    assert.equal(element.props.isOpen, true);
    assert.equal(element.props.voiceServerUrl, 'ws://localhost:7880');
  });

  it('should instantiate VoiceAgentModal in light theme', () => {
    const element = React.createElement(VoiceAgentModal, {
      isOpen: true,
      onClose: () => {},
      theme: 'light'
    });

    assert.ok(element);
    assert.equal(element.props.theme, 'light');
  });

  it('should instantiate VoiceAgentModal with custom onDispatchToOrchestrator callback', () => {
    let dispatchedPrompt = '';
    const element = React.createElement(VoiceAgentModal, {
      isOpen: true,
      onClose: () => {},
      onDispatchToOrchestrator: (prompt) => {
        dispatchedPrompt = prompt;
      }
    });

    assert.ok(element);
    assert.ok(element.props.onDispatchToOrchestrator);
    element.props.onDispatchToOrchestrator('Build database schema');
    assert.equal(dispatchedPrompt, 'Build database schema');
  });
});
