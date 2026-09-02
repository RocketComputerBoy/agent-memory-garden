import { Skill, SkillIssue } from './types';

export class SkillDiagnose {
  async diagnose(skill: Skill): Promise<SkillIssue[]> {
    const issues: SkillIssue[] = [];

    issues.push(...this.checkOutdated(skill));
    issues.push(...this.checkConflicting(skill));
    issues.push(...this.checkLowQuality(skill));
    issues.push(...this.checkMissingDependencies(skill));

    return issues;
  }

  private checkOutdated(skill: Skill): SkillIssue[] {
    const issues: SkillIssue[] = [];

    if (skill.content) {
      const outdatedPatterns = [
        /deprecated/i,
        /obsolete/i,
        /outdated/i,
        /old version/i,
        /legacy/i,
      ];

      for (const pattern of outdatedPatterns) {
        if (pattern.test(skill.content)) {
          issues.push({
            type: 'outdated',
            severity: 'medium',
            message: `Skill contains outdated content: ${pattern.source}`,
          });
          break;
        }
      }
    }

    return issues;
  }

  private checkConflicting(skill: Skill): SkillIssue[] {
    const issues: SkillIssue[] = [];

    if (skill.content) {
      const conflictPatterns = [
        /conflict/i,
        /incompatible/i,
        /contradicts/i,
        /contradiction/i,
      ];

      for (const pattern of conflictPatterns) {
        if (pattern.test(skill.content)) {
          issues.push({
            type: 'conflicting',
            severity: 'high',
            message: `Skill contains conflicting information: ${pattern.source}`,
          });
          break;
        }
      }
    }

    return issues;
  }

  private checkLowQuality(skill: Skill): SkillIssue[] {
    const issues: SkillIssue[] = [];

    if (skill.content) {
      const lines = skill.content.split('\n');
      if (lines.length < 10) {
        issues.push({
          type: 'low-quality',
          severity: 'low',
          message: 'Skill content is too short',
        });
      }

      if (!skill.description || skill.description.length < 10) {
        issues.push({
          type: 'low-quality',
          severity: 'medium',
          message: 'Skill description is missing or too short',
        });
      }
    }

    return issues;
  }

  private checkMissingDependencies(skill: Skill): SkillIssue[] {
    const issues: SkillIssue[] = [];

    if (skill.dependencies && skill.dependencies.length > 0) {
      for (const dep of skill.dependencies) {
        if (!dep || dep.trim() === '') {
          issues.push({
            type: 'missing-dependency',
            severity: 'high',
            message: 'Skill has empty dependency',
          });
        }
      }
    }

    return issues;
  }
}
