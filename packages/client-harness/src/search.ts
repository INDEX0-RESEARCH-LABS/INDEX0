/**
 * INDEX0 AI — Web Search & Documentation Retrieval Engine — @index0/client-harness
 * 
 * Provides live, real-time web search and web page extraction for agents.
 * Supports:
 * - Multi-provider web search (DuckDuckGo HTML/Lite with zero API key requirement)
 * - Optional high-speed Tavily or Brave Search backends if API keys are present
 * - High-signal HTML-to-Markdown scraper for reading documentation and GitHub repos
 * - Specialized technical query synthesizer for library documentation
 */

export interface ISearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export interface ISearchOptions {
  maxResults?: number;
  provider?: 'auto' | 'duckduckgo' | 'tavily' | 'brave';
  timeoutMs?: number;
}

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Strips HTML tags and decodes common HTML entities.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cleans DuckDuckGo redirect URLs (e.g. //duckduckgo.com/l/?uddg=https%3A%2F%2F...)
 */
function cleanRedirectUrl(rawUrl: string): string {
  try {
    if (rawUrl.startsWith('//')) {
      rawUrl = 'https:' + rawUrl;
    }
    const parsed = new URL(rawUrl);
    const uddg = parsed.searchParams.get('uddg');
    if (uddg) {
      return decodeURIComponent(uddg);
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

/**
 * Searches the web using DuckDuckGo HTML endpoint (Zero API key required).
 */
async function searchDuckDuckGo(query: string, maxResults: number, timeoutMs: number): Promise<ISearchResult[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      // Fallback to Lite version if HTML blocks
      return await searchDuckDuckGoLite(query, maxResults, timeoutMs);
    }

    const html = await response.text();
    const results: ISearchResult[] = [];

    // Parse DuckDuckGo HTML results
    // Matches: <a class="result__snippet" ...>...</a>
    // and result title / URL
    const resultBlockRegex = /<div class="result results_links[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
    let match: RegExpExecArray | null;

    while ((match = resultBlockRegex.exec(html)) !== null && results.length < maxResults) {
      const block = match[1];

      // Extract title and URL
      const titleLinkMatch = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(block) ||
        /<a[^>]+class="result__url"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(block);

      const snippetMatch = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/i.exec(block);

      if (titleLinkMatch) {
        const rawUrl = titleLinkMatch[1];
        const cleanUrl = cleanRedirectUrl(rawUrl);
        const title = stripHtml(titleLinkMatch[2]);
        const snippet = snippetMatch ? stripHtml(snippetMatch[1]) : '';

        if (cleanUrl.startsWith('http')) {
          results.push({
            title,
            url: cleanUrl,
            snippet,
            source: 'duckduckgo'
          });
        }
      }
    }

    if (results.length === 0) {
      return await searchDuckDuckGoLite(query, maxResults, timeoutMs);
    }

    return results;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return [];
    }
    return await searchDuckDuckGoLite(query, maxResults, timeoutMs);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Secondary fallback using DuckDuckGo Lite endpoint.
 */
async function searchDuckDuckGoLite(query: string, maxResults: number, timeoutMs: number): Promise<ISearchResult[]> {
  const url = `https://lite.duckduckgo.com/lite/`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `q=${encodeURIComponent(query)}`,
    });

    if (!response.ok) return [];
    const html = await response.text();
    const results: ISearchResult[] = [];

    // Table rows with result links
    const linkRegex = /<a[^>]+class="result-link"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const snippetRegex = /<td class="result-snippet">([\s\S]*?)<\/td>/gi;

    const links: Array<{ url: string; title: string }> = [];
    let lMatch: RegExpExecArray | null;
    while ((lMatch = linkRegex.exec(html)) !== null && links.length < maxResults) {
      links.push({
        url: cleanRedirectUrl(lMatch[1]),
        title: stripHtml(lMatch[2])
      });
    }

    const snippets: string[] = [];
    let sMatch: RegExpExecArray | null;
    while ((sMatch = snippetRegex.exec(html)) !== null && snippets.length < maxResults) {
      snippets.push(stripHtml(sMatch[1]));
    }

    for (let i = 0; i < links.length; i++) {
      if (links[i].url.startsWith('http')) {
        results.push({
          title: links[i].title,
          url: links[i].url,
          snippet: snippets[i] || '',
          source: 'duckduckgo-lite'
        });
      }
    }

    return results;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Searches using Tavily API if key is present.
 */
async function searchTavily(apiKey: string, query: string, maxResults: number, timeoutMs: number): Promise<ISearchResult[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: maxResults,
        search_depth: 'advanced',
        include_answer: true,
      }),
    });

    if (!res.ok) throw new Error(`Tavily HTTP ${res.status}`);
    const data = (await res.json()) as any;
    const items = data.results || [];
    return items.map((item: any) => ({
      title: item.title,
      url: item.url,
      snippet: item.content || '',
      source: 'tavily'
    }));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Searches using Brave Search API if key is present.
 */
