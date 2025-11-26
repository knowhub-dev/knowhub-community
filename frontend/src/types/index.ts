export interface User {
  id: number;
  name: string;
  username: string;
  plan_type?: 'free' | 'pro' | 'legend';
  plan_expires_at?: string | null;
  is_pro?: boolean;
  email?: string;
  avatar_url?: string;
  xp: number;
  bio?: string;
  stats?: {
    posts_count?: number;
    followers_count?: number;
    following_count?: number;
  };
  badges?: {
    id: number;
    name: string;
    icon_url?: string;
  }[];
  level?: {
    id: number;
    name: string;
    min_xp: number;
  };
}

export interface Tag {
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  content_markdown: string;
  status: string;
  score: number;
  answers_count: number;
  tags: Tag[];
  category?: Category;
  user: User;
  ai_suggestion?: {
    model: string;
    content_markdown: string;
  };
  is_ai_suggested: boolean;
  created_at: string;
}

export interface CollaborationParticipant {
  id: number;
  user_id: number;
  role: string;
  last_seen_at: string;
  user?: Pick<User, 'id' | 'name' | 'username'> | null;
}

export interface CollaborationSession {
  id: number;
  post_id: number;
  owner_id: number;
  status: string;
  content_snapshot: string;
  ended_at?: string | null;
  created_at: string;
  updated_at: string;
  participants: CollaborationParticipant[];
}

export interface CollaborationEvent {
  id: number;
  type: string;
  payload: Record<string, unknown>;
  user_id: number;
  created_at: string;
}

export interface Comment {
  id: number;
  content_markdown: string;
  score: number;
  user: User;
  children?: Comment[];
  created_at: string;
}

export interface WikiArticle {
  id: number;
  title: string;
  slug: string;
  content_markdown: string;
  status: string;
  version: number;
  created_at: string;
}

export interface WikiProposalSummary {
  id: number;
  status: 'pending' | 'merged' | 'rejected';
  comment?: string | null;
  created_at: string;
  user: Pick<User, 'id' | 'name' | 'username' | 'avatar_url'> | null;
}

export interface WikiDiffResponse {
  article: {
    id: number;
    title: string;
    slug: string;
    version: number;
  };
  proposal: WikiProposalSummary;
  summary: {
    added: number;
    removed: number;
    net: number;
  };
  diff: {
    raw: string;
    lines: { type: 'context' | 'added' | 'removed'; text: string }[];
  };
}
