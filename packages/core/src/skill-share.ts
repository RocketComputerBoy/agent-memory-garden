import { Skill } from './types';
import * as fs from 'fs';
import * as path from 'path';

export interface SkillPackage {
  name: string;
  version: string;
  description: string;
  author: string;
  skills: Skill[];
  dependencies: string[];
  createdAt: Date;
  exportedAt: Date;
}

export interface ShareLink {
  id: string;
  packageId: string;
  expiresAt?: Date;
  downloadCount: number;
  createdAt: Date;
}

export class SkillShare {
  private packagesDir: string;

  constructor(packagesDir: string = './packages') {
    this.packagesDir = packagesDir;
    this.ensurePackagesDir();
  }

  private ensurePackagesDir(): void {
    if (!fs.existsSync(this.packagesDir)) {
      fs.mkdirSync(this.packagesDir, { recursive: true });
    }
  }

  exportSkills(
    skills: Skill[],
    options: {
      name: string;
      version: string;
      description: string;
      author: string;
    }
  ): SkillPackage {
    const skillPackage: SkillPackage = {
      name: options.name,
      version: options.version,
      description: options.description,
      author: options.author,
      skills: skills,
      dependencies: this.extractDependencies(skills),
      createdAt: new Date(),
      exportedAt: new Date(),
    };

    const packagePath = path.join(this.packagesDir, `${options.name}@${options.version}.json`);
    fs.writeFileSync(packagePath, JSON.stringify(skillPackage, null, 2));

    return skillPackage;
  }

  exportSkill(skill: Skill): SkillPackage {
    return this.exportSkills([skill], {
      name: skill.name,
      version: skill.version,
      description: skill.description,
      author: 'local',
    });
  }

  importSkills(packagePath: string): Skill[] {
    if (!fs.existsSync(packagePath)) {
      throw new Error(`Package not found: ${packagePath}`);
    }

    const content = fs.readFileSync(packagePath, 'utf-8');
    const skillPackage: SkillPackage = JSON.parse(content);

    return skillPackage.skills.map(skill => ({
      ...skill,
      createdAt: new Date(skill.createdAt),
      updatedAt: new Date(skill.updatedAt),
    }));
  }

  listPackages(): SkillPackage[] {
    if (!fs.existsSync(this.packagesDir)) {
      return [];
    }

    const files = fs.readdirSync(this.packagesDir).filter(f => f.endsWith('.json'));
    return files.map(file => {
      const content = fs.readFileSync(path.join(this.packagesDir, file), 'utf-8');
      return JSON.parse(content) as SkillPackage;
    });
  }

  getPackage(name: string, version?: string): SkillPackage | null {
    const packages = this.listPackages();
    
    if (version) {
      return packages.find(p => p.name === name && p.version === version) || null;
    }
    
    // Get latest version
    const filtered = packages.filter(p => p.name === name);
    if (filtered.length === 0) return null;
    
    return filtered.sort((a, b) => 
      new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime()
    )[0];
  }

  generateShareLink(packageName: string, version?: string): ShareLink {
    const pkg = this.getPackage(packageName, version);
    if (!pkg) {
      throw new Error(`Package not found: ${packageName}`);
    }

    const shareLink: ShareLink = {
      id: this.generateId(),
      packageId: `${packageName}@${pkg.version}`,
      downloadCount: 0,
      createdAt: new Date(),
    };

    // Save share link
    const linkPath = path.join(this.packagesDir, 'share-links.json');
    let links: ShareLink[] = [];
    
    if (fs.existsSync(linkPath)) {
      const content = fs.readFileSync(linkPath, 'utf-8');
      links = JSON.parse(content);
    }
    
    links.push(shareLink);
    fs.writeFileSync(linkPath, JSON.stringify(links, null, 2));

    return shareLink;
  }

  getShareLink(id: string): ShareLink | null {
    const linkPath = path.join(this.packagesDir, 'share-links.json');
    if (!fs.existsSync(linkPath)) {
      return null;
    }

    const content = fs.readFileSync(linkPath, 'utf-8');
    const links: ShareLink[] = JSON.parse(content);
    return links.find(l => l.id === id) || null;
  }

  private extractDependencies(skills: Skill[]): string[] {
    const deps = new Set<string>();
    skills.forEach(skill => {
      skill.dependencies.forEach(dep => deps.add(dep));
    });
    return Array.from(deps).filter(d => d.length > 0);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
