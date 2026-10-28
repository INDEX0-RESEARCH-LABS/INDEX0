#!/usr/bin/env node
/**
 * INDEX0 AI — Sovereign Web Search MCP Server — @index0/client-harness
 * 
 * Standard Model Context Protocol (MCP) server providing:
 * - web_search: Real-time search across Google/DuckDuckGo/Tavily/Brave
 * - fetch_web_page: Clean HTML-to-Markdown scraper for live documentation & GitHub
 * - search_documentation: Specialized official doc retriever
 * 
 * Communicates via JSON-RPC 2.0 over stdin/stdout.
 */

import * as readline from 'node:readline';
import { performWebSearch, fetchWebPage, searchDocumentation, formatSearchResultsMarkdown } from './search.js';

interface JsonRpcRequest {
  jsonrpc: string;
  id?: number | string;
  method: string;
  params?: Record<string, any>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id?: number | string | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

function sendResponse(response: JsonRpcResponse): void {
  const jsonStr = JSON.stringify(response);
  process.stdout.write(jsonStr + '\n');
}

const TOOLS_MANIFEST = [
  {
    name: 'web_search',
    description: 'Execute a live web search for real-time technical documentation, library APIs, error solutions, and latest code patterns.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query string (e.g., "LangGraph 0.2 stateful memory pattern", "React 19 useActionState migration")'
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (1-10, defaults to 5)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'fetch_web_page',
    description: 'Fetch and extract clean, readable markdown content from any web URL (documentation, GitHub issues/PRs, blogs, API specs).',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The full HTTP or HTTPS URL to fetch'
        },
        max_chars: {
          type: 'number',
          description: 'Maximum characters of text to return (defaults to 12000)'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'search_documentation',
    description: 'Search official documentation and API references for a specific library or framework.',
    inputSchema: {
      type: 'object',
      properties: {
        library: {
          type: 'string',
          description: 'Name of the library or framework (e.g. "Pydantic", "FastMCP", "Bun", "Next.js")'
        },
        topic: {
          type: 'string',
          description: 'Specific feature, function, or error message to look up'
        }
      },
      required: ['library', 'topic']
    }
  }
];

async function handleToolCall(name: string, args: Record<string, any>): Promise<string> {
  if (name === 'web_search') {
    const query = String(args.query || '').trim();
    if (!query) return 'Error: Empty search query provided.';
    const maxResults = typeof args.max_results === 'number' ? args.max_results : 5;
    const results = await performWebSearch(query, { maxResults });
    return formatSearchResultsMarkdown(results, query);
  }

  if (name === 'fetch_web_page') {
    const url = String(args.url || '').trim();
    if (!url || !url.startsWith('http')) return 'Error: Valid HTTP/HTTPS URL is required.';
    const maxChars = typeof args.max_chars === 'number' ? args.max_chars : 12000;
    const page = await fetchWebPage(url, { maxChars });
    return `# ${page.title}\n\nURL: ${page.url}\n\n---\n\n${page.content}`;
  }

  if (name === 'search_documentation') {
    const library = String(args.library || '').trim();
    const topic = String(args.topic || '').trim();
    if (!library) return 'Error: Library name is required.';
    const results = await searchDocumentation(library, topic);
    return formatSearchResultsMarkdown(results, `${library} ${topic}`);
  }

  throw new Error(`Unknown tool: ${name}`);
}

async function handleRequest(request: JsonRpcRequest): Promise<void> {
  const { id, method, params } = request;

  // 1. Initialize
  if (method === 'initialize') {
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {
            listChanged: false
          }
        },
        serverInfo: {
          name: 'index0-websearch',
          version: '1.0.0'
        }
      }
    });
    return;
  }

  // 2. Initialized Notification
  if (method === 'notifications/initialized') {
    // No response needed for notification
    return;
  }

  // 3. Ping
  if (method === 'ping') {
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: {}
    });
    return;
  }

  // 4. Tools List
  if (method === 'tools/list') {
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: {
        tools: TOOLS_MANIFEST
      }
    });
    return;
  }

  // 5. Tools Call
  if (method === 'tools/call') {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};

    try {
      const outputText = await handleToolCall(toolName, toolArgs);
      sendResponse({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: outputText
            }
          ]
        }
      });
    } catch (err: any) {
      sendResponse({
        jsonrpc: '2.0',
        id,
        result: {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Tool execution failed: ${err.message}`
            }
          ]
        }
      });
    }
    return;
  }

  // Unknown method
  if (id !== undefined) {
    sendResponse({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`
      }
    });
  }
}

export function startMcpServer(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    try {
      const request = JSON.parse(trimmed) as JsonRpcRequest;
      handleRequest(request).catch((err) => {
        if (request.id !== undefined) {
          sendResponse({
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32603,
              message: `Internal error: ${err.message}`
            }
          });
        }
      });
    } catch (err: any) {
      sendResponse({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: `Parse error: ${err.message}`
        }
      });
    }
  });

  // Handle process shutdown
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startMcpServer();
}
