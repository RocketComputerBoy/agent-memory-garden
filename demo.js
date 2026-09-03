#!/usr/bin/env node

const { HealthChecker } = require('./packages/core/dist/skill-health');
const { SkillDiagnose } = require('./packages/core/dist/skill-diagnose');
const { SkillQuality } = require('./packages/core/dist/skill-quality');
const { SkillStore } = require('./packages/core/dist/skill-store');

async function demo() {
  console.log('=== Agent Memory Garden Demo ===\n');

  // 1. 创建技能存储
  console.log('1. 创建技能存储...');
  const store = await SkillStore.create(':memory:');

  // 2. 添加一些技能
  console.log('2. 添加技能...\n');

  const goodSkill = store.createSkill({
    name: 'web-search',
    description: 'Search the web for information',
    content: `
# Web Search Skill

This skill allows you to search the web.

## Installation
npm install web-search

## Usage
\`\`\`javascript
const search = require('web-search');
const results = await search('query');
\`\`\`

## Error Handling
Handles network errors with retry logic.

## Timeout
Default timeout is 30 seconds.

## Retry
Retries up to 3 times on failure.

## Examples
Here are some examples of how to use this skill.
    `,
    path: './skills/web-search.md',
    version: '1.0.0',
    tags: ['search', 'web'],
    dependencies: [],
  });

  const badSkill = store.createSkill({
    name: 'old-api',
    description: 'An outdated skill',
    content: 'This skill is deprecated and should not be used.',
    path: './skills/old-api.md',
    version: '0.5.0',
    tags: [],
    dependencies: [''],
  });

  const okSkill = store.createSkill({
    name: 'data-process',
    description: 'Process data',
    content: `
# Data Process

Basic data processing skill.

## Usage
Use this skill to process data.
    `,
    path: './skills/data-process.md',
    version: '1.0.0',
    tags: ['data'],
    dependencies: ['web-search'],
  });

  console.log('  ✓ 添加了 3 个技能\n');

  // 3. 列出所有技能
  console.log('3. 所有技能:');
  const skills = store.listSkills();
  skills.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.name} (v${s.version})`);
  });
  console.log();

  // 4. 搜索技能
  console.log('4. 搜索 "web":');
  const results = store.searchSkills('web');
  results.forEach((s) => {
    console.log(`  ✓ 找到: ${s.name}`);
  });
  console.log();

  // 5. 质量评估
  console.log('5. 质量评估:');
  const quality = new SkillQuality();
  for (const skill of skills) {
    const score = await quality.assess(skill);
    const status = score.overall > 0.6 ? '✓' : score.overall > 0.4 ? '⚠' : '✗';
    console.log(`  ${status} ${skill.name}: ${(score.overall * 100).toFixed(0)}%`);
  }
  console.log();

  // 6. 诊断
  console.log('6. 诊断问题:');
  const diagnoser = new SkillDiagnose();
  for (const skill of skills) {
    const issues = await diagnoser.diagnose(skill);
    if (issues.length > 0) {
      console.log(`  ✗ ${skill.name}:`);
      issues.forEach((issue) => {
        console.log(`    - [${issue.severity}] ${issue.message}`);
      });
    } else {
      console.log(`  ✓ ${skill.name}: 无问题`);
    }
  }
  console.log();

  // 7. 健康检查
  console.log('7. 健康检查:');
  const healthChecker = new HealthChecker();
  const healthChecks = await healthChecker.checkAllHealth(skills);
  const summary = healthChecker.getHealthSummary(healthChecks);

  healthChecks.forEach((h) => {
    const skill = skills.find((s) => s.id === h.skillId);
    const icon = h.status === 'healthy' ? '🟢' : h.status === 'warning' ? '🟡' : '🔴';
    console.log(`  ${icon} ${skill.name}: ${h.status} (${(h.score * 100).toFixed(0)}%)`);
  });

  console.log('\n  摘要:');
  console.log(`    总计: ${summary.total}`);
  console.log(`    健康: ${summary.healthy}`);
  console.log(`    警告: ${summary.warning}`);
  console.log(`    关键: ${summary.critical}`);
  console.log(`    平均分: ${(summary.averageScore * 100).toFixed(0)}%`);
  console.log();

  // 8. Markdown 导出
  console.log('8. Markdown 导出 (web-search):');
  const markdown = store.exportToMarkdown(goodSkill);
  console.log('  ' + markdown.split('\n').slice(0, 8).join('\n  '));
  console.log('  ...\n');

  store.close();
  console.log('=== Demo 完成 ===');
}

demo().catch(console.error);
