import { SkillShare, SkillPackage, ShareLink } from '../skill-share';
import { Skill } from '../types';
import * as fs from 'fs';
import * as path from 'path';

describe('SkillShare', () => {
  let share: SkillShare;
  const testDir = './test-packages';

  beforeEach(() => {
    share = new SkillShare(testDir);
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  const mockSkill: Skill = {
    id: '1',
    name: 'test-skill',
    description: 'A test skill',
    content: 'Test content',
    path: './skills/test.md',
    version: '1.0.0',
    tags: ['test'],
    dependencies: ['dep1'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should export a skill', () => {
    const result = share.exportSkill(mockSkill);

    expect(result).toBeDefined();
    expect(result.name).toBe('test-skill');
    expect(result.version).toBe('1.0.0');
    expect(result.skills.length).toBe(1);
    expect(result.skills[0].name).toBe('test-skill');
  });

  it('should export multiple skills', () => {
    const skills = [
      mockSkill,
      {
        ...mockSkill,
        id: '2',
        name: 'test-skill-2',
      },
    ];

    const result = share.exportSkills(skills, {
      name: 'my-package',
      version: '1.0.0',
      description: 'My skill package',
      author: 'test-author',
    });

    expect(result.name).toBe('my-package');
    expect(result.skills.length).toBe(2);
    expect(result.author).toBe('test-author');
  });

  it('should import skills', () => {
    // First export
    share.exportSkill(mockSkill);
    
    // Then import
    const packages = share.listPackages();
    expect(packages.length).toBe(1);

    const importedSkills = share.importSkills(path.join(testDir, packages[0].name + '@' + packages[0].version + '.json'));
    expect(importedSkills.length).toBe(1);
    expect(importedSkills[0].name).toBe('test-skill');
  });

  it('should list packages', () => {
    share.exportSkill(mockSkill);
    share.exportSkill({ ...mockSkill, id: '2', name: 'skill-2' });

    const packages = share.listPackages();
    expect(packages.length).toBe(2);
  });

  it('should get package by name', () => {
    share.exportSkill(mockSkill);

    const pkg = share.getPackage('test-skill');
    expect(pkg).toBeDefined();
    expect(pkg?.name).toBe('test-skill');
  });

  it('should get package by name and version', () => {
    share.exportSkill(mockSkill);
    share.exportSkill({ ...mockSkill, version: '2.0.0' });

    const pkg = share.getPackage('test-skill', '1.0.0');
    expect(pkg).toBeDefined();
    expect(pkg?.version).toBe('1.0.0');
  });

  it('should generate share link', () => {
    share.exportSkill(mockSkill);

    const link = share.generateShareLink('test-skill');
    expect(link).toBeDefined();
    expect(link.id).toBeDefined();
    expect(link.packageId).toBe('test-skill@1.0.0');
    expect(link.downloadCount).toBe(0);
  });

  it('should get share link', () => {
    share.exportSkill(mockSkill);

    const link = share.generateShareLink('test-skill');
    const retrieved = share.getShareLink(link.id);
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(link.id);
  });

  it('should extract dependencies', () => {
    const skill1: Skill = {
      ...mockSkill,
      dependencies: ['dep1', 'dep2'],
    };
    const skill2: Skill = {
      ...mockSkill,
      id: '2',
      dependencies: ['dep2', 'dep3'],
    };

    const result = share.exportSkills([skill1, skill2], {
      name: 'multi-dep',
      version: '1.0.0',
      description: 'Skills with dependencies',
      author: 'test',
    });

    expect(result.dependencies).toContain('dep1');
    expect(result.dependencies).toContain('dep2');
    expect(result.dependencies).toContain('dep3');
  });
});
