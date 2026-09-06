import { QualityReporter } from './packages/core/src';

const REPOS = [
  { owner: 'tmolavi', repo: 'mcp-agent-skills-hub', skillsDir: 'skills' },
  { owner: 'anthropics', repo: 'skills', skillsDir: '' },
];

async function main() {
  console.log('=== Agent Memory Garden - Quality Report ===\n');

  const reporter = new QualityReporter({
    model: 'gpt-4o-mini',
  });

  console.log('Scanning GitHub repositories for MCP skills...\n');

  try {
    const summary = await reporter.generateReport(REPOS, 5);
    const report = reporter.formatReport(summary);

    console.log('\n' + report);

    const fs = require('fs');
    const reportPath = './quality-report.md';
    fs.writeFileSync(reportPath, report);
    console.log(`\nReport saved to ${reportPath}`);
  } catch (error) {
    console.error('Error generating report:', error);
    console.log('\nNote: You need to set OPENAI_API_KEY environment variable');
    console.log('export OPENAI_API_KEY="your-api-key"');
  }
}

main();
