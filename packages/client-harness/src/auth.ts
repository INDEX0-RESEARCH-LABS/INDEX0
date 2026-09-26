/**
 * INDEX0 AI — GitHub Device Flow Authentication
 * @index0/client-harness
 *
 * Implements GitHub OAuth Device Flow for CLI login (same pattern as `gh auth login`).
 * - No browser redirect server needed
 * - No client secret required (public client)
 * - Token stored at ~/.index0/credentials.json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

// ─── GitHub OAuth App Configuration ─────────────────────────────────────────

/**
 * INDEX0 GitHub OAuth App Client ID (public — safe to embed in CLI).
 * Create yours at: https://github.com/settings/developers → OAuth Apps
 */
const GITHUB_CLIENT_ID = process.env.INDEX0_GITHUB_CLIENT_ID ?? 'Ov23li8VyEodaOqcZqTH';

const GITHUB_DEVICE_CODE_URL = 'https://github.com/login/device/code';
const GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_API_URL = 'https://api.github.com/user';

// ─── Credential Storage ─────────────────────────────────────────────────────

export interface IIndex0Credentials {
  /** GitHub OAuth access token */
  githubToken: string;
  /** GitHub username */
  username: string;
  /** GitHub user email */
  email: string;
  /** GitHub avatar URL */
  avatarUrl: string;
  /** GitHub user ID */
  githubId: number;
  /** INDEX0 session token (issued by INDEX0 API after GitHub validation) */
  sessionToken?: string;
  /** Timestamp of last authentication */
  authenticatedAt: string;
}

/**
 * Returns the path to the INDEX0 credentials file: ~/.index0/credentials.json
 */
export function getCredentialsPath(): string {
  return path.join(os.homedir(), '.index0', 'credentials.json');
}

/**
 * Returns the path to the INDEX0 config directory: ~/.index0/
 */
export function getConfigDir(): string {
  return path.join(os.homedir(), '.index0');
}

/**
 * Load stored credentials from disk. Returns null if not authenticated.
 */
export function loadCredentials(): IIndex0Credentials | null {
  const credPath = getCredentialsPath();
  try {
    if (!fs.existsSync(credPath)) return null;
    const raw = fs.readFileSync(credPath, 'utf-8');
    const creds = JSON.parse(raw) as IIndex0Credentials;
    if (!creds.githubToken || !creds.username) return null;
    return creds;
  } catch {
    return null;
  }
}

/**
 * Save credentials to disk at ~/.index0/credentials.json
 */
export function saveCredentials(creds: IIndex0Credentials): void {
  const configDir = getConfigDir();
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true, mode: 0o700 });
  }
  const credPath = getCredentialsPath();
  fs.writeFileSync(credPath, JSON.stringify(creds, null, 2), { mode: 0o600 });
}

/**
 * Delete stored credentials (logout).
 */
