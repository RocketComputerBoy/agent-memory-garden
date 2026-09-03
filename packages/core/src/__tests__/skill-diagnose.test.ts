import { SkillDiagnose } from '../skill-diagnose';
import { Skill } from '../types';

describe('SkillDiagnose', () => {
  let diagnoser: SkillDiagnose;

  beforeEach(() => {
    diagnoser = new SkillDiagnose();
  });

  it('should detect outdated content', async () => {
    const skill: Skill = {
      id: '1',
      name: 'outdated-skill',
      description: 'An outdated skill',
      content: 'This skill is deprecated and should not be used.',
      path: './skills/outdated-skill.md',
      version: '1.0.0',
      tags: [],
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const issues = await diagnoser.diagnose(skill);

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.type === 'outdated')).toBe(true);
  });

  it('should detect conflicting content', async () => {
    const skill: Skill = {
      id: '2',
      name: 'conflicting-skill',
      description: 'A skill with conflicting information',
      content: 'This skill conflicts with the other skill.',
      path: './skills/conflicting-skill.md',
      version: '1.0.0',
      tags: [],
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const issues = await diagnoser.diagnose(skill);

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.type === 'conflicting')).toBe(true);
  });

  it('should detect low quality content', async () => {
    const skill: Skill = {
      id: '3',
      name: 'low-quality-skill',
      description: '',
      content: 'Short',
      path: './skills/low-quality-skill.md',
      version: '1.0.0',
      tags: [],
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const issues = await diagnoser.diagnose(skill);

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.type === 'low-quality')).toBe(true);
  });

  it('should detect missing dependencies', async () => {
    const skill: Skill = {
      id: '4',
      name: 'skill-with-missing-dep',
      description: 'A skill with missing dependency',
      content: 'This skill has a missing dependency.',
      path: './skills/skill-with-missing-dep.md',
      version: '1.0.0',
      tags: [],
      dependencies: [''],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const issues = await diagnoser.diagnose(skill);

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.type === 'missing-dependency')).toBe(true);
  });

  it('should not detect issues for a healthy skill', async () => {
    const skill: Skill = {
      id: '5',
      name: 'healthy-skill',
      description: 'A well-maintained skill',
      content: `
# Healthy Skill

This is a well-maintained skill with proper documentation.

## Installation
npm install healthy-skill

## Usage
Use this skill for your projects.

## Error Handling
This skill handles errors properly.
      `,
      path: './skills/healthy-skill.md',
      version: '1.0.0',
      tags: ['healthy'],
      dependencies: ['other-skill'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const issues = await diagnoser.diagnose(skill);

    expect(issues.length).toBe(0);
  });
});
