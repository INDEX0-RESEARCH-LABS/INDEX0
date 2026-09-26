import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { spawn } from 'node:child_process';
import { loadCredentials } from './auth.js';
import { TerminalSpinner } from './ui.js';

export interface ILauncherOptions {
  model?: string;
  provider?: string;
  apiBase?: string;
}

export const INDEX0_HOME = path.join(os.homedir(), '.index0');
export const INDEX0_BIN_DIR = path.join(INDEX0_HOME, 'bin');
export const INDEX0_ENGINE_BIN = path.join(INDEX0_BIN_DIR, 'index0-engine' + (os.platform() === 'win32' ? '.exe' : ''));
export const INDEX0_CONFIG_PATH = path.join(INDEX0_HOME, 'config.json');
export const INDEX0_DEFAULT_CONFIG_PATH = path.join(INDEX0_HOME, 'index0.json');
export const INDEX0_TUI_CONFIG_PATH = path.join(INDEX0_HOME, 'tui.json');
export const INDEX0_DB_PATH = path.join(INDEX0_HOME, 'index0.db');

/**
 * Initializes and guarantees all INDEX0 configurations and sovereign cloud models.
 */
export function ensureIndex0Config(options: ILauncherOptions = {}): void {
  fs.mkdirSync(INDEX0_HOME, { recursive: true });
  fs.mkdirSync(INDEX0_BIN_DIR, { recursive: true });

  // Clean up any legacy opencode.json config file
  const legacyConfig = path.join(INDEX0_HOME, 'opencode.json');
  if (fs.existsSync(legacyConfig)) {
    try {
      fs.rmSync(legacyConfig, { force: true });
    } catch {
      // Ignore cleanup error
    }
  }

  const creds = loadCredentials();
  const apiBase = options.apiBase ?? process.env.INDEX0_API_BASE ?? 'https://ai.index0.in/v1';
  const apiKey = (creds?.sessionToken && creds.sessionToken.startsWith('sk-'))
    ? creds.sessionToken
    : (process.env.INDEX0_API_KEY ?? process.env.LITELLM_MASTER_KEY ?? 'sk-index0-litellm-dev');
  const primaryModel = options.model ?? process.env.INDEX0_MODEL ?? 'azure-gpt-4o';
  const fastModel = 'azure-gpt-4o-mini';

  const configContent = {
    $schema: 'http://ai.index0.in/config.json',
    autoupdate: false,
    autoshare: false,
    enabled_providers: ['index0'],
    model: `index0/${primaryModel}`,
    small_model: `index0/${fastModel}`,
    default_agent: 'auto',
    agent: {
      build: { disable: true },
      plan: { disable: true },
      auto: {
        mode: 'primary',
        description: 'Sovereign Auto Router — Dynamically classifies intent and orchestrates the best agent (Architect, Engineer, Reviewer, or Tester).',
        prompt: 'You are the INDEX0 Sovereign Auto Orchestrator. People Over Tools. Work Verified. Time to Unplug. Dynamically classify the user request and autonomously execute or delegate to the appropriate specialized persona: ARCHITECT (planning & system design), ENGINEER (code implementation & bug fixing), REVIEWER (anti-slop audit & security review), or TESTER (test suite generation & QA verification). Strictly generate production-verified code and verify diffs before execution.'
      },
      engineer: {
        mode: 'primary',
        description: 'Sovereign Software Engineer — Autonomous code generation, feature execution, and refactoring.',
        prompt: 'You are the INDEX0 Sovereign Software Engineer. People Over Tools. Work Verified. Time to Unplug. Strictly generate production-verified code, maintain security boundaries, and verify diffs before execution.'
      },
      reviewer: {
        mode: 'primary',
        description: '4-Tier Anti-Slop Matrix — Deep code audit, regression prevention, and security verification.',
        prompt: 'You are the INDEX0 4-Tier Anti-Slop Code Reviewer. Audit diffs rigorously against hallucinated abstractions, syntax flaws, and security leaks.'
      },
      architect: {
        mode: 'primary',
        description: 'Sovereign System Architect — High-level architecture, design specifications, and technical roadmaps.',
        prompt: 'You are the INDEX0 Sovereign System Architect. Design scalable, resilient architectures and formulate precise step-by-step implementation roadmaps.'
      },
      tester: {
        mode: 'primary',
        description: 'Verification & QA Engine — Test suite generation, test execution, and runtime validation.',
        prompt: 'You are the INDEX0 QA & Verification Agent. Focus on creating comprehensive unit/integration test coverage, running diagnostics, and validating runtime correctness.'
      }
    },
    provider: {
      index0: {
        name: 'INDEX0',
        api: apiBase,
        npm: '@ai-sdk/openai-compatible',
        env: ['INDEX0_API_KEY'],
        options: {
          baseURL: apiBase,
          apiKey: apiKey
        },
        models: {
          [primaryModel]: {
            name: 'GPT-4o',
            limit: {
              context: 128000,
              output: 16384
            }
          },
          [fastModel]: {
            name: 'GPT-4o Mini',
            limit: {
              context: 128000,
              output: 16384
            }
          }
        }
      }
    },
    instructions: [
      'You are the INDEX0 Sovereign AI Engineering Assistant.',
      "World's First Sovereign Software Engineering Platform: People Over Tools. Work Verified. Time to Unplug.",
      'Strictly generate production-verified code, maintain security boundaries, and verify diffs before execution.'
    ]
  };

  fs.writeFileSync(INDEX0_CONFIG_PATH, JSON.stringify(configContent, null, 2), 'utf8');
  fs.writeFileSync(INDEX0_DEFAULT_CONFIG_PATH, JSON.stringify(configContent, null, 2), 'utf8');

  if (!fs.existsSync(INDEX0_TUI_CONFIG_PATH)) {
    const tuiConfig = {
      $schema: 'http://ai.index0.in/tui.json',
      theme: 'cursor'
    };
    fs.writeFileSync(INDEX0_TUI_CONFIG_PATH, JSON.stringify(tuiConfig, null, 2), 'utf8');
  }
}

