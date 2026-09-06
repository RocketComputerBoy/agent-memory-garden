# Agent Memory Garden

> 让 Agent 的技能从"学会就忘"变成"持续进化"

## 它是什么

Agent Memory Garden 是一个 AI Agent 技能生命周期管理系统。它解决一个正在快速恶化的问题：

**你的 Agent 学了 47 个技能，但 12 个过时了，5 个会报错，2 个变坏了——而你完全不知道。**

MCP 生态爆发式增长，公开技能中 91.8% 存在缺陷（缺依赖、无文档、已过期）。传统方案只是"注册中心"列出技能，而 Agent Memory Garden 是"质量管理系统"——评估、监控、进化。

## 核心功能

| 功能 | 说明 |
|------|------|
| **LLM 质量评估** | 使用 GPT-4 智能分析技能内容，4 维度评分 |
| **问题诊断** | 自动检测过期、冲突、低质量、缺失依赖等问题 |
| **健康监控** | 实时追踪技能状态（healthy / warning / critical） |
| **自进化引擎** | 根据使用数据自动建议优化、淘汰、合并、升级 |
| **GitHub 扫描** | 扫描 GitHub 上的 MCP 技能仓库，输出质量报告 |
| **可视化** | React Flow 交互式技能关系图，支持导出 PNG/SVG |
| **Web UI** | 完整的管理界面（Dashboard、Skills、Health、Evolution、Visualize） |
| **MCP Server** | 可接入 Claude Code、Cursor 等 Agent 工具 |
| **CLI 工具** | 命令行管理技能 |

## 项目结构

```
agent-memory-garden/
├── packages/
│   ├── core/          # 核心引擎
│   │   └── src/
│   │       ├── types.ts           # 类型定义
│   │       ├── skill-store.ts     # SQLite 技能存储
│   │       ├── skill-quality.ts   # 关键词评估（基础版）
│   │       ├── llm-quality.ts     # LLM 智能评估
│   │       ├── skill-diagnose.ts  # 问题诊断
│   │       ├── skill-health.ts    # 健康监控
│   │       ├── evolution-engine.ts # 自进化引擎
│   │       ├── skill-share.ts     # 技能分享
│   │       ├── github-scanner.ts  # GitHub 扫描
│   │       └── quality-reporter.ts # 质量报告生成
│   ├── cli/           # 命令行工具
│   ├── mcp-server/    # MCP 服务端
│   └── web-ui/        # Next.js Web 界面
├── demo.js            # 基础演示
├── demo-report.js     # 质量报告演示
└── docs/              # 文档
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 8

### 安装

```bash
git clone https://github.com/RocketComputerBoy/agent-memory-garden.git
cd agent-memory-garden
npm install
```

### 运行 Demo

```bash
node demo.js
```

### 生成质量报告

```bash
export OPENAI_API_KEY="your-api-key"
node demo-report.js
```

### 启动 Web UI

```bash
cd packages/web-ui
npm run dev
```

访问 http://localhost:3000

### 运行测试

```bash
cd packages/core
npm test
```

## 质量评估

### 关键词评估（基础版）

无需 API Key，基于规则的快速评估：

| 维度 | 评估内容 |
|------|----------|
| **适用性** | 描述完整性、标签、内容长度、依赖声明 |
| **内容质量** | 文档结构、代码示例、错误处理说明 |
| **执行指导** | 安装说明、使用方法、测试用例、示例 |
| **鲁棒性** | 错误处理、异常捕获、超时机制、重试逻辑 |

### LLM 智能评估（推荐）

使用 LLM 真正理解技能内容：

```bash
export OPENAI_API_KEY="your-api-key"
node demo-report.js
```

支持所有 OpenAI 兼容接口，通过 `baseUrl` 配置：

```typescript
const assessor = new LLMQualityAssessor({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.deepseek.com/v1',  // DeepSeek
  model: 'deepseek-chat',
});
```

| 提供商 | baseUrl | 模型示例 |
|--------|---------|----------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| Moonshot | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-turbo` |
| Ollama (本地) | `http://localhost:11434/v1` | `llama3` |

## MCP 集成

支持与 Claude Code、Cursor 等 AI Agent 工具集成。

详细配置请查看 [MCP-SETUP.md](docs/MCP-SETUP.md)

## 技术栈

| 层级 | 技术 |
|------|------|
| 存储 | sql.js（纯 JS SQLite） |
| 后端 | TypeScript, Node.js |
| 前端 | Next.js 14, React 18 |
| 可视化 | React Flow, dagre |
| AI | OpenAI GPT-4 |
| 集成 | MCP SDK |
| 测试 | Jest |

## 进化策略

| 策略 | 触发条件 |
|------|----------|
| **淘汰** | 健康分 < 30%，使用次数 < 5 |
| **优化** | 存在高优先级问题 |
| **降级** | 质量低且使用少 |
| **合并** | 与高质量技能功能重复 |
| **升级** | 高质量且高使用率 |

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

## 许可证

MIT License

---

<p align="center">
  <i>"AI Agent 越来越多，技能越来越杂，总得有人管质量。"</i>
</p>
