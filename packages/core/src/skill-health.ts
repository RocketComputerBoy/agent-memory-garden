import { Skill, SkillHealth, SkillIssue } from './types';
import { SkillDiagnose } from './skill-diagnose';
import { SkillQuality } from './skill-quality';

export class SkillHealth {
  private diagnose: SkillDiagnose;
  private quality: SkillQuality;

  constructor() {
    this.diagnose = new SkillDiagnose();
    this.quality = new SkillQuality();
  }

  async checkHealth(skill: Skill): Promise<SkillHealth> {
    const issues = await this.diagnose.diagnose(skill);
    const qualityScore = await this.quality.assess(skill);

    const score = qualityScore.overall;
    const status = this.calculateStatus(score, issues);

    return {
      skillId: skill.id,
      score,
      status,
      issues,
      lastChecked: new Date(),
    };
  }

  private calculateStatus(score: number, issues: SkillIssue[]): 'healthy' | 'warning' | 'critical' {
    const highSeverityIssues = issues.filter((i) => i.severity === 'high');
    if (highSeverityIssues.length > 0) {
      return 'critical';
    }

    const mediumSeverityIssues = issues.filter((i) => i.severity === 'medium');
    if (mediumSeverityIssues.length > 0) {
      return 'warning';
    }

    if (score < 0.5) {
      return 'warning';
    }

    return 'healthy';
  }

  async checkAllHealth(skills: Skill[]): Promise<SkillHealth[]> {
    const healthChecks = skills.map((skill) => this.checkHealth(skill));
    return Promise.all(healthChecks);
  }

  getHealthSummary(healthChecks: SkillHealth[]): {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    averageScore: number;
  } {
    const total = healthChecks.length;
    const healthy = healthChecks.filter((h) => h.status === 'healthy').length;
    const warning = healthChecks.filter((h) => h.status === 'warning').length;
    const critical = healthChecks.filter((h) => h.status === 'critical').length;
    const averageScore = total > 0 ? healthChecks.reduce((sum, h) => sum + h.score, 0) / total : 0;

    return {
      total,
      healthy,
      warning,
      critical,
      averageScore,
    };
  }
}