async function searchBrave(apiKey: string, query: string, maxResults: number, timeoutMs: number): Promise<ISearchResult[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': apiKey,
      },
    });

    if (!res.ok) throw new Error(`Brave HTTP ${res.status}`);
    const data = (await res.json()) as any;
    const items = data.web?.results || [];
    return items.map((item: any) => ({
      title: item.title,
      url: item.url,
      snippet: item.description || '',
      source: 'brave'
    }));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Primary multi-backend web search function.
 * Automatically selects the best available engine.
 */
export async function performWebSearch(
  query: string,
  options: ISearchOptions = {}
): Promise<ISearchResult[]> {
  const maxResults = Math.min(Math.max(options.maxResults ?? 5, 1), 10);
  const timeoutMs = options.timeoutMs ?? 8000;
  const tavilyKey = process.env.TAVILY_API_KEY;
  const braveKey = process.env.BRAVE_API_KEY;

  if (options.provider === 'tavily' && tavilyKey) {
    try {
      return await searchTavily(tavilyKey, query, maxResults, timeoutMs);
    } catch {
      // Fallback
    }
  }

  if (options.provider === 'brave' && braveKey) {
    try {
      return await searchBrave(braveKey, query, maxResults, timeoutMs);
    } catch {
      // Fallback
    }
  }

  if (tavilyKey && (options.provider === 'auto' || !options.provider)) {
    try {
      const results = await searchTavily(tavilyKey, query, maxResults, timeoutMs);
      if (results.length > 0) return results;
    } catch {
      // Fallback to DuckDuckGo
    }
  }

  if (braveKey && (options.provider === 'auto' || !options.provider)) {
    try {
      const results = await searchBrave(braveKey, query, maxResults, timeoutMs);
      if (results.length > 0) return results;
    } catch {
      // Fallback to DuckDuckGo
    }
  }

  // Default sovereign zero-key DuckDuckGo search
  return await searchDuckDuckGo(query, maxResults, timeoutMs);
}

/**
 * Fetches any web page URL, cleans HTML noise, and returns dense, readable Markdown text.
 */
export async function fetchWebPage(
  url: string,
  options: { maxChars?: number; timeoutMs?: number } = {}
): Promise<{ title: string; content: string; url: string }> {
  const maxChars = options.maxChars ?? 12000;
  const timeoutMs = options.timeoutMs ?? 10000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,text/plain,application/json;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch web page: HTTP ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      return {
        title: url,
        content: JSON.stringify(json, null, 2).slice(0, maxChars),
        url
      };
    }

    const html = await res.text();

    // Extract title
    const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
    const title = titleMatch ? stripHtml(titleMatch[1]) : url;

    // Convert core HTML body into structured markdown text
    let clean = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');

    // Convert headings
    clean = clean.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n')
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n')
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n')
      .replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, '\n\n#### $1\n');

    // Convert code blocks
    clean = clean.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n')
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

    // Convert list items
    clean = clean.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');

    // Convert paragraphs & linebreaks
    clean = clean.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n')
      .replace(/<br\s*\/?>/gi, '\n');

    // Strip remaining tags and decode entities while preserving newlines
    clean = clean
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();

    return {
      title,
      content: clean.slice(0, maxChars),
      url
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Searches official documentation specifically for libraries or frameworks.
 */
export async function searchDocumentation(
  library: string,
  topic: string,
  options: ISearchOptions = {}
): Promise<ISearchResult[]> {
  const query = `${library} ${topic} official documentation release notes API`;
  return await performWebSearch(query, options);
}

/**
 * Formats a list of search results into readable markdown.
 */
export function formatSearchResultsMarkdown(results: ISearchResult[], query: string): string {
  if (results.length === 0) {
    return `*No search results found for query: "${query}"*`;
  }

  const lines = [
    `### Web Search Results for: "${query}"`,
    `Found ${results.length} authoritative sources:\n`
  ];

  results.forEach((r, idx) => {
    lines.push(`**[${idx + 1}] ${r.title}**`);
    lines.push(`Source: [${r.url}](${r.url})`);
    if (r.snippet) {
      lines.push(`> ${r.snippet}`);
    }
    lines.push('');
  });

  return lines.join('\n');
}
