import { QualityReporter } from '../quality-reporter';
import { GitHubScanner } from '../github-scanner';
import { LLMQualityAssessor } from '../llm-quality';

jest.mock('../github-scanner');
jest.mock('../llm-quality');

describe('QualityReporter', () => {
  let reporter: QualityReporter;
  const mockScanMultipleRepos = jest.fn();
  const mockFetchSkillContent = jest.fn();
  const mockAssess = jest.fn();
  const mockDiagnose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (GitHubScanner as jest.Mock).mockImplementation(() => ({
      scanMultipleRepos: mockScanMultipleRepos,
      fetchSkillContent: mockFetchSkillContent
    }));
    
    (LLMQualityAssessor as jest.Mock).mockImplementation(() => ({
      assess: mockAssess,
      diagnose: mockDiagnose
    }));
    
    reporter = new QualityReporter({ apiKey: 'test-key' });
  });

  it('should generate quality report for skills', async () => {
    const mockSkills = [
      {
        name: 'test-skill',
        path: 'skills/test-skill/SKILL.md',
        repository: 'owner/repo',
        stars: 100,
        forks: 25
      }
    ];
    
    const mockContent = `# Test Skill
description: A test skill
version: 1.0.0
tags: [test, demo]
dependencies: [dep1]
`;
    
    const mockQuality = {
      applicability: 0.85,
      contentQuality: 0.90,
      executionGuidance: 0.80,
      robustness: 0.75,
      overall: 0.82
    };
    
    mockScanMultipleRepos.mockResolvedValue(mockSkills);
    mockFetchSkillContent.mockResolvedValue(mockContent);
    mockAssess.mockResolvedValue(mockQuality);
    mockDiagnose.mockResolvedValue([]);
    
    const summary = await reporter.generateReport([{ owner: 'owner', repo: 'repo' }]);
    
    expect(summary.totalSkills).toBe(1);
    expect(summary.averageScore).toBeCloseTo(0.82);
    expect(summary.healthyCount).toBe(1);
    expect(summary.topSkills).toHaveLength(1);
    expect(summary.bottomSkills).toHaveLength(1);
  });

  it('should skip skills with no content', async () => {
    const mockSkills = [
      {
        name: 'empty-skill',
        path: 'skills/empty-skill/SKILL.md',
        repository: 'owner/repo'
      }
    ];
    
    mockScanMultipleRepos.mockResolvedValue(mockSkills);
    mockFetchSkillContent.mockResolvedValue(null);
    
    const summary = await reporter.generateReport([{ owner: 'owner', repo: 'repo' }]);
    
    expect(summary.totalSkills).toBe(0);
  });

  it('should extract metadata from content', async () => {
    const mockSkills = [
      {
        name: 'skill-with-meta',
        path: 'skills/skill-with-meta/SKILL.md',
        repository: 'owner/repo'
      }
    ];
    
    const mockContent = `# Skill
description: Test description
version: 2.0.0
tags: [tag1, tag2]
dependencies: [dep1, dep2]
`;
    
    mockScanMultipleRepos.mockResolvedValue(mockSkills);
    mockFetchSkillContent.mockResolvedValue(mockContent);
    mockAssess.mockResolvedValue({
      applicability: 0.8,
      contentQuality: 0.8,
      executionGuidance: 0.8,
      robustness: 0.8,
      overall: 0.8
    });
    mockDiagnose.mockResolvedValue([]);
    
    await reporter.generateReport([{ owner: 'owner', repo: 'repo' }]);
    
    const skillObj = mockAssess.mock.calls[0][0];
    expect(skillObj.description).toBe('Test description');
    expect(skillObj.version).toBe('2.0.0');
    expect(skillObj.tags).toEqual(['tag1', 'tag2']);
    expect(skillObj.dependencies).toEqual(['dep1', 'dep2']);
  });

  it('should format report as markdown', () => {
    const summary = {
      totalSkills: 10,
      averageScore: 0.75,
      healthyCount: 6,
      warningCount: 3,
      criticalCount: 1,
      topSkills: [{
        skill: { name: 'top-skill', repository: 'owner/repo', path: 'skills/top-skill/SKILL.md' },
        quality: { overall: 0.95, applicability: 0.9, contentQuality: 0.9, executionGuidance: 0.9, robustness: 0.9 },
        issues: [],
        scannedAt: new Date()
      }],
      bottomSkills: [{
        skill: { name: 'bottom-skill', repository: 'owner/repo', path: 'skills/bottom-skill/SKILL.md' },
        quality: { overall: 0.3, applicability: 0.3, contentQuality: 0.3, executionGuidance: 0.3, robustness: 0.3 },
        issues: ['Missing documentation'],
        scannedAt: new Date()
      }],
      reports: []
    };
    
    const markdown = reporter.formatReport(summary);
    
    expect(markdown).toContain('# MCP 技能质量报告');
    expect(markdown).toContain('技能总数: 10');
    expect(markdown).toContain('平均质量分: 75.0%');
    expect(markdown).toContain('🟢 健康 (≥70%): 6');
    expect(markdown).toContain('🟡 警告 (40-70%): 3');
    expect(markdown).toContain('🔴 危急 (<40%): 1');
    expect(markdown).toContain('### top-skill');
    expect(markdown).toContain('### bottom-skill');
    expect(markdown).toContain('Missing documentation');
  });
});
