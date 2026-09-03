import { HealthChecker } from '../skill-health';
import { Skill } from '../types';

describe('HealthChecker', () => {
  let healthChecker: HealthChecker;

  beforeEach(() => {
    healthChecker = new HealthChecker();
  });

  it('should check health of a healthy skill', async () => {
    const skill: Skill = {
      id: '1',
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

    const health = await healthChecker.checkHealth(skill);

    expect(health.skillId).toBe('1');
    expect(health.status).toBe('healthy');
    expect(health.score).toBeGreaterThan(0.5);
    expect(health.issues.length).toBe(0);
  });

  it('should check health of a critical skill', async () => {
    const skill: Skill = {
      id: '2',
      name: 'critical-skill',
      description: 'A skill with critical issues',
      content: 'This skill is deprecated and conflicts with other skills.',
      path: './skills/critical-skill.md',
      version: '1.0.0',
      tags: [],
      dependencies: [''],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const health = await healthChecker.checkHealth(skill);

    expect(health.skillId).toBe('2');
    expect(health.status).toBe('critical');
    expect(health.issues.length).toBeGreaterThan(0);
  });

  it('should check health of multiple skills', async () => {
    const skills: Skill[] = [
      {
        id: '3',
        name: 'skill-1',
        description: 'First skill',
        content: `
# Skill 1

Good documentation.
        `,
        path: './skills/skill-1.md',
        version: '1.0.0',
        tags: [],
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'skill-2',
        description: 'Second skill',
        content: `
# Skill 2

Good documentation.
        `,
        path: './skills/skill-2.md',
        version: '1.0.0',
        tags: [],
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const healthChecks = await healthChecker.checkAllHealth(skills);

    expect(healthChecks.length).toBe(2);
    expect(healthChecks[0].skillId).toBe('3');
    expect(healthChecks[1].skillId).toBe('4');
  });

  it('should calculate health summary correctly', async () => {
    const healthChecks = [
      {
        skillId: '1',
        score: 0.9,
        status: 'healthy' as const,
        issues: [],
        lastChecked: new Date(),
      },
      {
        skillId: '2',
        score: 0.6,
        status: 'warning' as const,
        issues: [],
        lastChecked: new Date(),
      },
      {
        skillId: '3',
        score: 0.3,
        status: 'critical' as const,
        issues: [],
        lastChecked: new Date(),
      },
    ];

    const summary = healthChecker.getHealthSummary(healthChecks);

    expect(summary.total).toBe(3);
    expect(summary.healthy).toBe(1);
    expect(summary.warning).toBe(1);
    expect(summary.critical).toBe(1);
    expect(summary.averageScore).toBeCloseTo(0.6, 1);
  });

  it('should handle empty health checks', async () => {
    const healthChecks: any[] = [];

    const summary = healthChecker.getHealthSummary(healthChecks);

    expect(summary.total).toBe(0);
    expect(summary.healthy).toBe(0);
    expect(summary.warning).toBe(0);
    expect(summary.critical).toBe(0);
    expect(summary.averageScore).toBe(0);
  });
});
