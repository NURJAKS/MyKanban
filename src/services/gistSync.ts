import { Subject, HomeworkTask, UniversityNote } from '../types';

export const SYNC_FILENAME = 'mykanban-data.json';

export interface SyncPayload {
  version: 1;
  updatedAt: string;
  subjects: Subject[];
  tasks: HomeworkTask[];
  notes?: UniversityNote[];
}

export interface SyncConfig {
  token: string;
  gistId: string;
  lastSyncedAt?: string;
  lastSyncedVersion?: string;
}

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token.trim()}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
});

const extractGistVersion = (data: { history?: { version?: string }[]; updated_at?: string }): string => {
  return data.history?.[0]?.version || data.updated_at || '';
};

export async function createSecretGist(
  token: string,
  payload: SyncPayload
): Promise<{ gistId: string; gistVersion: string }> {
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      description: 'MyKanban Private Sync Data',
      public: false,
      files: {
        [SYNC_FILENAME]: {
          content: JSON.stringify(payload, null, 2),
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error (${res.status})`);
  }

  const data = await res.json();
  return { gistId: data.id, gistVersion: extractGistVersion(data) };
}

export async function fetchGistData(
  token: string,
  gistId: string
): Promise<{ payload: SyncPayload; gistVersion: string }> {
  const cleanId = gistId.trim().replace(/^https:\/\/gist\.github\.com\/[^/]+\//, '');
  const res = await fetch(`https://api.github.com/gists/${cleanId}`, {
    method: 'GET',
    headers: getHeaders(token),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error (${res.status})`);
  }

  const data = await res.json();
  const file = data.files?.[SYNC_FILENAME];
  if (!file || (!file.content && !file.raw_url)) {
    throw new Error(`File "${SYNC_FILENAME}" not found in this Gist.`);
  }

  let rawContent: string = file.content || '';
  if (file.truncated && file.raw_url) {
    const rawRes = await fetch(file.raw_url, { cache: 'no-store' });
    if (!rawRes.ok) {
      throw new Error(`Failed to fetch full Gist content (${rawRes.status})`);
    }
    rawContent = await rawRes.text();
  }

  const parsed = JSON.parse(rawContent) as SyncPayload;
  if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.subjects)) {
    throw new Error('Invalid MyKanban sync data format.');
  }

  return { payload: parsed, gistVersion: extractGistVersion(data) };
}

export async function pushGistData(
  token: string,
  gistId: string,
  payload: SyncPayload
): Promise<{ gistVersion: string }> {
  const cleanId = gistId.trim().replace(/^https:\/\/gist\.github\.com\/[^/]+\//, '');
  const res = await fetch(`https://api.github.com/gists/${cleanId}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify({
      files: {
        [SYNC_FILENAME]: {
          content: JSON.stringify(payload, null, 2),
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error (${res.status})`);
  }

  const data = await res.json();
  return { gistVersion: extractGistVersion(data) };
}
