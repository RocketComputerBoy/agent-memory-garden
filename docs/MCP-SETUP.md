# Agent Memory Garden MCP Server

本项目实现了 MCP (Model Context Protocol) 服务器，可以与 Claude Code、Cursor 等 AI Agent 工具集成。

## 功能

| 工具 | 说明 |
|------|------|
| `list_skills` | 列出所有技能 |
| `get_skill` | 获取指定技能详情 |
| `search_skills` | 搜索技能 |
| `get_health` | 获取技能健康状态 |
| `diagnose_skill` | 诊断技能问题 |

## 安装

```bash
cd agent-memory-garden
npm install
cd packages/mcp-server
npm run build
```

## 配置

### Claude Code

在 `~/.claude/claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "agent-memory-garden": {
      "command": "node",
      "args": ["/absolute/path/to/agent-memory-garden/packages/mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Cursor

在 `.cursor/mcp.json` 中添加（项目根目录）：

```json
{
  "mcpServers": {
    "agent-memory-garden": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 使用

配置完成后，重启 Claude Code 或 Cursor，即可使用以下命令：

- "列出所有技能"
- "查看 web-search 技能的详情"
- "搜索与 API 相关的技能"
- "检查所有技能的健康状态"
- "诊断 old-api 技能的问题"

## 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `OPENAI_API_KEY` | OpenAI API 密钥（用于 LLM 质量评估） | 否 |

如果不需要 LLM 质量评估，可以不设置 `OPENAI_API_KEY`，系统会使用内置的关键词匹配评估。

## 工具详情

### list_skills
返回所有已存储技能的列表。

### get_skill
参数：`skillId` (string)
返回指定技能的详细信息。

### search_skills
参数：`query` (string)
根据关键词搜索技能。

### get_health
返回所有技能的健康状态摘要。

### diagnose_skill
参数：`skillId` (string)
分析指定技能的问题并返回诊断结果。
