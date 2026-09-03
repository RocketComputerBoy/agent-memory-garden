import { SkillQuality } from '../skill-quality';
import { Skill } from '../types';

describe('SkillQuality', () => {
  let quality: SkillQuality;

  beforeEach(() => {
    quality = new SkillQuality();
  });

  it('should assess a skill with good quality', async () => {
    const skill: Skill = {
      id: '1',
      name: 'good-skill',
      description: 'A well-documented skill with examples and error handling',
      content: `
# Good Skill

This is a well-documented skill.

## Installation
npm install good-skill

## Usage
\`\`\`javascript
const skill = require('good-skill');
skill.execute();
\`\`\`

## Error Handling
This skill handles errors properly with exception handling.

## Timeout
Default timeout is 30 seconds.

## Retry
This skill retries on failure.

## Examples
Here are some examples of how to use this skill.
      `,
      path: './skills/good-skill.md',
      version: '1.0.0',
      tags: ['example', 'documentation'],
      dependencies: ['other-skill'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const score = await quality.assess(skill);

    expect(score.applicability).toBeGreaterThan(0.5);
    expect(score.contentQuality).toBeGreaterThan(0.5);
    expect(score.executionGuidance).toBeGreaterThan(0.5);
    expect(score.robustness).toBeGreaterThan(0.5);
    expect(score.overall).toBeGreaterThan(0.5);
  });

  it('should assess a skill with poor quality', async () => {
    const skill: Skill = {
      id: '2',
      name: 'poor-skill',
      description: '',
      content: 'Short content',
      path: './skills/poor-skill.md',
      version: '0.1.0',
      tags: [],
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const score = await quality.assess(skill);

    expect(score.applicability).toBeLessThan(0.5);
    expect(score.contentQuality).toBeLessThan(0.5);
    expect(score.overall).toBeLessThan(0.5);
  });

  it('should give higher score for skills with examples', async () => {
    const skillWithExamples: Skill = {
      id: '3',
      name: 'skill-with-examples',
      description: 'A skill with examples',
      content: `
# Skill with Examples

## Example 1
This is example 1.

## Example 2
This is example 2.
      `,
      path: './skills/skill-with-examples.md',
      version: '1.0.0',
      tags: ['example'],
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const skillWithoutExamples: Skill = {
      id: '4',
      name: 'skill-without-examples',
      description: 'A skill without examples',
      content: `
# Skill without Examples

This skill has no examples.
      `,
      path: './skills/skill-without-examples.md',
      version: '1.0.0',
      tags: [],
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const scoreWith = await quality.assess(skillWithExamples);
    const scoreWithout = await quality.assess(skillWithoutExamples);

    expect(scoreWith.contentQuality).toBeGreaterThanOrEqual(scoreWithout.contentQuality);
  });
});
