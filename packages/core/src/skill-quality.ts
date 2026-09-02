import { Skill, SkillQualityScore } from './types';

export class SkillQuality {
  async assess(skill: Skill): Promise<SkillQualityScore> {
    const applicability = this.assessApplicability(skill);
    const contentQuality = this.assessContentQuality(skill);
    const executionGuidance = this.assessExecutionGuidance(skill);
    const robustness = this.assessRobustness(skill);

    const overall = (applicability + contentQuality + executionGuidance + robustness) / 4;

    return {
      applicability,
      contentQuality,
      executionGuidance,
      robustness,
      overall,
    };
  }

  private assessApplicability(skill: Skill): number {
    let score = 0;

    if (skill.description && skill.description.length > 10) {
      score += 0.3;
    }

    if (skill.tags && skill.tags.length > 0) {
      score += 0.2;
    }

    if (skill.content && skill.content.length > 100) {
      score += 0.3;
    }

    if (skill.dependencies && skill.dependencies.length > 0) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  private assessContentQuality(skill: Skill): number {
    let score = 0;

    if (skill.content) {
      const lines = skill.content.split('\n');
      if (lines.length > 10) score += 0.2;
      if (lines.length > 50) score += 0.2;

      if (skill.content.includes('```')) score += 0.2;

      if (skill.content.includes('example') || skill.content.includes('Example')) {
        score += 0.2;
      }

      if (skill.content.includes('error') || skill.content.includes('Error')) {
        score += 0.2;
      }
    }

    return Math.min(score, 1);
  }

  private assessExecutionGuidance(skill: Skill): number {
    let score = 0;

    if (skill.content) {
      if (skill.content.includes('install') || skill.content.includes('Install')) {
        score += 0.25;
      }

      if (skill.content.includes('usage') || skill.content.includes('Usage')) {
        score += 0.25;
      }

      if (skill.content.includes('test') || skill.content.includes('Test')) {
        score += 0.25;
      }

      if (skill.content.includes('example') || skill.content.includes('Example')) {
        score += 0.25;
      }
    }

    return Math.min(score, 1);
  }

  private assessRobustness(skill: Skill): number {
    let score = 0;

    if (skill.content) {
      if (skill.content.includes('error') || skill.content.includes('Error')) {
        score += 0.25;
      }

      if (skill.content.includes('exception') || skill.content.includes('Exception')) {
        score += 0.25;
      }

      if (skill.content.includes('timeout') || skill.content.includes('Timeout')) {
        score += 0.25;
      }

      if (skill.content.includes('retry') || skill.content.includes('Retry')) {
        score += 0.25;
      }
    }

    return Math.min(score, 1);
  }
}
