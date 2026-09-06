import OpenAI from 'openai';
import { Skill, SkillQualityScore } from './types';

export interface LLMQualityConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export class LLMQualityAssessor {
  private client: OpenAI;
  private model: string;

  constructor(config: LLMQualityConfig = {}) {
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseUrl,
    });
    this.model = config.model || 'gpt-4o-mini';
  }

  async assess(skill: Skill): Promise<SkillQualityScore> {
    const prompt = this.buildPrompt(skill);
    
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `你是一个技能质量评估专家。评估 AI Agent 技能的质量，返回 JSON 格式的评分。
评分维度：
1. applicability (0-1): 适用性 - 技能描述是否清晰、标签是否准确、内容是否完整
2. contentQuality (0-1): 内容质量 - 文档结构、代码示例、说明完整性
3. executionGuidance (0-1): 执行指导 - 安装说明、使用方法、测试用例
4. robustness (0-1): 鲁棒性 - 错误处理、异常捕获、边界情况

返回格式：
{
  "applicability": 0.0-1.0,
  "contentQuality": 0.0-1.0,
  "executionGuidance": 0.0-1.0,
  "robustness": 0.0-1.0,
  "overall": 0.0-1.0,
  "analysis": "简要分析说明"
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    const result = JSON.parse(content);
    
    return {
      applicability: this.clamp(result.applicability),
      contentQuality: this.clamp(result.contentQuality),
      executionGuidance: this.clamp(result.executionGuidance),
      robustness: this.clamp(result.robustness),
      overall: this.clamp(result.overall),
    };
  }

  async diagnose(skill: Skill): Promise<string[]> {
    const prompt = `分析以下 AI Agent 技能，列出所有问题（过期内容、冲突信息、缺失依赖、低质量内容等）。

技能名称: ${skill.name}
描述: ${skill.description}
版本: ${skill.version}
标签: ${skill.tags.join(', ')}
依赖: ${skill.dependencies.join(', ') || '无'}
内容:
${skill.content}

请返回 JSON 数组格式的问题列表，每个问题包含：
- type: 问题类型 (outdated/conflicting/low-quality/missing-dependency)
- severity: 严重程度 (low/medium/high)
- message: 问题描述

只返回 JSON 数组，不要其他内容。`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: '你是技能问题诊断专家。分析技能内容并返回问题列表（JSON 数组格式）。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    try {
      const result = JSON.parse(content);
      return Array.isArray(result) ? result : result.issues || [];
    } catch {
      return [];
    }
  }

  private buildPrompt(skill: Skill): string {
    return `评估以下 AI Agent 技能的质量：

技能名称: ${skill.name}
描述: ${skill.description}
版本: ${skill.version}
标签: ${skill.tags.join(', ')}
依赖: ${skill.dependencies.join(', ') || '无'}
创建时间: ${skill.createdAt}
更新时间: ${skill.updatedAt}

内容:
${skill.content || '无内容'}

请根据内容质量、文档完整性、错误处理、使用示例等方面进行评估。`;
  }

  private clamp(value: number): number {
    if (typeof value !== 'number' || isNaN(value)) {
      return 0;
    }
    return Math.max(0, Math.min(1, value));
  }
}