/**
 * Patches the engine binary in-place to display 100% INDEX0 AI ASCII art
 * and branding with zero third-party visual traces.
 */
export function patchEngineBranding(binaryPath: string): void {
  try {
    if (!fs.existsSync(binaryPath)) return;
    const data = fs.readFileSync(binaryPath);
    let modified = false;

    // 1. Patch chunk-mbaw4k9t.js (TUI home screen logo)
    const startMarker = Buffer.from('\x00/$bunfs/root/chunk-mbaw4k9t.js\x00');
    const p1 = data.indexOf(startMarker);
    if (p1 !== -1) {
      const nextMarker = Buffer.from('\x00/$bunfs/root/');
      const p2 = data.indexOf(nextMarker, p1 + startMarker.length);
      if (p2 !== -1) {
        const targetLen = p2 - p1;
        const header = Buffer.from('\x00/$bunfs/root/chunk-mbaw4k9t.js\x00// @bun\n');
        const body = Buffer.from(`var _={left:[
" ▄           ▄                ",
" █   █▀▀▄ █▀▀█ █▀▀█ █  █ █▀▀█ ",
" █   █__█ █__█ █^^^  ▀▀  █/_█ ",
"▀▀▀  ▀~~▀ ▀▀▀▀ ▀▀▀▀ █  █ ▀▀▀▀ "
],right:[
"      ▄ ",
"█▀▀█  █ ",
"█^^█  █ ",
"▀  ▀ ▀▀▀"
]},t={left:[" ▄  "," █  "," █  ","▀▀▀ "],right:["    ","█▀▀█","█/_█","▀▀▀▀"]};
export{_ as Dn,t as En};
`);
        const diff = targetLen - (header.length + body.length);
        if (diff >= 0) {
          const pad = Buffer.concat([Buffer.from('/*'), Buffer.alloc(diff - 4, 32), Buffer.from('*/')]);
          const newChunk = Buffer.concat([header, body, pad]);
          newChunk.copy(data, p1);
          modified = true;
        }
      }
    }

    // 2. Patch var O in chunk-qdxq95qk.js (CLI fallback logo)
    const oMarker = Buffer.from('var O=["\u2800');
    const pOStart = data.indexOf(oMarker);
    if (pOStart !== -1) {
      const pOEndMarker = Buffer.from('"];class _');
      const pOEnd = data.indexOf(pOEndMarker, pOStart);
      if (pOEnd !== -1) {
        const endPos = pOEnd + 2;
        const targetLen = endPos - pOStart;
        const bodyO = Buffer.from(`var O=[
" ▄           ▄                         ▄  ",
" █   █▀▀▄ █▀▀█ █▀▀█ █  █ █▀▀█    █▀▀█  █  ",
" █   █  █ █  █ █▀▀▀  ▀▀  █/ █    █▀▀█  █  ",
"▀▀▀  ▀  ▀ ▀▀▀▀ ▀▀▀▀ █  █ ▀▀▀▀    ▀  ▀ ▀▀▀ "
]`);
        const diff = targetLen - bodyO.length;
        if (diff >= 0) {
          const pad = Buffer.concat([Buffer.from('/*'), Buffer.alloc(diff - 4, 32), Buffer.from('*/')]);
          const newChunk = Buffer.concat([bodyO, pad]);
          newChunk.copy(data, pOStart);
          modified = true;
        }
      }
    }

    // 3. Patch var Oa in chunk-05pv6r5f.js (TUI exit screen logo)
    const oaMarker = Buffer.from('var Oa={left:[');
    const pOaStart = data.indexOf(oaMarker);
    if (pOaStart !== -1) {
      const pOaEndMarker = Buffer.from('};function b1');
      const pOaEnd = data.indexOf(pOaEndMarker, pOaStart);
      if (pOaEnd !== -1) {
        const endPos = pOaEnd + 1;
        const targetLen = endPos - pOaStart;
        const bodyOa = Buffer.from(`var Oa={left:[
" ▄           ▄                ",
" █   █▀▀▄ █▀▀█ █▀▀█ █  █ █▀▀█ ",
" █   █__█ █__█ █^^^  ▀▀  █/_█ ",
"▀▀▀  ▀~~▀ ▀▀▀▀ ▀▀▀▀ █  █ ▀▀▀▀ "
],right:[
"      ▄ ",
"█▀▀█  █ ",
"█^^█  █ ",
"▀  ▀ ▀▀▀"
]};`);
        const diff = targetLen - bodyOa.length;
        if (diff >= 0) {
          const pad = Buffer.concat([Buffer.from('/*'), Buffer.alloc(diff - 4, 32), Buffer.from('*/')]);
          const newChunk = Buffer.concat([bodyOa, pad]);
          newChunk.copy(data, pOaStart);
          modified = true;
        }
      }
    }

    // 4. Complete eradication of legacy branding across entire CLI engine binary
    const stringReplacements: [Buffer, Buffer][] = [
      [Buffer.from("{highlight}docker run -it --rm ghcr.io/anomalyco/opencode{/highlight}"), Buffer.from("{highlight}docker run -it --rm ghcr.io/index0-labs/index0{/highlight}")],
      [Buffer.from("api.github.com/repos/anomalyco/opencode/releases/latest"), Buffer.from("api.github.com/repos/INDEX0-LABS/INDEX0/releases/latest")],
      [Buffer.from("reported automatically from the opencode crash screen"), Buffer.from("reported automatically from the INDEX0 crash screen  ")],
      [Buffer.from("upgrade opencode to the latest or a specific version"), Buffer.from("upgrade INDEX0 to the latest or a specific version  ")],
      [Buffer.from("OpenCode Zen gives you access to all the best coding"), Buffer.from("INDEX0 AI gives you access to all the best coding   ")],
      [Buffer.from("The opencode TUI crashed with an unexpected error"), Buffer.from("The INDEX0 TUI crashed with an unexpected error  ")],
      [Buffer.from("uninstall opencode and remove all related files"), Buffer.from("uninstall INDEX0 and remove all related files  ")],
      [Buffer.from("{highlight}opencode run -f file.ts{/highlight}"), Buffer.from("{highlight}index0 run -f file.ts  {/highlight}")],
      [Buffer.from("{highlight}opencode github install{/highlight}"), Buffer.from("{highlight}index0 github install  {/highlight}")],
      [Buffer.from("start opencode server and open web interface"), Buffer.from("start INDEX0 server and open web interface  ")],
      [Buffer.from("{highlight}opencode run --attach{/highlight}"), Buffer.from("{highlight}index0 run --attach  {/highlight}")],
      [Buffer.from("{highlight}opencode agent create{/highlight}"), Buffer.from("{highlight}index0 agent create  {/highlight}")],
      [Buffer.from("{highlight}opencode debug config{/highlight}"), Buffer.from("{highlight}index0 debug config  {/highlight}")],
      [Buffer.from([79,112,101,110,67,111,100,101,32,71,111,32,105,115,32,97,32,36,49,48,32,112,101,114,32,109,111,110,116,104,32,115,117,98,115,99,114,105,112,116,105,111,110]), Buffer.from("INDEX0 Pro is a paid subscription          ")],
      [Buffer.from("{highlight}opencode --continue{/highlight}"), Buffer.from("{highlight}index0 --continue  {/highlight}")],
      [Buffer.from("{highlight}opencode auth list{/highlight}"), Buffer.from("{highlight}index0 auth list  {/highlight}")],
      [Buffer.from("{highlight}/opencode fix this{/highlight}"), Buffer.from("{highlight}/index0   fix this{/highlight}")],
      [Buffer.from("{highlight}opencode upgrade{/highlight}"), Buffer.from("{highlight}index0 upgrade  {/highlight}")],
      [Buffer.from("https://github.com/anomalyco/opencode"), Buffer.from("https://github.com/INDEX0-LABS/INDEX0")],
      [Buffer.from("{highlight}opencode serve{/highlight}"), Buffer.from("{highlight}index0 serve  {/highlight}")],
      [Buffer.from("Tell OpenCode what to do differently"), Buffer.from("Tell INDEX0 what to do differently  ")],
      [Buffer.from("{highlight}opencode.json{/highlight}"), Buffer.from("{highlight}index0.json  {/highlight}")],
      [Buffer.from("attach to a running opencode server"), Buffer.from("attach to a running INDEX0 server  ")],
      [Buffer.from("{highlight}opencode run{/highlight}"), Buffer.from("{highlight}index0 run  {/highlight}")],
      [Buffer.from("starts a headless opencode server"), Buffer.from("starts a headless INDEX0 server  ")],
      [Buffer.from("anomalyco/opencode/github@latest"), Buffer.from("INDEX0-LABS/INDEX0/github@latest")],
      [Buffer.from("{highlight}/opencode{/highlight}"), Buffer.from("{highlight}/index0  {/highlight}")],
      [Buffer.from([99,111,110,115,111,108,101,46,108,111,103,40,34,111,112,101,110,99,111,100,101,32,115,101,115,115,105,111,110,34,44]), Buffer.from([99,111,110,115,111,108,101,46,108,111,103,40,34,105,110,100,101,120,48,32,32,32,115,101,115,115,105,111,110,34,44])],
      [Buffer.from("github.com/anomalyco/opencode"), Buffer.from("github.com/INDEX0-LABS/INDEX0")],
      [Buffer.from("Thank you for using OpenCode!"), Buffer.from("Thank you for using INDEX0!  ")],
      [Buffer.from([116,105,116,108,101,58,34,111,112,101,110,99,111,100,101,32,101,120,112,101,114,105,109,101,110,116,97,108]), Buffer.from([116,105,116,108,101,58,34,73,78,68,69,88,48,32,32,32,101,120,112,101,114,105,109,101,110,116,97,108])],
      [Buffer.from("run opencode with a message"), Buffer.from("run INDEX0 with a message  ")],
      [Buffer.from("until OpenCode is restarted"), Buffer.from("until INDEX0 is restarted  ")],
      [Buffer.from("ghcr.io/anomalyco/opencode"), Buffer.from("ghcr.io/index0-labs/index0")],
      [Buffer.from("You are OpenCode, the best"), Buffer.from("You are INDEX0, the best  ")],
      [Buffer.from("for opencode serve and web"), Buffer.from("for INDEX0   serve and web")],
      [Buffer.from([110,101,119,32,69,114,114,111,114,40,96,111,112,101,110,99,111,100,101,32,115,101,114,118,101,114]), Buffer.from([110,101,119,32,69,114,114,111,114,40,96,73,78,68,69,88,48,32,32,32,115,101,114,118,101,114])],
      [Buffer.from("path to start opencode in"), Buffer.from("path to start INDEX0 in  ")],
      [Buffer.from("opencode server listening"), Buffer.from("INDEX0   server listening")],
      [Buffer.from("OPENCODE_SERVER_PASSWORD"), Buffer.from("INDEX0_SERVER_PASSWORD  ")],
      [Buffer.from("OPENCODE_SERVER_USERNAME"), Buffer.from("INDEX0_SERVER_USERNAME  ")],
      [Buffer.from([116,105,116,108,101,58,34,111,112,101,110,99,111,100,101,32,72,116,116,112,65,112,105,34]), Buffer.from([116,105,116,108,101,58,34,73,78,68,69,88,48,32,32,32,72,116,116,112,65,112,105,34])],
      [Buffer.from([46,115,99,114,105,112,116,78,97,109,101,40,34,111,112,101,110,99,111,100,101,34,41]), Buffer.from([46,115,99,114,105,112,116,78,97,109,101,40,34,105,110,100,101,120,48,34,41,32,32])],
      [Buffer.from("<title>OpenCode</title>"), Buffer.from("<title>INDEX0  </title>")],
      [Buffer.from("Found opencode session:"), Buffer.from("Found INDEX0 session:  ")],
      [Buffer.from("defaults to 'opencode'"), Buffer.from("defaults to 'index0'  ")],
      [Buffer.from("and enable OpenCode Go"), Buffer.from("and enable INDEX0 Pro ")],
      [Buffer.from("anomalyco/tap/opencode"), Buffer.from("index0-labs/tap/index0")],
      [Buffer.from("opencode-clipboard.png"), Buffer.from("index0  -clipboard.png")],
      [Buffer.from("fixing opencode agents"), Buffer.from("fixing INDEX0 agents  ")],
      [Buffer.from([69,114,114,111,114,40,96,111,112,101,110,99,111,100,101,32,115,101,114,118,101,114]), Buffer.from([69,114,114,111,114,40,96,73,78,68,69,88,48,32,32,32,115,101,114,118,101,114])],
      [Buffer.from([92,120,66,55,32,79,112,101,110,67,111,100,101,60,47,116,105,116,108,101,62]), Buffer.from([92,120,66,55,32,73,78,68,69,88,48,32,32,60,47,116,105,116,108,101,62])],
      [Buffer.from([97,114,105,97,45,108,97,98,101,108,61,34,79,112,101,110,67,111,100,101,34]), Buffer.from([97,114,105,97,45,108,97,98,101,108,61,34,73,78,68,69,88,48,32,32,34])],
      [Buffer.from([40,34,97,99,116,105,118,101,34,44,34,111,112,101,110,99,111,100,101,34,41]), Buffer.from([40,34,97,99,116,105,118,101,34,44,34,105,110,100,101,120,48,32,32,34,41])],
      [Buffer.from("prompt opencode runs"), Buffer.from("prompt INDEX0 runs  ")],
      [Buffer.from([110,97,109,101,58,34,79,112,101,110,67,111,100,101,32,90,101,110,34]), Buffer.from([110,97,109,101,58,34,73,78,68,69,88,48,32,65,73,32,32,32,34])],
      [Buffer.from("https://opencode.ai"), Buffer.from("http://ai.index0.in")],
      [Buffer.from("opencode auth login"), Buffer.from("index0   auth login")],
      [Buffer.from("start opencode tui"), Buffer.from("start INDEX0 TUI  ")],
      [Buffer.from([34,116,104,101,109,101,34,44,34,111,112,101,110,99,111,100,101,34]), Buffer.from([34,116,104,101,109,101,34,44,34,105,110,100,101,120,48,32,32,34])],
      [Buffer.from("Uninstall OpenCode"), Buffer.from("Uninstall INDEX0  ")],
      [Buffer.from("~/.config/opencode"), Buffer.from("~/.config/index0  ")],
      [Buffer.from("[opencode session]"), Buffer.from("[index0   session]")],
      [Buffer.from("then run opencode"), Buffer.from("then run INDEX0  ")],
      [Buffer.from([97,99,116,105,118,101,58,34,111,112,101,110,99,111,100,101,34]), Buffer.from([97,99,116,105,118,101,58,34,105,110,100,101,120,48,32,32,34])],
      [Buffer.from("c.themes.opencode"), Buffer.from("c.themes.index0  ")],
      [Buffer.from("OpenCode instance"), Buffer.from("INDEX0 instance  ")],
      [Buffer.from("OPENCODE_API_KEY"), Buffer.from("INDEX0_API_KEY  ")],
      [Buffer.from("opencode crashed"), Buffer.from("INDEX0 crashed  ")],
      [Buffer.from("OpenCode session"), Buffer.from("INDEX0 session  ")],
      [Buffer.from("OpenCode process"), Buffer.from("INDEX0 process  ")],
      [Buffer.from("opencode.ai/zen"), Buffer.from("index0.in/zen  ")],
      [Buffer.from("OpenCode server"), Buffer.from("INDEX0 server  ")],
      [Buffer.from("OpenCode Server"), Buffer.from("INDEX0 Server  ")],
      [Buffer.from("OpenCode system"), Buffer.from("INDEX0 system  ")],
      [Buffer.from("OpenCode config"), Buffer.from("INDEX0 config  ")],
      [Buffer.from("opencode models"), Buffer.from("index0   models")],
      [Buffer.from([34,111,112,101,110,99,111,100,101,46,106,115,111,110,34]), Buffer.from([34,105,110,100,101,120,48,46,106,115,111,110,34,32,32])],
      [Buffer.from("opencode.status"), Buffer.from("index0.status  ")],
      [Buffer.from("opencode.local"), Buffer.from("index0.local  ")],
      [Buffer.from("about OpenCode"), Buffer.from("about INDEX0  ")],
      [Buffer.from("OpenCode state"), Buffer.from("INDEX0 state  ")],
      [Buffer.from("opencode.jsonc"), Buffer.from("index0.jsonc  ")],
      [Buffer.from("opencode.debug"), Buffer.from("index0.debug  ")],
      [Buffer.from("opencode:{id:"), Buffer.from("index0  :{id:")],
      [Buffer.from("anomalyco/tap"), Buffer.from("index0-labs/t")],
      [Buffer.from("does OpenCode"), Buffer.from("does INDEX0  ")],
      [Buffer.from("with OpenCode"), Buffer.from("with INDEX0  ")],
      [Buffer.from("from OpenCode"), Buffer.from("from INDEX0  ")],
      [Buffer.from("opencode.mode"), Buffer.from("index0.mode  ")],
      [Buffer.from("can OpenCode"), Buffer.from("can INDEX0  ")],
      [Buffer.from("opencode:Xa"), Buffer.from("index0  :Xa")],
      [Buffer.from("in OpenCode"), Buffer.from("in INDEX0  ")],
      [Buffer.from("by OpenCode"), Buffer.from("by INDEX0  ")],
      [Buffer.from("'opencode'"), Buffer.from("'index0'  ")],
      [Buffer.from(".opencode/"), Buffer.from(".index0  /")],
      [Buffer.from([47,36,98,117,110,102,115,47,114,111,111,116,47,111,112,101,110,99,111,100,101,45,119,101,98,45,117,105,46,103,101,110,46,106,115]), Buffer.from([47,36,98,117,110,102,115,47,114,111,111,116,47,105,110,100,101,120,48,32,32,45,119,101,98,45,117,105,46,103,101,110,46,106,115])],
      [Buffer.from("packages/opencode/src/cli/cmd/run/"), Buffer.from("packages/index0  /src/cli/cmd/run/")],
      [Buffer.from("creating opencode's own configurat"), Buffer.from("creating INDEX0's   own configurat")],
      [Buffer.from("Upgrade opencode to the specified"), Buffer.from("Upgrade INDEX0   to the specified")],
      [Buffer.from([100,101,115,99,114,105,98,101,58,34,111,112,101,110,99,111,100,101,32,97,117,116,104,32,112,114,111,118,105,100,101,114]), Buffer.from([100,101,115,99,114,105,98,101,58,34,105,110,100,101,120,48,32,32,32,97,117,116,104,32,112,114,111,118,105,100,101,114])],
      [Buffer.from("You are opencode, an interactive"), Buffer.from("You are INDEX0,   an interactive")],
      [Buffer.from("Note, opencode does not support"), Buffer.from("Note, INDEX0   does not support")],
      [Buffer.from("e.g., opencode x @modelcontextp"), Buffer.from("e.g., index0   x @modelcontextp")],
      [Buffer.from("openai, opencode, or anthropic"), Buffer.from("openai, index0  , or anthropic")],
      [Buffer.from("github/workflows/opencode.yml"), Buffer.from("github/workflows/index0.yml  ")],
      [Buffer.from([40,91,97,45,122,48,45,57,45,93,43,92,46,41,42,111,112,101,110,99,111,100,101,92,46,97,105,36]), Buffer.from([40,91,97,45,122,48,45,57,45,93,43,92,46,41,42,105,110,100,101,120,48,92,46,97,105,36,32,32])],
      [Buffer.from([104,105,110,116,58,123,111,112,101,110,99,111,100,101,58,34,114,101,99,111,109,109,101,110,100,101,100,34]), Buffer.from([104,105,110,116,58,123,105,110,100,101,120,48,32,32,58,34,114,101,99,111,109,109,101,110,100,101,100,34])],
      [Buffer.from("directly asks about opencode"), Buffer.from("directly asks about INDEX0  ")],
      [Buffer.from("Application Support/opencode"), Buffer.from("Application Support/index0  ")],
      [Buffer.from("discord.com/invite/opencode"), Buffer.from("discord.com/invite/index0  ")],
      [Buffer.from("the opencode infrastructure"), Buffer.from("the INDEX0   infrastructure")],
      [Buffer.from([83,46,109,97,107,101,40,34,111,112,101,110,99,111,100,101,45,105,110,115,116,97,110,99,101,34,41]), Buffer.from([83,46,109,97,107,101,40,34,105,110,100,101,120,48,32,32,45,105,110,115,116,97,110,99,101,34,41])],
      [Buffer.from("__opencode_custom_provider_"), Buffer.from("__index000_custom_provider_")],
      [Buffer.from("https://models.opencode.ai"), Buffer.from("http://models.ai.index0.in")],
      [Buffer.from([115,117,109,109,97,114,121,58,34,85,112,103,114,97,100,101,32,111,112,101,110,99,111,100,101,34]), Buffer.from([115,117,109,109,97,114,121,58,34,85,112,103,114,97,100,101,32,73,78,68,69,88,48,32,32,34])],
      [Buffer.from([100,101,115,99,114,105,112,116,105,111,110,58,34,111,112,101,110,99,111,100,101,32,97,112,105,34]), Buffer.from([100,101,115,99,114,105,112,116,105,111,110,58,34,73,78,68,69,88,48,32,32,32,97,112,105,34])],
      [Buffer.from("You are opencode, an agent"), Buffer.from("You are INDEX0,   an agent")],
      [Buffer.from("opencode-openai-codex-auth"), Buffer.from("index0-openai-codex-auth  ")],
      [Buffer.from("opencode's command loader"), Buffer.from("index0's   command loader")],
      [Buffer.from("opencode is not installed"), Buffer.from("INDEX0   is not installed")],
      [Buffer.from("opencode is installed but"), Buffer.from("INDEX0   is installed but")],
      [Buffer.from("opencode exited with code"), Buffer.from("INDEX0   exited with code")],
      [Buffer.from([117,46,115,116,97,114,116,115,87,105,116,104,40,34,111,112,101,110,99,111,100,101,32,34,41]), Buffer.from([117,46,115,116,97,114,116,115,87,105,116,104,40,34,105,110,100,101,120,48,32,32,32,34,41])],
      [Buffer.from("http://opencode.internal"), Buffer.from("http://index000.internal")],
      [Buffer.from("CustomizeOpencodeContent"), Buffer.from("CustomizeIndex0Content  ")],
      [Buffer.from("opencode-theme-css-light"), Buffer.from("index0-theme-css-light  ")],
      [Buffer.from("opencode is installed to"), Buffer.from("INDEX0   is installed to")],
      [Buffer.from("opencode upgrade skipped"), Buffer.from("INDEX0   upgrade skipped")],
      [Buffer.from("choco uninstall opencode"), Buffer.from("choco uninstall index0  ")],
      [Buffer.from("scoop uninstall opencode"), Buffer.from("scoop uninstall index0  ")],
      [Buffer.from("opencode-titlebar-center"), Buffer.from("index0-0-titlebar-center")],
      [Buffer.from("help with using opencode"), Buffer.from("help with using INDEX0  ")],
      [Buffer.from("opencode-oauth-dummy-key"), Buffer.from("index0-oauth-dummy-key  ")],
      [Buffer.from("https://api.opencode.ai"), Buffer.from("http://api.ai.index0.in")],
      [Buffer.from("https://app.opencode.ai"), Buffer.from("http://app.ai.index0.in")],
      [Buffer.from("https://dev.opencode.ai"), Buffer.from("http://dev.ai.index0.in")],
      [Buffer.from("opencode-theme-css-dark"), Buffer.from("index0-theme-css-dark  ")],
      [Buffer.from([85,115,101,114,45,65,103,101,110,116,34,93,61,96,111,112,101,110,99,111,100,101,47]), Buffer.from([85,115,101,114,45,65,103,101,110,116,34,93,61,96,105,110,100,101,120,48,47,32,32])],
      [Buffer.from("_work/opencode/opencode"), Buffer.from("_work/index0  /index0  ")],
      [Buffer.from("brew uninstall opencode"), Buffer.from("brew uninstall index0  ")],
      [Buffer.from("opencode's skill loader"), Buffer.from("index0's   skill loader")],
      [Buffer.from("opencode-titlebar-right"), Buffer.from("index0-0-titlebar-right")],
      [Buffer.from("opencode-v2-icon-sprite"), Buffer.from("index0-0-v2-icon-sprite")],
      [Buffer.from([83,46,109,97,107,101,40,34,111,112,101,110,99,111,100,101,45,114,111,111,116,34,41]), Buffer.from([83,46,109,97,107,101,40,34,105,110,100,101,120,48,32,32,45,114,111,111,116,34,41])],
      [Buffer.from([85,115,101,114,45,65,103,101,110,116,34,58,96,111,112,101,110,99,111,100,101,47]), Buffer.from([85,115,101,114,45,65,103,101,110,116,34,58,96,105,110,100,101,120,48,47,32,32])],
      [Buffer.from([85,115,101,114,45,65,103,101,110,116,34,44,96,111,112,101,110,99,111,100,101,47]), Buffer.from([85,115,101,114,45,65,103,101,110,116,34,44,96,105,110,100,101,120,48,47,32,32])],
      [Buffer.from("opencode-titlebar-left"), Buffer.from("index0-0-titlebar-left")],
      [Buffer.from("with: opencode mcp add"), Buffer.from("with: index0   mcp add")],
      [Buffer.from("opencode-github-action"), Buffer.from("index0-github-action  ")],
      [Buffer.from("opencode-color-scheme"), Buffer.from("index0-color-scheme  ")],
      [Buffer.from("/.well-known/opencode"), Buffer.from("/.well-known/index0  ")],
      [Buffer.from("opencode-line-comment"), Buffer.from("index0-0-line-comment")],
      [Buffer.from("opencode-find-current"), Buffer.from("index0-0-find-current")],
      [Buffer.from("opencode:session-tabs"), Buffer.from("index0-0:session-tabs")],
      [Buffer.from("does opencode have..."), Buffer.from("does INDEX0   have...")],
      [Buffer.from([110,97,109,101,58,34,111,112,101,110,99,111,100,101,45,100,101,98,117,103,34]), Buffer.from([110,97,109,101,58,34,105,110,100,101,120,48,45,100,101,98,117,103,32,32,34])],
      [Buffer.from("opencode-copilot-auth"), Buffer.from("index0-copilot-auth  ")],
      [Buffer.from("createOpencodeClient"), Buffer.from("createIndex0AIClient")],
      [Buffer.from("x-opencode-directory"), Buffer.from("x-index0-0-directory")],
      [Buffer.from("x-opencode-workspace"), Buffer.from("x-index0-0-workspace")],
      [Buffer.from("{opencode:0,openai:1"), Buffer.from("{index0  :0,openai:1")],
      [Buffer.from("opencode-icon-sprite"), Buffer.from("index0-0-icon-sprite")],
      [Buffer.from("Starting opencode..."), Buffer.from("Starting INDEX0...  ")],
      [Buffer.from("opencode-gemini-auth"), Buffer.from("index0-gemini-auth  ")],
      [Buffer.from("opencode-theme-css-"), Buffer.from("index0-theme-css-  ")],
      [Buffer.from("--opencode-diffs-bg"), Buffer.from("--index0-0-diffs-bg")],
      [Buffer.from("opencode.workspace."), Buffer.from("index0.0.workspace.")],
      [Buffer.from("opencode-plain-text"), Buffer.from("index0-plain-text  ")],
      [Buffer.from("opencode-jdtls-data"), Buffer.from("index0-jdtls-data  ")],
      [Buffer.from("x-opencode-project"), Buffer.from("x-index0-0-project")],
      [Buffer.from("x-opencode-session"), Buffer.from("x-index0-0-session")],
      [Buffer.from("x-opencode-request"), Buffer.from("x-index0-0-request")],
      [Buffer.from("opencode.settings."), Buffer.from("index0.0.settings.")],
      [Buffer.from("can opencode do..."), Buffer.from("can INDEX0   do...")],
      [Buffer.from("from opencode docs"), Buffer.from("from INDEX0   docs")],
      [Buffer.from("opencode-foo@1.2.3"), Buffer.from("index0-foo@1.2.3  ")],
      [Buffer.from("customize-opencode"), Buffer.from("customize-index0  ")],
      [Buffer.from("opencode:deep-link"), Buffer.from("index0:deep-link  ")],
      [Buffer.from("opencode-clipboard"), Buffer.from("index0  -clipboard")],
      [Buffer.from("x-opencode-client"), Buffer.from("x-index0-0-client")],
      [Buffer.from("x-opencode-ticket"), Buffer.from("x-index0-0-ticket")],
      [Buffer.from("opencode-theme-id"), Buffer.from("index0-theme-id  ")],
      [Buffer.from("opencode-D7rBuNi7"), Buffer.from("index000-D7rBuNi7")],
      [Buffer.from("opencode-v2-icon-"), Buffer.from("index0-0-v2-icon-")],
      [Buffer.from("opencode version:"), Buffer.from("INDEX0   version:")],
      [Buffer.from("x-opencode-title"), Buffer.from("x-index0-0-title")],
      [Buffer.from("opencode.global."), Buffer.from("index0.0.global.")],
      [Buffer.from("install-opencode"), Buffer.from("install-index0  ")],
      [Buffer.from("opencode-version"), Buffer.from("index0-version  ")],
      [Buffer.from("opencode-desktop"), Buffer.from("index0-desktop  ")],
      [Buffer.from("opencode.default"), Buffer.from("index0.default  ")],
      [Buffer.from("x-opencode-sync"), Buffer.from("x-index0-0-sync")],
      [Buffer.from("opencode-drafts"), Buffer.from("index0-0-drafts")],
      [Buffer.from("opencodeComment"), Buffer.from("index000Comment")],
      [Buffer.from("opencode.window"), Buffer.from("index0.0.window")],
      [Buffer.from("opencode.draft."), Buffer.from("index0.0.draft.")],
      [Buffer.from("opencode.client"), Buffer.from("index0.client  ")],
      [Buffer.from("OpencodeClient"), Buffer.from("Index0AIClient")],
      [Buffer.from("OpencodePlugin"), Buffer.from("Index0AIPlugin")],
      [Buffer.from("opencode-icon-"), Buffer.from("index0-0-icon-")],
      [Buffer.from("opencode-agent"), Buffer.from("index0-agent  ")],
      [Buffer.from("opencode-share"), Buffer.from("index0-share  ")],
      [Buffer.from("opencode-login"), Buffer.from("index0-login  ")],
      [Buffer.from("%27opencode%27"), Buffer.from("%27index0  %27")],
      [Buffer.from("@opencode-ai/"), Buffer.from("@index0-ai/  ")],
      [Buffer.from("opencode-find"), Buffer.from("index0-0-find")],
      [Buffer.from([111,112,101,110,99,111,100,101,45,36,123,110,125]), Buffer.from([105,110,100,101,120,48,32,32,45,36,123,110,125])],
      [Buffer.from("/etc/opencode"), Buffer.from("/etc/index0  ")],
      [Buffer.from("opencode-test"), Buffer.from("index0-test  ")],
      [Buffer.from("opencode.json"), Buffer.from("index0.json  ")],
      [Buffer.from("opencodeCheck"), Buffer.from("index000Check")],
      [Buffer.from("opencode.log"), Buffer.from("index0.log  ")],
      [Buffer.from("opencode.run"), Buffer.from("index0.run  ")],
      [Buffer.from("opencode-cli"), Buffer.from("index0-cli  ")],
      [Buffer.from("opencode-bar"), Buffer.from("index0-bar  ")],
      [Buffer.from([96,111,112,101,110,99,111,100,101,47,36,123]), Buffer.from([96,105,110,100,101,120,48,32,32,47,36,123])],
      [Buffer.from([96,111,112,101,110,99,111,100,101,45,36,123]), Buffer.from([96,105,110,100,101,120,48,32,32,45,36,123])],
      [Buffer.from("opencode.ai"), Buffer.from("index0.ai  ")],
      [Buffer.from("opencode://"), Buffer.from("index0://  ")],
      [Buffer.from("opencode.db"), Buffer.from("index0.db  ")],
      [Buffer.from("opencode-go"), Buffer.from("index0-pro ")],
      [Buffer.from("opencode-ai"), Buffer.from("index0-ai  ")],
      [Buffer.from([34,111,112,101,110,99,111,100,101,46,34]), Buffer.from([34,105,110,100,101,120,48,46,32,32,34])],
      [Buffer.from([111,112,101,110,99,111,100,101,227,129,140]), Buffer.from([105,110,100,101,120,48,32,32,227,129,140])],
      [Buffer.from([111,112,101,110,99,111,100,101,227,129,175]), Buffer.from([105,110,100,101,120,48,32,32,227,129,175])],
      [Buffer.from([111,112,101,110,99,111,100,101,234,176,128]), Buffer.from([105,110,100,101,120,48,32,32,234,176,128])],
      [Buffer.from([111,112,101,110,99,111,100,101,45,213,168]), Buffer.from([105,110,100,101,120,48,32,32,45,213,168])],
      [Buffer.from("@opencode/"), Buffer.from("@index0  /")],
      [Buffer.from("# opencode"), Buffer.from("# index0  ")],
      [Buffer.from("~opencode/"), Buffer.from("~index0  /")],
      [Buffer.from("opencode:0"), Buffer.from("index0  :0")],
      [Buffer.from("opencodea "), Buffer.from("INDEX0    ")],
      [Buffer.from("opencode@"), Buffer.from("index0  @")],
      [Buffer.from("/opencode"), Buffer.from("/index0  ")],
      [Buffer.from("opencode:"), Buffer.from("index0  :")],
      [Buffer.from(".opencode"), Buffer.from(".index0  ")],
      [Buffer.from("OPENCODE_"), Buffer.from("INDEX0___")],
      [Buffer.from("OPENCODE"), Buffer.from("INDEX0__")],
      [Buffer.from("OpenCode"), Buffer.from("INDEX0  ")],
      [Buffer.from("Opencode"), Buffer.from("Index0AI")],
      [Buffer.from([34,111,112,101,110,99,111,100,101,34]), Buffer.from([34,105,110,100,101,120,48,34,32,32])],
      [Buffer.from("opencode "), Buffer.from("index0   ")],
      [Buffer.from(" opencode"), Buffer.from(" index0  ")],
    ];

    for (const [target, replacement] of stringReplacements) {
      let idx = 0;
      while ((idx = data.indexOf(target, idx)) !== -1) {
        replacement.copy(data, idx);
        idx += target.length;
        modified = true;
      }
    }

    if (modified) {
      const tmpPath = binaryPath + '.tmp.' + Math.random().toString(36).slice(2);
      try {
        fs.writeFileSync(tmpPath, data);
        fs.chmodSync(tmpPath, 0o755);
        fs.renameSync(tmpPath, binaryPath);
      } catch {
        fs.writeFileSync(binaryPath, data);
      }
    }
  } catch {
    // Non-fatal branding application
  }
}

