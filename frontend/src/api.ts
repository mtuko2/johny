export const API_URL = '/api';

// ─── Types ─────────────────────────────────────────────────────
export interface Story {
  id: string;
  title: string;
  content: string;
  author: string;
  coverUrl: string | null;
  status: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED';
  scheduledPublishAt: string | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// ─── Auth helpers ──────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem('quantum_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── General API ───────────────────────────────────────────────
export const fetchStories = async (): Promise<Story[]> => {
  const res = await fetch(`${API_URL}/stories`);
  if (!res.ok) throw new Error('Failed to fetch stories');
  return res.json();
};

export const fetchStoryById = async (id: string): Promise<Story> => {
  const res = await fetch(`${API_URL}/stories/${id}`);
  if (!res.ok) throw new Error('Failed to fetch story');
  return res.json();
};

// ─── Auth API ──────────────────────────────────────────────────
export const authRegister = async (data: { email: string; password: string; name: string }): Promise<void> => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed');
  }
};

export const authLogin = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Invalid credentials');
  }
  return res.json();
};

// ─── Protected Stories API ─────────────────────────────────────
export const adminUploadCover = async (file: File): Promise<{ url: string }> => {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: file,
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
};

export const adminFetchStories = async (): Promise<Story[]> => {
  const res = await fetch(`${API_URL}/admin/stories`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Failed to fetch stories');
  return res.json();
};

export const adminCreateStory = async (data: {
  title: string; content: string; author?: string; coverUrl?: string; tags?: string[]; status?: string; scheduledPublishAt?: string | null;
}): Promise<Story> => {
  const res = await fetch(`${API_URL}/admin/stories`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Failed to create story');
  return res.json();
};

export const adminUpdateStory = async (id: string, data: {
  title: string; content: string; author?: string; coverUrl?: string; tags?: string[]; status?: string; scheduledPublishAt?: string | null;
}): Promise<Story> => {
  const res = await fetch(`${API_URL}/admin/stories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Failed to update story');
  return res.json();
};

export const adminDeleteStory = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/admin/stories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Failed to delete story');
};
