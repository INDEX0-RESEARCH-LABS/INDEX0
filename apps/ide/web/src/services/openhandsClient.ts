/**
 * OpenHands Autonomous Agent Client & LLM Profile Bridge — @index0/ide-web
 * Manages OpenHands workbench connectivity, multi-provider LLM profile selection,
 * and workspace system guardrail injection.
 */

export interface ILLMProfile {
  provider: 'anthropic' | 'openai' | 'deepseek' | 'ollama' | 'vllm' | string;
  model: string;
  api_key_env: string | null;
  base_url: string | null;
  recommended_for: string;
  max_tokens: number;
  temperature: number;
  is_local?: boolean;
}

export interface ILLMProfilesConfig {
  version: string;
  description: string;
  default_profile: string;
  profiles: Record<string, ILLMProfile>;
}

export interface IOpenHandsGuardrailStatus {
  valid: boolean;
  missingRules: string[];
  detectedRules: string[];
}

export const MANDATORY_GUARDRAILS = [
  'Contract First',
  'Option A Architecture Compliance',
  'Execution Sandboxing',
  'Tests Are Mandatory',
  'Zero Secrets in Git',
  'Small, Atomic Commits'
] as const;

export const DEFAULT_LLM_PROFILES: ILLMProfilesConfig = {
  version: '1.0',
  description: 'Standardized LLM connection profiles for OpenHands Autonomous Agent Workbench in INDEX0 AI',
  default_profile: 'anthropic-claude',
  profiles: {
    'anthropic-claude': {
      provider: 'anthropic',
      model: 'anthropic/claude-3-5-sonnet-20241022',
      api_key_env: 'LLM_API_KEY',
      base_url: null,
      recommended_for: 'Complex agentic reasoning, multi-file code editing, and full repository planning',
      max_tokens: 8192,
      temperature: 0.0,
      is_local: false
    },
    'openai-gpt4o': {
      provider: 'openai',
      model: 'openai/gpt-4o',
      api_key_env: 'LLM_API_KEY',
      base_url: null,
      recommended_for: 'General code generation, test authoring, and documentation tasks',
      max_tokens: 4096,
      temperature: 0.2,
      is_local: false
    },
    'deepseek-coder': {
      provider: 'deepseek',
      model: 'deepseek/deepseek-coder',
      api_key_env: 'LLM_API_KEY',
      base_url: 'https://api.deepseek.com/v1',
      recommended_for: 'Cost-effective high-performance algorithmic and system programming',
      max_tokens: 4096,
      temperature: 0.1,
      is_local: false
    },
    'local-ollama': {
      provider: 'ollama',
      model: 'ollama/llama3.1',
      api_key_env: null,
      base_url: 'http://host.docker.internal:11434',
      recommended_for: '100% offline, zero-cloud sovereign local inference',
      max_tokens: 4096,
      temperature: 0.2,
      is_local: true
    },
    'local-vllm': {
      provider: 'vllm',
      model: 'openai/meta-llama/Meta-Llama-3-8B-Instruct',
      api_key_env: null,
      base_url: 'http://host.docker.internal:8000/v1',
      recommended_for: 'Self-hosted high-throughput local GPU cluster inference',
      max_tokens: 4096,
      temperature: 0.1,
      is_local: true
    }
  }
};

export class OpenHandsService {
  private profilesConfig: ILLMProfilesConfig;

  constructor(customConfig?: Partial<ILLMProfilesConfig>) {
    this.profilesConfig = {
      ...DEFAULT_LLM_PROFILES,
      ...customConfig,
      profiles: {
        ...DEFAULT_LLM_PROFILES.profiles,
        ...(customConfig?.profiles || {})
      }
    };
  }

  public getProfiles(): ILLMProfilesConfig {
    return this.profilesConfig;
  }

  public getProfile(profileId: string): ILLMProfile | undefined {
    return this.profilesConfig.profiles[profileId];
  }

  public getDefaultProfile(): { id: string; profile: ILLMProfile } {
    const id = this.profilesConfig.default_profile;
    const profile = this.profilesConfig.profiles[id] || this.profilesConfig.profiles['anthropic-claude'];
    return { id, profile };
  }

  /**
   * Checks whether the Caddy API Gateway and OpenHands service respond to health probes on port 8000.
   */
  public async checkGatewayHealth(gatewayUrl: string = 'http://localhost:8000'): Promise<boolean> {
    try {
      const cleanUrl = gatewayUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanUrl}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }

  /**
   * Validates workspace instructions against mandatory platform guardrails.
   */
  public validateWorkspaceGuardrails(instructionsContent: string): IOpenHandsGuardrailStatus {
    const detectedRules: string[] = [];
    const missingRules: string[] = [];

    for (const rule of MANDATORY_GUARDRAILS) {
      const pattern = rule.replace(/,\s*/g, '\\s*,?\\s*').replace(/\s+/g, '\\s+');
      const regex = new RegExp(pattern, 'i');
      if (regex.test(instructionsContent)) {
        detectedRules.push(rule);
      } else {
        missingRules.push(rule);
      }
    }

    return {
      valid: missingRules.length === 0,
      detectedRules,
      missingRules
    };
  }

  /**
   * Prepend platform guardrails and contract-first instructions to user task prompt.
   */
  public formatAgentPrompt(taskPrompt: string, customInstructions?: string): string {
    const guardrailHeader = `[INDEX0 PLATFORM INSTRUCTIONS]
- All implementations must strictly conform to @index0/contracts.
- Option A Architecture: Route all requests via Caddy Gateway port 8000.
- Execute within local sandboxed containers without modifying host OS.
- Verify changes with automated tests (pnpm test).
- Zero secrets in source code.`;

    const instructions = customInstructions ? `\n\n[WORKSPACE RULES]\n${customInstructions.trim()}` : '';

    return `${guardrailHeader}${instructions}\n\n[USER TASK]\n${taskPrompt.trim()}`;
  }
}
