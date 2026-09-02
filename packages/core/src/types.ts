export interface Skill {
  id: string;
  name: string;
  description: string;
  content: string;
  path: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  dependencies: string[];
}

export interface SkillVersion {
  id: string;
  skillId: string;
  version: string;
  content: string;
  message: string;
  createdAt: Date;
  hash: string;
}

export interface SkillHealth {
  skillId: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  issues: SkillIssue[];
  lastChecked: Date;
}

export interface SkillIssue {
  type: 'outdated' | 'conflicting' | 'low-quality' | 'missing-dependency';
  severity: 'low' | 'medium' | 'high';
  message: string;
  location?: string;
}

export interface SkillQualityScore {
  applicability: number;
  contentQuality: number;
  executionGuidance: number;
  robustness: number;
  overall: number;
}

export interface SkillGarden {
  name: string;
  path: string;
  skills: Skill[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GardenConfig {
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
}