/**
 * Ensures the native TUI engine binary is present and executable.
 */
export async function ensureEngineBinary(): Promise<string> {
  if (fs.existsSync(INDEX0_ENGINE_BIN)) {
    try {
      fs.accessSync(INDEX0_ENGINE_BIN, fs.constants.X_OK);
      patchEngineBranding(INDEX0_ENGINE_BIN);
      return INDEX0_ENGINE_BIN;
    } catch {
      fs.chmodSync(INDEX0_ENGINE_BIN, 0o755);
      patchEngineBranding(INDEX0_ENGINE_BIN);
      return INDEX0_ENGINE_BIN;
    }
  }

  // 1. Check if binary is installed on the host
  const candidatePaths = [
    INDEX0_ENGINE_BIN,
    path.join(os.homedir(), '.local', 'bin', 'index0-engine')
  ];

  for (const cand of candidatePaths) {
    if (fs.existsSync(cand)) {
      try {
        fs.mkdirSync(INDEX0_BIN_DIR, { recursive: true });
        fs.copyFileSync(cand, INDEX0_ENGINE_BIN);
        fs.chmodSync(INDEX0_ENGINE_BIN, 0o755);
        patchEngineBranding(INDEX0_ENGINE_BIN);
        return INDEX0_ENGINE_BIN;
      } catch {
        // Fallback to downloading
      }
    }
  }

  // 2. Download from official release distribution
  const platform = os.platform();
  const arch = os.arch();
  let platStr = 'linux';
  if (platform === 'darwin') platStr = 'darwin';
  else if (platform === 'win32') platStr = 'windows';

  let archStr = 'x64';
  if (arch === 'arm64') archStr = 'arm64';

  const ext = platStr === 'windows' ? 'zip' : 'tar.gz';

  const spinner = new TerminalSpinner(`Bootstrapping INDEX0 Sovereign Engine (${platStr}-${archStr})...`).start();
  try {
    // Primary: INDEX0 Sovereign CDN
    const cdnUrl = `https://ai.index0.in/releases/index0-engine-${platStr}-${archStr}.${ext}`;
    let res = await fetch(cdnUrl);
    if (!res.ok) {
      // Upstream fallback
      const upstreamUrl = `https://github.com/anomalyco/opencode/releases/download/v1.18.32/opencode-${platStr}-${archStr}.${ext}`;
      res = await fetch(upstreamUrl);
    }
    if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempFile = path.join(INDEX0_HOME, `engine-dl.${ext}`);
    fs.writeFileSync(tempFile, buffer);

    if (ext === 'tar.gz') {
      const { execSync } = await import('node:child_process');
      execSync(`tar -xzf "${tempFile}" -C "${INDEX0_BIN_DIR}"`, { stdio: 'ignore' });
      const extractedBin = path.join(INDEX0_BIN_DIR, 'opencode');
      if (fs.existsSync(extractedBin)) {
        fs.renameSync(extractedBin, INDEX0_ENGINE_BIN);
      }
    }
    fs.rmSync(tempFile, { force: true });
    fs.chmodSync(INDEX0_ENGINE_BIN, 0o755);
    patchEngineBranding(INDEX0_ENGINE_BIN);
    spinner.succeed('INDEX0 Sovereign Engine bootstrapped successfully');
    return INDEX0_ENGINE_BIN;
  } catch (err: any) {
    spinner.fail(`Failed to bootstrap engine: ${err.message}`);
    throw err;
  }
}

