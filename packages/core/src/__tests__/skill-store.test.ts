import { SkillStore } from '../skill-store';
import { Skill } from '../types';

describe('SkillStore', () => {
  let store: SkillStore;

  beforeEach(async () => {
    store = await SkillStore.create(':memory:');
  });

  afterEach(() => {
    store.close();
  });

  it('should create a skill', async () => {
    const skill = store.createSkill({
      name: 'test-skill',
      description: 'A test skill',
      content: 'Test content',
      path: './skills/test.md',
      version: '0.1.0',
      tags: ['test'],
      dependencies: [],
    });

    expect(skill).toBeDefined();
    expect(skill.id).toBeDefined();
    expect(skill.name).toBe('test-skill');
  });

  it('should get a skill by id', async () => {
    const created = store.createSkill({
      name: 'test-skill',
      description: 'A test skill',
      content: 'Test content',
      path: './skills/test.md',
      version: '0.1.0',
      tags: ['test'],
      dependencies: [],
    });

    const retrieved = store.getSkill(created.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('test-skill');
  });

  it('should list all skills', async () => {
    store.createSkill({
      name: 'skill-1',
      description: 'First skill',
      content: 'Content 1',
      path: './skills/skill1.md',
      version: '0.1.0',
      tags: [],
      dependencies: [],
    });

    store.createSkill({
      name: 'skill-2',
      description: 'Second skill',
      content: 'Content 2',
      path: './skills/skill2.md',
      version: '0.1.0',
      tags: [],
      dependencies: [],
    });

    const skills = store.listSkills();
    expect(skills.length).toBe(2);
  });

  it('should update a skill', async () => {
    const created = store.createSkill({
      name: 'test-skill',
      description: 'A test skill',
      content: 'Test content',
      path: './skills/test.md',
      version: '0.1.0',
      tags: ['test'],
      dependencies: [],
    });

    const updated = store.updateSkill(created.id, {
      name: 'updated-skill',
    });

    expect(updated?.name).toBe('updated-skill');
  });

  it('should delete a skill', async () => {
    const created = store.createSkill({
      name: 'test-skill',
      description: 'A test skill',
      content: 'Test content',
      path: './skills/test.md',
      version: '0.1.0',
      tags: ['test'],
      dependencies: [],
    });

    const deleted = store.deleteSkill(created.id);
    expect(deleted).toBe(true);

    const retrieved = store.getSkill(created.id);
    expect(retrieved).toBeNull();
  });

  it('should search skills', async () => {
    store.createSkill({
      name: 'web-search',
      description: 'Search the web',
      content: 'Web search content',
      path: './skills/web-search.md',
      version: '0.1.0',
      tags: ['search', 'web'],
      dependencies: [],
    });

    const results = store.searchSkills('web');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('web-search');
  });

  it('should export to markdown', async () => {
    const skill = store.createSkill({
      name: 'export-test',
      description: 'A skill for export testing',
      content: 'Export content',
      path: './skills/export-test.md',
      version: '1.0.0',
      tags: ['export'],
      dependencies: ['dep1'],
    });

    const markdown = store.exportToMarkdown(skill);

    expect(markdown).toContain('# export-test');
    expect(markdown).toContain('> A skill for export testing');
    expect(markdown).toContain('**Version:** 1.0.0');
    expect(markdown).toContain('**Tags:** export');
    expect(markdown).toContain('**Dependencies:** dep1');
    expect(markdown).toContain('Export content');
  });

  it('should return zero count for empty store', () => {
    const count = store.getSkillCount();
    expect(count.total).toBe(0);
    expect(count.byTag).toEqual({});
  });

  it('should count skills correctly', () => {
    store.createSkill({
      name: 'skill-1',
      description: '',
      content: '',
      path: '',
      version: '1.0.0',
      tags: ['web', 'search'],
      dependencies: [],
    });
    store.createSkill({
      name: 'skill-2',
      description: '',
      content: '',
      path: '',
      version: '1.0.0',
      tags: ['web'],
      dependencies: [],
    });
    store.createSkill({
      name: 'skill-3',
      description: '',
      content: '',
      path: '',
      version: '1.0.0',
      tags: ['test'],
      dependencies: [],
    });

    const count = store.getSkillCount();
    expect(count.total).toBe(3);
    expect(count.byTag).toEqual({ web: 2, search: 1, test: 1 });
  });

  it('should count skills with empty tags', () => {
    store.createSkill({
      name: 'no-tags',
      description: '',
      content: '',
      path: '',
      version: '1.0.0',
      tags: [],
      dependencies: [],
    });

    const count = store.getSkillCount();
    expect(count.total).toBe(1);
    expect(count.byTag).toEqual({});
  });
});
