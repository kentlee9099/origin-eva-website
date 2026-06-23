/**
 * GitHub API helper
 * Uses GitHub REST API to read and update repository files.
 * No backend required — calls go directly from browser.
 */

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

const CONFIG_KEY = 'github_config';
const API_BASE = 'https://api.github.com';

export function saveConfig(config: GitHubConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function loadConfig(): GitHubConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function api(path: string, token: string, opts?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts?.headers || {}),
    },
  });
}

/** Fetch file content (returns base64) */
export async function getFile(
  config: GitHubConfig,
  path: string
): Promise<{ content: string; sha: string }> {
  const res = await api(
    `/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`,
    config.token
  );
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return {
    content: json.content,
    sha: json.sha,
  };
}

/** Decode base64 content */
export function decodeBase64(str: string): string {
  return atob(str.replace(/\n/g, ''));
}

/** Encode string to base64 */
export function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

/** Update file content (commits automatically) */
export async function updateFile(
  config: GitHubConfig,
  path: string,
  content: string,
  sha: string,
  message: string
): Promise<void> {
  const res = await api(
    `/repos/${config.owner}/${config.repo}/contents/${path}`,
    config.token,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        content: encodeBase64(content),
        sha,
        branch: config.branch,
      }),
    }
  );
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
}

/** Get latest commit SHA on branch */
export async function getBranchSha(config: GitHubConfig): Promise<string> {
  const res = await api(
    `/repos/${config.owner}/${config.repo}/git/ref/heads/${config.branch}`,
    config.token
  );
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const json = await res.json();
  return json.object.sha;
}

/** Check if a commit SHA is deployed (compares to branch HEAD) */
export async function isDeployed(
  config: GitHubConfig,
  commitSha: string
): Promise<boolean> {
  try {
    const headSha = await getBranchSha(config);
    return commitSha === headSha;
  } catch {
    return false;
  }
}

/** Read translations.json from repo */
export async function fetchTranslationsJson(config: GitHubConfig) {
  const file = await getFile(config, 'src/i18n/data.json');
  const decoded = decodeBase64(file.content);
  return { data: JSON.parse(decoded), sha: file.sha };
}

/** Write translations.json to repo */
export async function pushTranslationsJson(
  config: GitHubConfig,
  data: object,
  sha: string,
  message: string
): Promise<string> {
  const content = JSON.stringify(data, null, 2);
  await updateFile(config, 'src/i18n/data.json', content, sha, message);
  // Return new commit SHA
  return getBranchSha(config);
}
