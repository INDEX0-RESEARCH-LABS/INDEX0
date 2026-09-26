/**
 * Git-Native Agent Protocol (GNAP) Worker & Git State Store — @index0/client-harness
 * Coordinates multi-agent collaboration, review cycle state, and Git commit envelopes.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  GNAP_PATHS,
  formatGNAPCommitMessage,
  type IGNAPCommitTrailers,
  type IGNAPDiskMessage,
  type IPostcardEnvelope,
  type AgentRole,
  type PostcardMessageType
} from './contracts.js';

export interface IGNAPWorkerOptions {
  repoRoot?: string;
  agentId: string;
  agentRole: AgentRole;
}

export interface IGNAPState {
  currentCycleId: string;
  sequence: number;
  lastVerdict?: string;
  activeAgents: string[];
}

export class GNAPWorker {
  private readonly repoRoot: string;
  public readonly agentId: string;
  public readonly agentRole: AgentRole;

  constructor(options: IGNAPWorkerOptions) {
    this.repoRoot = options.repoRoot ?? process.cwd();
    this.agentId = options.agentId;
    this.agentRole = options.agentRole;
  }

  /**
   * Ensure .gnap directory structure exists in repository root.
   */
  async initializeRepository(): Promise<void> {
    const gnapRoot = path.join(this.repoRoot, GNAP_PATHS.ROOT);
    const messagesDir = path.join(this.repoRoot, GNAP_PATHS.MESSAGES);
    await fs.mkdir(gnapRoot, { recursive: true });
    await fs.mkdir(messagesDir, { recursive: true });

    const statePath = path.join(this.repoRoot, GNAP_PATHS.STATE);
    try {
      await fs.access(statePath);
    } catch {
      const initialState: IGNAPState = {
        currentCycleId: `cycle-${Date.now()}`,
        sequence: 0,
        activeAgents: [this.agentId]
      };
      await fs.writeFile(statePath, JSON.stringify(initialState, null, 2), 'utf-8');
    }
  }

  /**
   * Read current GNAP coordination state.
   */
  async getState(): Promise<IGNAPState> {
    const statePath = path.join(this.repoRoot, GNAP_PATHS.STATE);
    try {
      const data = await fs.readFile(statePath, 'utf-8');
      return JSON.parse(data) as IGNAPState;
    } catch {
      return {
        currentCycleId: `cycle-${Date.now()}`,
        sequence: 0,
        activeAgents: [this.agentId]
      };
    }
  }

  /**
   * Post a message into .gnap/messages and return formatted Git commit message with standard trailers.
   */
  async recordStep(params: {
    messageType: PostcardMessageType;
    title: string;
    summary: string;
    payload: Record<string, unknown>;
    verdict?: string;
  }): Promise<{ commitMessage: string; diskMessage: IGNAPDiskMessage }> {
    await this.initializeRepository();
    const state = await this.getState();
    const nextSeq = state.sequence + 1;

    const trailers: IGNAPCommitTrailers = {
      agentId: this.agentId,
      agentRole: this.agentRole,
      cycleId: state.currentCycleId,
      messageType: params.messageType,
      sequence: nextSeq,
      verdict: params.verdict
    };

    const commitMessage = formatGNAPCommitMessage({
      title: params.title,
      summary: params.summary,
      trailers
    });

    const envelope: IPostcardEnvelope = {
      version: '1.0',
      id: `postcard-${Date.now()}-${nextSeq}`,
      from: {
        agentId: this.agentId,
        role: this.agentRole,
        displayName: `Agent ${this.agentRole}`
      },
      to: '*',
      type: params.messageType,
      payload: params.payload,
      timestamp: new Date().toISOString()
    };

    const diskMessage: IGNAPDiskMessage = {
      envelope,
      meta: {
        writtenAt: new Date().toISOString(),
        sequence: nextSeq
      }
    };

    // Save message file
    const msgFile = path.join(
      this.repoRoot,
      GNAP_PATHS.MESSAGES,
      `${String(nextSeq).padStart(6, '0')}-${this.agentRole}-${params.messageType}.json`
    );
    await fs.writeFile(msgFile, JSON.stringify(diskMessage, null, 2), 'utf-8');

    // Update state
    state.sequence = nextSeq;
    if (params.verdict) {
      state.lastVerdict = params.verdict;
    }
    if (!state.activeAgents.includes(this.agentId)) {
      state.activeAgents.push(this.agentId);
    }
    const statePath = path.join(this.repoRoot, GNAP_PATHS.STATE);
    await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf-8');

    return { commitMessage, diskMessage };
  }
}
