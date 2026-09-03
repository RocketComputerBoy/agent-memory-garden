import { EvolutionEngine, EvolutionAction } from '../evolution-engine';
import { Skill, SkillHealth } from '../types';

describe('EvolutionEngine', () => {
  let engine: EvolutionEngine;

  beforeEach(() => {
    engine = new EvolutionEngine();
  });

  it('should record usage', () => {
    engine.recordUsage('skill-1', true, 100);
    engine.recordUsage('skill-1', true, 150);
    engine.recordUsage('skill-1', false, 200);

    const usage = engine.getSkillUsage('skill-1');
    expect(usage).toBeDefined();
    expect(usage?.count).toBe(3);
    expect(usage?.successRate).toBeCloseTo(0.67, 1);
  });

  it('should add feedback', () => {
    engine.addFeedback('skill-1', 0.8);
    engine.addFeedback('skill-1', 0.9);
    engine.addFeedback('skill-1', 0.7);

    const scores = engine.getFeedbackScores();
    expect(scores.get('skill-1')).toEqual([0.8, 0.9, 0.7]);
  });

  it('should retire critical skills with low usage', () => {
    const skills: Skill[] = [
      {
        id: '1',
        name: 'bad-skill',
        description: 'A bad skill',
        content: 'Bad content',
        path: './skills/bad-skill.md',
        version: '0.1.0',
        tags: [],
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const healthChecks: SkillHealth[] = [
      {
        skillId: '1',
        score: 0.1,
        status: 'critical',
        issues: [],
        lastChecked: new Date(),
      },
    ];

    // Low usage (only 2 uses)
    engine.recordUsage('1', false, 1000);
    engine.recordUsage('1', false, 1000);

    const actions = engine.analyzeEvolution(skills, healthChecks);
    
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some((a) => a.type === 'retire' && a.skillId === '1')).toBe(true);
  });

  it('should optimize skills with high-severity issues', () => {
    const skills: Skill[] = [
      {
        id: '1',
        name: 'problematic-skill',
        description: 'A skill with issues',
        content: 'Problematic content',
        path: './skills/problematic-skill.md',
        version: '0.1.0',
        tags: [],
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const healthChecks: SkillHealth[] = [
      {
        skillId: '1',
        score: 0.5,
        status: 'warning',
        issues: [
          {
            type: 'outdated',
            severity: 'high',
            message: 'Contains deprecated API',
          },
        ],
        lastChecked: new Date(),
      },
    ];

    const actions = engine.analyzeEvolution(skills, healthChecks);
    
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some((a) => a.type === 'optimize' && a.skillId === '1')).toBe(true);
  });

  it('should deprecate low quality low usage skills', () => {
    const skills: Skill[] = [
      {
        id: '1',
        name: 'unused-skill',
        description: 'An unused skill',
        content: 'Unused content',
        path: './skills/unused-skill.md',
        version: '0.1.0',
        tags: [],
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const healthChecks: SkillHealth[] = [
      {
        skillId: '1',
        score: 0.2,
        status: 'critical',
        issues: [],
        lastChecked: new Date(),
      },
    ];

    // Low usage (only 5 uses)
    for (let i = 0; i < 5; i++) {
      engine.recordUsage('1', true, 100);
    }

    const actions = engine.analyzeEvolution(skills, healthChecks);
    
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some((a) => a.type === 'deprecate' && a.skillId === '1')).toBe(true);
  });

  it('should merge similar skills', () => {
    const skills: Skill[] = [
      {
        id: '1',
        name: 'search-v1',
        description: 'Search skill version 1',
        content: 'Search content',
        path: './skills/search-v1.md',
        version: '1.0.0',
        tags: ['search', 'web'],
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'search-v2',
        description: 'Search skill version 2',
        content: 'Search content v2',
        path: './skills/search-v2.md',
        version: '2.0.0',
        tags: ['search', 'web'],
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const healthChecks: SkillHealth[] = [
      {
        skillId: '1',
        score: 0.5,
        status: 'warning',
        issues: [],
        lastChecked: new Date(),
      },
      {
        skillId: '2',
        score: 0.9,
        status: 'healthy',
        issues: [],
        lastChecked: new Date(),
      },
    ];

    const actions = engine.analyzeEvolution(skills, healthChecks);
    
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some((a) => a.type === 'merge' && a.skillId === '1' && a.targetSkillId === '2')).toBe(true);
  });

  it('should upgrade high quality high usage skills', () => {
    const skills: Skill[] = [
      {
        id: '1',
        name: 'popular-skill',
        description: 'A popular skill',
        content: 'Popular content',
        path: './skills/popular-skill.md',
        version: '1.0.0',
        tags: ['popular'],
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const healthChecks: SkillHealth[] = [
      {
        skillId: '1',
        score: 0.9,
        status: 'healthy',
        issues: [],
        lastChecked: new Date(),
      },
    ];

    // High usage (150 uses)
    for (let i = 0; i < 150; i++) {
      engine.recordUsage('1', true, 50);
    }

    const actions = engine.analyzeEvolution(skills, healthChecks);
    
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some((a) => a.type === 'upgrade' && a.skillId === '1')).toBe(true);
  });
});
