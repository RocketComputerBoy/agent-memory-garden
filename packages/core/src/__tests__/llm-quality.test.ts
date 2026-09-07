import { LLMQualityAssessor } from '../llm-quality';
import { Skill } from '../types';

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  applicability: 0.85,
                  contentQuality: 0.90,
                  executionGuidance: 0.80,
                  robustness: 0.75,
                  overall: 0.82,
                  analysis: 'This is a well-structured skill with good documentation.'
                })
              }
            }]
          })
        }
      }
    }))
  };
});

describe('LLMQualityAssessor', () => {
  let assessor: LLMQualityAssessor;
  const mockSkill: Skill = {
    id: 'test-skill',
    name: 'Test Skill',
    description: 'A test skill for unit testing',
    version: '1.0.0',
    tags: ['test', 'unit-test'],
    content: '# Test Skill\n\nThis is a test skill with proper documentation.',
    dependencies: ['test-dep'],
    path: '/skills/test-skill/SKILL.md',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    assessor = new LLMQualityAssessor({
      apiKey: 'test-api-key',
      model: 'gpt-4o-mini'
    });
  });

  it('should assess skill quality using LLM', async () => {
    const result = await assessor.assess(mockSkill);
    
    expect(result).toHaveProperty('applicability');
    expect(result).toHaveProperty('contentQuality');
    expect(result).toHaveProperty('executionGuidance');
    expect(result).toHaveProperty('robustness');
    expect(result).toHaveProperty('overall');
    
    expect(result.applicability).toBeGreaterThanOrEqual(0);
    expect(result.applicability).toBeLessThanOrEqual(1);
    expect(result.contentQuality).toBeGreaterThanOrEqual(0);
    expect(result.contentQuality).toBeLessThanOrEqual(1);
    expect(result.executionGuidance).toBeGreaterThanOrEqual(0);
    expect(result.executionGuidance).toBeLessThanOrEqual(1);
    expect(result.robustness).toBeGreaterThanOrEqual(0);
    expect(result.robustness).toBeLessThanOrEqual(1);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(1);
  });

  it('should handle missing content gracefully', async () => {
    const skillWithoutContent = {
      ...mockSkill,
      content: ''
    };
    
    const result = await assessor.assess(skillWithoutContent);
    expect(result).toHaveProperty('overall');
  });

  it('should clamp values to valid range', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            applicability: 1.5,
            contentQuality: -0.2,
            executionGuidance: 0.8,
            robustness: 0.9,
            overall: 1.2
          })
        }
      }]
    });
    
    const OpenAI = require('openai').default;
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }));
    
    const testAssessor = new LLMQualityAssessor({
      apiKey: 'test-key',
      model: 'gpt-4o-mini'
    });
    
    const result = await testAssessor.assess(mockSkill);
    
    expect(result.applicability).toBe(1);
    expect(result.contentQuality).toBe(0);
    expect(result.overall).toBe(1);
  });
});
