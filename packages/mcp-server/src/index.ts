import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SkillStore, HealthChecker, SkillDiagnose } from '@agent-memory-garden/core';

let store: SkillStore;
let healthChecker: HealthChecker;
let diagnoser: SkillDiagnose;

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

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Agent Memory Garden MCP Server running on stdio');
}

main().catch(console.error);
