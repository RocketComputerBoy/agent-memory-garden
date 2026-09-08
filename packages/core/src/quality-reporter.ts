import { Skill, SkillQualityScore } from './types';
import { GitHubScanner, GitHubSkill } from './github-scanner';
import { LLMQualityAssessor, LLMQualityConfig } from './llm-quality';

interface QualityReport {
  skill: GitHubSkill;
  quality: SkillQualityScore;
  issues: string[];
  scannedAt: Date;
}

interface ReportSummary {
  totalSkills: number;
  averageScore: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  topSkills: QualityReport[];
  bottomSkills: QualityReport[];
  reports: QualityReport[];
}

export class QualityReporter {
  private scanner: GitHubScanner;
  private assessor: LLMQualityAssessor;

  constructor(config: LLMQualityConfig = {}) {
    this.scanner = new GitHubScanner();
    this.assessor = new LLMQualityAssessor(config);
  }

  async generateReport(
    repos: Array<{ owner: string; repo: string; skillsDir?: string }>,
    maxSkills: number = 10
  ): Promise<ReportSummary> {
    console.log('Starting quality report generation...');
    
    const allSkills = await this.scanner.scanMultipleRepos(repos);
    console.log(`Found ${allSkills.length} skills total`);

    const skillsToScan = allSkills.slice(0, maxSkills);
    console.log(`Scanning top ${skillsToScan.length} skills...`);

    const reports: QualityReport[] = [];

    for (const skill of skillsToScan) {
      console.log(`Analyzing ${skill.repository}/${skill.name}...`);
      
      const content = await this.scanner.fetchSkillContent(
        skill.repository.split('/')[0],
        skill.repository.split('/')[1],
        skill.path
      );

      if (!content) {
        console.log(`  Skipping ${skill.name} (no content)`);
        continue;
      }

      const skillObj: Skill = {
        id: skill.name,
        name: skill.name,
        description: this.extractDescription(content),
        content: content,
        path: skill.path,
        version: this.extractVersion(content),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: this.extractTags(content),
        dependencies: this.extractDependencies(content),
      };

      try {
        const quality = await this.assessor.assess(skillObj);
        const issues = await this.assessor.diagnose(skillObj);

        reports.push({
          skill,
          quality,
          issues: issues,
          scannedAt: new Date(),
        });

        console.log(`  Score: ${(quality.overall * 100).toFixed(1)}%`);
      } catch (error) {
        console.error(`  Error analyzing ${skill.name}:`, error);
      }
    }

    return this.generateSummary(reports);
  }

  private generateSummary(reports: QualityReport[]): ReportSummary {
    const sorted = [...reports].sort((a, b) => b.quality.overall - a.quality.overall);
    const avgScore = reports.reduce((sum, r) => sum + r.quality.overall, 0) / reports.length;

    return {
      totalSkills: reports.length,
      averageScore: avgScore,
      healthyCount: reports.filter(r => r.quality.overall >= 0.7).length,
      warningCount: reports.filter(r => r.quality.overall >= 0.4 && r.quality.overall < 0.7).length,
      criticalCount: reports.filter(r => r.quality.overall < 0.4).length,
      topSkills: sorted.slice(0, 5),
      bottomSkills: sorted.slice(-5).reverse(),
      reports,
    };
  }

  private extractDescription(content: string): string {
    const match = content.match(/description:\s*(.+)/i);
    return match ? match[1].trim() : '';
  }

  private extractVersion(content: string): string {
    const match = content.match(/version:\s*(.+)/i);
    return match ? match[1].trim() : '1.0.0';
  }

  private extractTags(content: string): string[] {
    const match = content.match(/tags:\s*\[(.+)\]/i);
    if (match) {
      return match[1].split(',').map(t => t.trim().replace(/"/g, ''));
    }
    return [];
  }

  private extractDependencies(content: string): string[] {
    const match = content.match(/dependencies:\s*\[(.+)\]/i);
    if (match) {
      return match[1].split(',').map(d => d.trim().replace(/"/g, ''));
    }
    return [];
  }

  formatReport(summary: ReportSummary): string {
    const lines: string[] = [];
    
    lines.push('# MCP 技能质量报告');
    lines.push('');
    lines.push(`扫描时间: ${new Date().toISOString()}`);
    lines.push(`技能总数: ${summary.totalSkills}`);
    lines.push(`平均质量分: ${(summary.averageScore * 100).toFixed(1)}%`);
    lines.push('');
    lines.push('## 质量分布');
    lines.push(`- 🟢 健康 (≥70%): ${summary.healthyCount}`);
    lines.push(`- 🟡 警告 (40-70%): ${summary.warningCount}`);
    lines.push(`- 🔴 危急 (<40%): ${summary.criticalCount}`);
    lines.push('');
    
    lines.push('## Top 5 技能');
    for (const report of summary.topSkills) {
      lines.push(`### ${report.skill.name}`);
      lines.push(`- 仓库: ${report.skill.repository}`);
      lines.push(`- 质量分: ${(report.quality.overall * 100).toFixed(1)}%`);
      lines.push(`- 评分: 适用性 ${(report.quality.applicability * 100).toFixed(0)}% | 内容质量 ${(report.quality.contentQuality * 100).toFixed(0)}% | 执行指导 ${(report.quality.executionGuidance * 100).toFixed(0)}% | 鲁棒性 ${(report.quality.robustness * 100).toFixed(0)}%`);
      if (report.issues.length > 0) {
        lines.push(`- 问题: ${report.issues.join('; ')}`);
      }
      lines.push('');
    }

    lines.push('## Bottom 5 技能');
    for (const report of summary.bottomSkills) {
      lines.push(`### ${report.skill.name}`);
      lines.push(`- 仓库: ${report.skill.repository}`);
      lines.push(`- 质量分: ${(report.quality.overall * 100).toFixed(1)}%`);
      if (report.issues.length > 0) {
        lines.push(`- 问题: ${report.issues.join('; ')}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