export function clearCredentials(): boolean {
  const credPath = getCredentialsPath();
  try {
    if (fs.existsSync(credPath)) {
      fs.unlinkSync(credPath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── GitHub Device Flow ─────────────────────────────────────────────────────

interface IDeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface IAccessTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface IGitHubUser {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
  name: string | null;
}

/**
 * Step 1: Request a device code from GitHub.
 * This gives us a user_code that the user enters at github.com/login/device
 */
export async function requestDeviceCode(): Promise<IDeviceCodeResponse> {
  const response = await fetch(GITHUB_DEVICE_CODE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: 'read:user user:email',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub device code request failed [${response.status}]: ${text}`);
  }

  return (await response.json()) as IDeviceCodeResponse;
}

/**
 * Step 2: Poll GitHub for access token approval.
 * The user must enter the code at github.com/login/device and authorize.
 * We poll every `interval` seconds until approved or expired.
 */
export async function pollForAccessToken(
  deviceCode: string,
  interval: number,
  expiresIn: number,
  onPoll?: () => void
): Promise<string> {
  const deadline = Date.now() + expiresIn * 1000;
  const pollIntervalMs = Math.max(interval, 5) * 1000; // GitHub requires minimum 5s

  while (Date.now() < deadline) {
    await sleep(pollIntervalMs);
    onPoll?.();

    const response = await fetch(GITHUB_ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    if (!response.ok) {
      continue;
    }

    const data = (await response.json()) as IAccessTokenResponse;

    if (data.access_token) {
      return data.access_token;
    }

    if (data.error === 'authorization_pending') {
      continue; // User hasn't entered code yet
    }

    if (data.error === 'slow_down') {
      await sleep(5000); // Back off
      continue;
    }

    if (data.error === 'expired_token') {
      throw new Error('Device code expired. Please run `index0 login` again.');
    }

    if (data.error === 'access_denied') {
      throw new Error('Authorization denied by user.');
    }

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error} — ${data.error_description ?? ''}`);
    }
  }

  throw new Error('Device code expired. Please run `index0 login` again.');
}

/**
 * Step 3: Fetch the authenticated GitHub user's profile.
 */
export async function fetchGitHubUser(accessToken: string): Promise<IGitHubUser> {
  const response = await fetch(GITHUB_USER_API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'User-Agent': 'INDEX0-CLI',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub user API failed [${response.status}]: ${text}`);
  }

  const user = (await response.json()) as IGitHubUser;

  // If email is private, fetch from /user/emails
  if (!user.email) {
    try {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'User-Agent': 'INDEX0-CLI',
        },
      });
      if (emailRes.ok) {
        const emails = (await emailRes.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
        const primary = emails.find((e) => e.primary && e.verified);
        if (primary) {
          user.email = primary.email;
        }
      }
    } catch {
      // Non-fatal — email remains null
    }
  }

  return user;
}

/**
 * Full Device Flow login: request code → display → poll → fetch user → save.
 * Returns the credentials on success.
 */
export async function performDeviceFlowLogin(callbacks: {
  onDeviceCode: (userCode: string, verificationUri: string) => void;
  onPolling: () => void;
  onSuccess: (creds: IIndex0Credentials) => void;
  onError: (error: Error) => void;
}): Promise<IIndex0Credentials | null> {
  try {
    // 1. Request device code
    const deviceCode = await requestDeviceCode();

    // 2. Show user the code to enter
    callbacks.onDeviceCode(deviceCode.user_code, deviceCode.verification_uri);

    // 3. Try to open browser automatically
    tryOpenBrowser(deviceCode.verification_uri);

    // 4. Poll for authorization
    const accessToken = await pollForAccessToken(
      deviceCode.device_code,
      deviceCode.interval,
      deviceCode.expires_in,
      callbacks.onPolling
    );

    // 5. Fetch GitHub user profile
    const user = await fetchGitHubUser(accessToken);

    // 6. Build and save credentials
    const creds: IIndex0Credentials = {
      githubToken: accessToken,
      username: user.login,
      email: user.email ?? `${user.login}@users.noreply.github.com`,
      avatarUrl: user.avatar_url,
      githubId: user.id,
      authenticatedAt: new Date().toISOString(),
    };

    saveCredentials(creds);
    callbacks.onSuccess(creds);
    return creds;
  } catch (err: any) {
    callbacks.onError(err);
    return null;
  }
}

/**
 * Validate that stored credentials are still valid by calling GitHub API.
 */
export async function validateCredentials(creds: IIndex0Credentials): Promise<boolean> {
  try {
    const response = await fetch(GITHUB_USER_API_URL, {
      headers: {
        Authorization: `Bearer ${creds.githubToken}`,
        Accept: 'application/json',
        'User-Agent': 'INDEX0-CLI',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Try to open the verification URL in the user's default browser.
 * Non-fatal — falls back silently.
 */
function tryOpenBrowser(url: string): void {
  try {
    const { execSync } = require('node:child_process');
    const platform = process.platform;
    if (platform === 'darwin') {
      execSync(`open "${url}"`, { stdio: 'ignore' });
    } else if (platform === 'linux') {
      execSync(`xdg-open "${url}" 2>/dev/null || sensible-browser "${url}" 2>/dev/null`, { stdio: 'ignore' });
    } else if (platform === 'win32') {
      execSync(`start "" "${url}"`, { stdio: 'ignore' });
    }
  } catch {
    // Non-fatal — user can open manually
  }
}
