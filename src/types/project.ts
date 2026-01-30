export type ProjectStatus = 'published' | 'draft' | 'archived';
export type ProjectType = 'website' | 'landing' | 'app' | 'funnel' | 'other';

export interface LovableAccount {
  id: string;
  email: string;
  name: string;
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet';
  projectCount: number;
  credits: number;
  credits_updated_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  screenshot?: string;
  status: ProjectStatus;
  type: ProjectType;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date | null;
  isFavorite: boolean;
  tags: string[];
  notes?: string;
  viewCount: number;
  progress: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