/**
 * Launches the 100% full-screen interactive TUI or headless run command.
 */
export async function launchTui(args: string[] = []): Promise<number> {
  ensureIndex0Config();
  const enginePath = await ensureEngineBinary();

  const creds = loadCredentials();
  const apiKey = (creds?.sessionToken && creds.sessionToken.startsWith('sk-'))
    ? creds.sessionToken
    : (process.env.INDEX0_API_KEY ?? process.env.LITELLM_MASTER_KEY ?? 'sk-index0-litellm-dev');

  return new Promise((resolve) => {
    const child = spawn(enginePath, args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        INDEX0___CONFIG_DIR: INDEX0_HOME,
        INDEX0___CONFIG: INDEX0_CONFIG_PATH,
        INDEX0___TUI_CONFIG: INDEX0_TUI_CONFIG_PATH,
        INDEX0___DB: INDEX0_DB_PATH,
        INDEX0___DISABLE_AUTOUPDATE: '1',
        INDEX0___DISABLE_SHARE: '1',
        INDEX0___DISABLE_TERMINAL_TITLE: '1',
        INDEX0_CONFIG_DIR: INDEX0_HOME,
        INDEX0_CONFIG: INDEX0_CONFIG_PATH,
        INDEX0_TUI_CONFIG: INDEX0_TUI_CONFIG_PATH,
        INDEX0_DB: INDEX0_DB_PATH,
        INDEX0_DISABLE_AUTOUPDATE: '1',
        INDEX0_DISABLE_SHARE: '1',
        INDEX0_DISABLE_TERMINAL_TITLE: '1',
        INDEX0_API_KEY: apiKey
      }
    });

    child.on('close', (code) => {
      resolve(code ?? 0);
    });

    child.on('error', (err) => {
      console.error(`
Failed to start INDEX0 TUI: ${err.message}
`);
      resolve(1);
    });
  });
}
