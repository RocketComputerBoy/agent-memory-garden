import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SkillStore, SkillHealth, SkillDiagnose } from '@agent-memory-garden/core';

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

const store = new SkillStore('./skills.db');
const healthChecker = new SkillHealth();
const diagnoser = new SkillDiagnose();

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
      const skill = store.getSkill(args.skillId as string);
      if (!skill) {
        return {
          content: [
            {
              type: 'text',
              text: `Skill not found: ${args.skillId}`,
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
      const skills = store.searchSkills(args.query as string);
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
      const skill = store.getSkill(args.skillId as string);
      if (!skill) {
        return {
          content: [
            {
              type: 'text',
              text: `Skill not found: ${args.skillId}`,
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Agent Memory Garden MCP Server running on stdio');
}

main().catch(console.error);
