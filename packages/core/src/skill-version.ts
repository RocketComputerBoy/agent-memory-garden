import simpleGit from 'simple-git';
import { Skill, SkillVersion } from './types';

export class SkillVersion {
  private git: simpleGit.SimpleGit;

  constructor(repoPath: string) {
    this.git = simpleGit(repoPath);
  }

  async init(): Promise<void> {
    await this.git.init();
  }

  async commitSkill(skill: Skill, message: string): Promise<string> {
    await this.git.add(skill.path);
    const result = await this.git.commit(message);
    return result.commit;
  }

  async getHistory(skillPath: string): Promise<SkillVersion[]> {
    const log = await this.git.log({ file: skillPath });

    return log.all.map((entry) => ({
      id: entry.hash,
      skillId: '',
      version: '',
      content: '',
      message: entry.message,
      createdAt: new Date(entry.date),
      hash: entry.hash,
    }));
  }

  async createTag(version: string, message: string): Promise<void> {
    await this.git.addAnnotatedTag(version, message);
  }

  async getTags(): Promise<string[]> {
    const tags = await this.git.tags();
    return tags.all;
  }

  async checkout(version: string): Promise<void> {
    await this.git.checkout(version);
  }

  async diff(skillPath: string, version1: string, version2: string): Promise<string> {
    const diff = await this.git.diff([version1, version2, '--', skillPath]);
    return diff;
  }
}
