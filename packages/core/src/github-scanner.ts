export interface GitHubSkill {
  name: string;
  path: string;
  repository: string;
  content?: string;
  stars?: number;
  forks?: number;
}

export class GitHubScanner {
  private baseUrl = 'https://api.github.com';

  async scanRepository(owner: string, repo: string, skillsDir: string = 'skills'): Promise<GitHubSkill[]> {
    const skills: GitHubSkill[] = [];
    
    try {
      const treeUrl = `${this.baseUrl}/repos/${owner}/${repo}/git/trees/main?recursive=1`;
      const response = await fetch(treeUrl);
      
      if (!response.ok) {
        console.error(`Failed to fetch tree for ${owner}/${repo}: ${response.statusText}`);
        return skills;
      }

      const data = await response.json() as { tree: Array<{ path: string; type: string }> };
      
      for (const item of data.tree) {
        if (item.path.endsWith('/SKILL.md') && item.path.startsWith(skillsDir)) {
          const skillPath = item.path.replace(skillsDir + '/', '').replace('/SKILL.md', '');
          skills.push({
            name: skillPath.split('/').pop() || skillPath,
            path: item.path,
            repository: `${owner}/${repo}`,
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning ${owner}/${repo}:`, error);
    }

    return skills;
  }

  async fetchSkillContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
      const response = await fetch(rawUrl);
      
      if (!response.ok) {
        return null;
      }

      return await response.text();
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
      return null;
    }
  }

  async getRepoInfo(owner: string, repo: string): Promise<{ stars: number; forks: number } | null> {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json() as { stargazers_count: number; forks_count: number };
      return {
        stars: data.stargazers_count,
        forks: data.forks_count,
      };
    } catch (error) {
      console.error(`Error fetching repo info for ${owner}/${repo}:`, error);
      return null;
    }
  }

  async scanMultipleRepos(repos: Array<{ owner: string; repo: string; skillsDir?: string }>): Promise<GitHubSkill[]> {
    const allSkills: GitHubSkill[] = [];
    
    for (const { owner, repo, skillsDir } of repos) {
      console.log(`Scanning ${owner}/${repo}...`);
      const skills = await this.scanRepository(owner, repo, skillsDir);
      allSkills.push(...skills);
      console.log(`Found ${skills.length} skills`);
    }

    return allSkills;
  }
}
