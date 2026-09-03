import { Skill, SkillHealth, SkillIssue } from './types';

export interface SkillUsage {
  skillId: string;
  count: number;
  lastUsed: Date;
  successRate: number;
  avgExecutionTime: number;
}

export interface EvolutionAction {
  type: 'retire' | 'merge' | 'upgrade' | 'deprecate' | 'optimize';
  skillId: string;
  reason: string;
  confidence: number;
  targetSkillId?: string;
}

export class EvolutionEngine {
  private usageStats: Map<string, SkillUsage> = new Map();
  private feedbackScores: Map<string, number[]> = new Map();

  recordUsage(skillId: string, success: boolean, executionTime: number): void {
    const existing = this.usageStats.get(skillId) || {
      skillId,
      count: 0,
      lastUsed: new Date(),
      successRate: 1,
      avgExecutionTime: 0,
    };

    existing.count++;
    existing.lastUsed = new Date();
    existing.successRate = (existing.successRate * (existing.count - 1) + (success ? 1 : 0)) / existing.count;
    existing.avgExecutionTime = (existing.avgExecutionTime * (existing.count - 1) + executionTime) / existing.count;

    this.usageStats.set(skillId, existing);
  }

  addFeedback(skillId: string, score: number): void {
    const scores = this.feedbackScores.get(skillId) || [];
    scores.push(score);
    this.feedbackScores.set(skillId, scores);
  }

  analyzeEvolution(
    skills: Skill[],
    healthChecks: SkillHealth[]
  ): EvolutionAction[] {
    const actions: EvolutionAction[] = [];

    for (const skill of skills) {
      const health = healthChecks.find((h) => h.skillId === skill.id);
      const usage = this.usageStats.get(skill.id);
      const feedback = this.feedbackScores.get(skill.id);

      // 1. 自动退休：健康度低且使用率低
      if (health && health.status === 'critical') {
        const lowUsage = !usage || usage.count < 5;
        const lowSuccess = usage && usage.successRate < 0.5;
        
        if (lowUsage || lowSuccess) {
          actions.push({
            type: 'retire',
            skillId: skill.id,
            reason: `Health score ${(health.score * 100).toFixed(0)}% is critical, usage count: ${usage?.count || 0}`,
            confidence: 0.9,
          });
        }
      }

      // 2. 自动优化：有明确问题的技能
      if (health && health.issues.length > 0) {
        const highSeverityIssues = health.issues.filter((i) => i.severity === 'high');
        if (highSeverityIssues.length > 0) {
          actions.push({
            type: 'optimize',
            skillId: skill.id,
            reason: `Has ${highSeverityIssues.length} high-severity issues: ${highSeverityIssues.map((i) => i.message).join(', ')}`,
            confidence: 0.8,
          });
        }
      }

      // 3. 自动弃用：低评分且低使用率
      if (health && health.score < 0.3 && usage && usage.count < 10) {
        actions.push({
          type: 'deprecate',
          skillId: skill.id,
          reason: `Low quality (${(health.score * 100).toFixed(0)}%) and low usage (${usage.count} times)`,
          confidence: 0.85,
        });
      }

      // 4. 自动合并：相似技能
      const similarSkills = skills.filter(
        (s) => s.id !== skill.id && this.calculateSimilarity(skill, s) > 0.7
      );
      if (similarSkills.length > 0) {
        const bestSimilar = similarSkills[0];
        const bestSimilarHealth = healthChecks.find((h) => h.skillId === bestSimilar.id);
        
        if (bestSimilarHealth && health && bestSimilarHealth.score > health.score) {
          actions.push({
            type: 'merge',
            skillId: skill.id,
            reason: `Similar to ${bestSimilar.name} which has higher quality`,
            confidence: 0.7,
            targetSkillId: bestSimilar.id,
          });
        }
      }

      // 5. 自动升级：高质量且高使用率
      if (health && health.score > 0.8 && usage && usage.count > 100) {
        actions.push({
          type: 'upgrade',
          skillId: skill.id,
          reason: `High quality (${(health.score * 100).toFixed(0)}%) and high usage (${usage.count} times)`,
          confidence: 0.95,
        });
      }
    }

    return actions.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateSimilarity(skill1: Skill, skill2: Skill): number {
    const tags1 = new Set(skill1.tags);
    const tags2 = new Set(skill2.tags);
    const intersection = new Set([...tags1].filter((t) => tags2.has(t)));
    const union = new Set([...tags1, ...tags2]);
    
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  getUsageStats(): SkillUsage[] {
    return Array.from(this.usageStats.values());
  }

  getSkillUsage(skillId: string): SkillUsage | undefined {
    return this.usageStats.get(skillId);
  }

  getFeedbackScores(): Map<string, number[]> {
    return this.feedbackScores;
  }
}
