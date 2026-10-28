import test from 'node:test';
import assert from 'node:assert/strict';
import {
  performWebSearch,
  fetchWebPage,
  searchDocumentation,
  formatSearchResultsMarkdown,
  type ISearchResult
} from '../dist/search.js';

test('Search Engine — formatSearchResultsMarkdown renders clean markdown with citations', () => {
  const mockResults: ISearchResult[] = [
    {
      title: 'React 19 Release Notes',
      url: 'https://react.dev/blog/2024/04/25/react-19',
      snippet: 'React 19 introduces Actions, useActionState, and server components.'
    },
    {
      title: 'LangGraph 0.2 Python & TypeScript Docs',
      url: 'https://langchain-ai.github.io/langgraph/',
      snippet: 'Stateful multi-actor applications with LLMs.'
    }
  ];

  const md = formatSearchResultsMarkdown(mockResults, 'React 19 and LangGraph');
  assert.ok(md.includes('### Web Search Results for: "React 19 and LangGraph"'));
  assert.ok(md.includes('React 19 Release Notes'));
  assert.ok(md.includes('[https://react.dev/blog/2024/04/25/react-19]'));
  assert.ok(md.includes('> React 19 introduces Actions'));
  assert.ok(md.includes('LangGraph 0.2 Python & TypeScript Docs'));
});

test('Search Engine — formatSearchResultsMarkdown handles empty results', () => {
  const md = formatSearchResultsMarkdown([], 'nonexistent-query-xyz-12345');
  assert.ok(md.includes('No search results found'));
});

test('Search Engine — fetchWebPage extracts structured markdown from HTML', async () => {
  // Test by mocking global.fetch temporarily
  const originalFetch = global.fetch;
  try {
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>FastMCP Specification</title>
            <script>console.log("bad script");</script>
            <style>body { color: red; }</style>
          </head>
          <body>
            <nav><a href="/">Home</a></nav>
            <header>Site Header</header>
            <h1>FastMCP: The Fast Standard</h1>
            <p>FastMCP simplifies building Model Context Protocol servers in Python and TypeScript.</p>
            <pre><code>import { FastMCP } from 'fastmcp';\nconst server = new FastMCP('demo');</code></pre>
            <ul>
              <li>High performance</li>
              <li>Type-safe schemas</li>
            </ul>
            <footer>Copyright 2026</footer>
          </body>
        </html>
      `;
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    };

    const result = await fetchWebPage('https://example.com/fastmcp-docs');
    assert.equal(result.title, 'FastMCP Specification');
    assert.ok(result.content.includes('# FastMCP: The Fast Standard'));
    assert.ok(result.content.includes('FastMCP simplifies building Model Context Protocol'));
    assert.ok(result.content.includes('```\nimport { FastMCP }'));
    assert.ok(result.content.includes('- High performance'));
    assert.ok(result.content.includes('- Type-safe schemas'));
    assert.ok(!result.content.includes('bad script'));
    assert.ok(!result.content.includes('color: red'));
    assert.ok(!result.content.includes('Site Header'));
    assert.ok(!result.content.includes('Copyright 2026'));
  } finally {
    global.fetch = originalFetch;
  }
});

test('Search Engine — searchDocumentation constructs technical query and fetches', async () => {
  const originalFetch = global.fetch;
  const requestedUrls: string[] = [];
  try {
    global.fetch = async (input: RequestInfo | URL) => {
      requestedUrls.push(String(input));
      const mockHtml = `
        <div class="result results_links">
          <a class="result__url" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fbun.sh%2Fdocs">bun.sh</a>
          <a class="result__snippet" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fbun.sh%2Fdocs">Bun fast I/O documentation</a>
        </div>
        </div>
      `;
      return new Response(mockHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    };

    const results = await searchDocumentation('Bun', 'File I/O performance');
    assert.ok(requestedUrls.some((u) => u.includes('Bun')));
    assert.ok(results.length > 0);
    assert.ok(results[0].snippet.includes('Bun fast I/O'));
  } finally {
    global.fetch = originalFetch;
  }
});
