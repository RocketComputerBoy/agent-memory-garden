import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SkillStore, HealthChecker, SkillDiagnose, SkillQuality } from '@agent-memory-garden/core';

let store: SkillStore;
let healthChecker: HealthChecker;
let diagnoser: SkillDiagnose;
let qualityAssessor: SkillQuality;

const server = new Server(
  {
    name: 'agent-memory-garden',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_skills',
        description: 'List all skills in the garden',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_skill',
        description: 'Get a specific skill by ID',
        inputSchema: {
          type: 'object',
          properties: {
            skillId: {
              type: 'string',
              description: 'The ID of the skill to retrieve',
            },
          },
          required: ['skillId'],
        },
      },
      {
        name: 'search_skills',
        description: 'Search skills by query',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_health',
        description: 'Get health status of all skills',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'diagnose_skill',
        description: 'Diagnose issues with a specific skill',
        inputSchema: {
          type: 'object',
          properties: {
            skillId: {
              type: 'string',
              description: 'The ID of the skill to diagnose',
            },
          },
          required: ['skillId'],
        },
      },
      {
        name: 'add_skill',
        description: 'Add a new skill to the garden',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Skill name',
            },
            description: {
              type: 'string',
              description: 'Skill description',
            },
            content: {
              type: 'string',
              description: 'Skill content or documentation',
            },
            path: {
              type: 'string',
              description: 'Path to skill file',
            },
            version: {
              type: 'string',
              description: 'Skill version',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Skill tags',
            },
            dependencies: {
              type: 'array',
              items: { type: 'string' },
              description: 'Skill dependencies',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'update_skill',
        description: 'Update an existing skill',
        inputSchema: {
          type: 'object',
          properties: {
            skillId: {
              type: 'string',
              description: 'The ID of the skill to update',
            },
            name: {
              type: 'string',
              description: 'Skill name',
            },
            description: {
              type: 'string',
              description: 'Skill description',
            },
            content: {
              type: 'string',
              description: 'Skill content or documentation',
            },
            path: {
              type: 'string',
              description: 'Path to skill file',
            },
            version: {
              type: 'string',
              description: 'Skill version',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Skill tags',
            },
            dependencies: {
              type: 'array',
              items: { type: 'string' },
              description: 'Skill dependencies',
            },
          },
          required: ['skillId'],
        },
      },
      {
        name: 'delete_skill',
        description: 'Archive a skill from the garden (soft delete)',
        inputSchema: {
          type: 'object',
          properties: {
            skillId: {
              type: 'string',
              description: 'The ID of the skill to archive',
            },
            reason: {
              type: 'string',
              description: 'Reason for archiving',
            },
          },
          required: ['skillId'],
        },
      },
      {
        name: 'get_skill_count',
        description: 'Get the total number of skills and count by tag',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'list_skills': {
      const skills = store.listSkills();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(skills, null, 2),
          },
        ],
      };
    }

    case 'get_skill': {
      const skillId = args?.skillId as string;
      const skill = store.getSkill(skillId);
      if (!skill) {
        return {
          content: [
            {
              type: 'text',
              text: `Skill not found: ${skillId}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(skill, null, 2),
          },
        ],
      };
    }

    case 'search_skills': {
      const query = args?.query as string;
      const skills = store.searchSkills(query);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(skills, null, 2),
          },
        ],
      };
    }

    case 'get_health': {
      const skills = store.listSkills();
      const healthChecks = await healthChecker.checkAllHealth(skills);
      const summary = healthChecker.getHealthSummary(healthChecks);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ summary, healthChecks }, null, 2),
          },
        ],
      };
    }

    case 'diagnose_skill': {
      const skillId = args?.skillId as string;
      const skill = store.getSkill(skillId);
      if (!skill) {
        return {
          content: [
            {
              type: 'text',
              text: `Skill not found: ${skillId}`,
            },
          ],
          isError: true,
        };
      }
      const issues = await diagnoser.diagnose(skill);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(issues, null, 2),
          },
        ],
      };
    }

    case 'add_skill': {
      const skillName = args?.name as string;
      
      // Check for duplicates
      const existing = store.findByName(skillName);
      if (existing) {
        return {
          content: [
            {
              type: 'text',
              text: `Skill already exists: ${skillName} (ID: ${existing.id})`,
            },
          ],
          isError: true,
        };
      }
      
      // Check if dependencies are satisfied (batch query)
      const dependencies = (args?.dependencies as string[]) || [];
      const missingDeps: string[] = [];
      
      if (dependencies.length > 0) {
        const allSkills = store.listSkills();
        const nameSet = new Set(allSkills.map(s => s.name));
        for (const dep of dependencies) {
          if (!nameSet.has(dep)) {
            missingDeps.push(dep);
          }
        }
      }
      
      if (missingDeps.length > 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Missing dependencies: ${missingDeps.join(', ')}`,
            },
          ],
          isError: true,
        };
      }
      
      // Create skill
      const skill = store.createSkill({
        name: skillName,
        description: (args?.description as string) || '',
        content: (args?.content as string) || '',
        path: (args?.path as string) || '',
        version: (args?.version as string) || '1.0.0',
        tags: (args?.tags as string[]) || [],
        dependencies: dependencies,
      });
      
      // Auto-assess quality
      const quality = qualityAssessor.assess(skill);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              skill,
              quality,
              message: 'Skill added successfully',
            }, null, 2),
          },
        ],
      };
    }

    case 'update_skill': {
      const skillId = args?.skillId as string;
      const existing = store.getSkill(skillId);
      
      if (!existing) {
        return {
          content: [
            {
              type: 'text',
              text: `Skill not found: ${skillId}`,
            },
          ],
          isError: true,
        };
      }
      
      // Check if dependencies are satisfied (batch query)
      const newDependencies = (args?.dependencies as string[]) || existing.dependencies;
      const missingDeps: string[] = [];
      
      if (newDependencies.length > 0) {
        const allSkills = store.listSkills();
        const nameSet = new Set(allSkills.map(s => s.name));
        for (const dep of newDependencies) {
          if (!nameSet.has(dep)) {
            missingDeps.push(dep);
          }
        }
      }
      
      if (missingDeps.length > 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Missing dependencies: ${missingDeps.join(', ')}`,
            },
          ],
          isError: true,
        };
      }
      
      // Check if other skills depend on this skill
      const dependentSkills = store.getSkillsByDependency(existing.name);
      const wouldBreak: string[] = [];
      
      // Check if update would break dependencies
      if (args?.name && args.name !== existing.name) {
        for (const dependent of dependentSkills) {
          if (dependent.dependencies.includes(existing.name)) {
            wouldBreak.push(dependent.name);
          }
        }
      }
      
      if (wouldBreak.length > 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Update would break dependencies for: ${wouldBreak.join(', ')}`,
            },
          ],
          isError: true,
        };
      }
      
      // Apply updates
      const updates: Record<string, unknown> = {};
      if (args?.name !== undefined) updates.name = args.name;
      if (args?.description !== undefined) updates.description = args.description;
      if (args?.content !== undefined) updates.content = args.content;
      if (args?.path !== undefined) updates.path = args.path;
      if (args?.version !== undefined) updates.version = args.version;
      if (args?.tags !== undefined) updates.tags = args.tags;
      if (args?.dependencies !== undefined) updates.dependencies = args.dependencies;
      
      const updated = store.updateSkill(skillId, updates);
      
      if (!updated) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to update skill: ${skillId}`,
            },
          ],
          isError: true,
        };
      }
      
      // Re-assess quality
      const quality = qualityAssessor.assess(updated);
      
      // Check for new issues
      const issues = await diagnoser.diagnose(updated);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              skill: updated,
              quality,
              issues,
              message: 'Skill updated successfully',
            }, null, 2),
          },
        ],
      };
    }

    case 'delete_skill': {
      const skillId = args?.skillId as string;
      const skill = store.getSkill(skillId);
      
      if (!skill) {
        return {
          content: [
            {
              type: 'text',
              text: `Skill not found: ${skillId}`,
            },
          ],
          isError: true,
        };
      }
      
      // Check if other skills depend on this skill
      const dependentSkills = store.getSkillsByDependency(skill.name);
      if (dependentSkills.length > 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Cannot delete: ${dependentSkills.map(s => s.name).join(', ')} depend on this skill`,
            },
          ],
          isError: true,
        };
      }
      
      // Archive instead of delete
      const reason = (args?.reason as string) || 'Deleted by user';
      const archived = store.archiveSkill(skillId, reason);
      
      if (!archived) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to archive skill: ${skillId}`,
            },
          ],
          isError: true,
        };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: 'Skill archived successfully',
              skillId,
              skillName: skill.name,
              reason,
            }, null, 2),
          },
        ],
      };
    }

    case 'get_skill_count': {
      const count = store.getSkillCount();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(count, null, 2)
          }
        ]
      }
    }
    default:
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
});

async function main() {
  store = await SkillStore.create('./skills.db');
  healthChecker = new HealthChecker();
  diagnoser = new SkillDiagnose();
  qualityAssessor = new SkillQuality();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Agent Memory Garden MCP Server running on stdio');
}

main().catch(console.error);
