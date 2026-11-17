import { Subject, HomeworkTask } from '../types';

export const SYNC_FILENAME = 'mykanban-data.json';

export interface SyncPayload {
  version: 1;
  updatedAt: string;
  subjects: Subject[];
  tasks: HomeworkTask[];
}

export interface SyncConfig {
  token: string;
  gistId: string;
  lastSyncedAt?: string;
}

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token.trim()}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
});

export async function createSecretGist(
  token: string,
  payload: SyncPayload
): Promise<{ gistId: string; updatedAt: string }> {
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
  return { gistId: data.id, updatedAt: payload.updatedAt };
}

export async function fetchGistData(
  token: string,
  gistId: string
): Promise<SyncPayload> {
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
  if (!file || !file.content) {
    throw new Error(`File "${SYNC_FILENAME}" not found in this Gist.`);
  }

  const parsed = JSON.parse(file.content) as SyncPayload;
  if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.subjects)) {
    throw new Error('Invalid MyKanban sync data format.');
  }

  return parsed;
}

export async function pushGistData(
  token: string,
  gistId: string,
  payload: SyncPayload
): Promise<void> {
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
}
