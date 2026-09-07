import { GitHubScanner } from '../github-scanner';

global.fetch = jest.fn();

describe('GitHubScanner', () => {
  let scanner: GitHubScanner;

  beforeEach(() => {
    scanner = new GitHubScanner();
    jest.clearAllMocks();
  });

  it('should scan repository for SKILL.md files', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        tree: [
          { path: 'skills/test-skill/SKILL.md', type: 'blob' },
          { path: 'skills/another-skill/SKILL.md', type: 'blob' },
          { path: 'src/index.ts', type: 'blob' }
        ]
      })
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const skills = await scanner.scanRepository('test-owner', 'test-repo');
    
    expect(skills).toHaveLength(2);
    expect(skills[0].name).toBe('test-skill');
    expect(skills[0].repository).toBe('test-owner/test-repo');
    expect(skills[1].name).toBe('another-skill');
  });

  it('should handle API errors gracefully', async () => {
    const mockResponse = {
      ok: false,
      statusText: 'Not Found'
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const skills = await scanner.scanRepository('test-owner', 'test-repo');
    
    expect(skills).toHaveLength(0);
  });

  it('should fetch skill content from raw GitHub', async () => {
    const mockResponse = {
      ok: true,
      text: jest.fn().mockResolvedValue('# Test Skill\n\nThis is a test skill.')
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const content = await scanner.fetchSkillContent('test-owner', 'test-repo', 'skills/test-skill/SKILL.md');
    
    expect(content).toBe('# Test Skill\n\nThis is a test skill.');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/test-owner/test-repo/main/skills/test-skill/SKILL.md'
    );
  });

  it('should return null for failed content fetch', async () => {
    const mockResponse = {
      ok: false
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const content = await scanner.fetchSkillContent('test-owner', 'test-repo', 'skills/test-skill/SKILL.md');
    
    expect(content).toBeNull();
  });

  it('should get repository info', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        stargazers_count: 100,
        forks_count: 25
      })
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const info = await scanner.getRepoInfo('test-owner', 'test-repo');
    
    expect(info).toEqual({ stars: 100, forks: 25 });
  });

  it('should handle repo info fetch failure', async () => {
    const mockResponse = {
      ok: false
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const info = await scanner.getRepoInfo('test-owner', 'test-repo');
    
    expect(info).toBeNull();
  });

  it('should scan multiple repositories', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        tree: [
          { path: 'skills/skill1/SKILL.md', type: 'blob' }
        ]
      })
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const repos = [
      { owner: 'owner1', repo: 'repo1' },
      { owner: 'owner2', repo: 'repo2' }
    ];
    
    const skills = await scanner.scanMultipleRepos(repos);
    
    expect(skills).toHaveLength(2);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
