# 会话摘要

## 项目背景

用户正在开发开源项目 **Agent Memory Garden**：一个 AI Agent 技能生命周期管理系统

核心痛点："你的 Agent 学了 47 个技能，但 12 个过时了，5 个会报错，2 个变坏了——而你完全不知道"

## 当前进展

### 已完成
- Phase 1-5：核心引擎（skill-store, quality assessment, diagnosis, health tracking, MCP server）
- Phase 6：React Flow 可视化（DAG 布局，自定义 SkillNode，MiniMap，Controls）
- Phase 7：完整 Web UI（Dashboard, Skills, Health, Evolution, Visualize, Graph）
- Phase 8：技能分享机制（export/import/packages/share-links）
- EvolutionEngine：自动淘汰、优化、降级、合并、升级
- 36 个单元测试通过
- Demo 脚本运行成功
- Web UI 按钮修复
- 项目结构整理

### 最新完成（本次会话）
- **LLM 质量评估**（`llm-quality.ts`）：使用 OpenAI API 真正理解技能内容
- **GitHub 扫描器**（`github-scanner.ts`）：扫描 GitHub MCP 仓库
- **质量报告生成**（`quality-reporter.ts`）：结合扫描器和 LLM 评估
- **MCP 配置指南**（`docs/MCP-SETUP.md`）：Claude Code/Cursor 集成说明
- **README 更新**：添加 LLM 提供商列表和使用说明
- **安全审查**：确认无敏感信息泄露

### 待完成
- 测试 MCP Server 与 Claude Code/Cursor 的集成
- 更新 README 反映 LLM 功能

## 关键技术决策

1. **sql.js** 替代 better-sqlite3（避免原生编译）
2. **GitHub API** 替代 simple-git（GitVersionControl 是空 stub）
3. **LLM 质量评估** 保留关键词评估作为降级方案
4. **baseUrl** 参数支持所有 OpenAI 兼容接口（DeepSeek, Moonshot 等）

## 项目结构

```
agent-memory-garden/
├── packages/
│   ├── core/          # 核心引擎
│   ├── cli/           # 命令行工具
│   ├── mcp-server/    # MCP 服务端
│   └── web-ui/        # Next.js Web 界面
├── demo.js            # 基础演示
├── demo-report.js     # 质量报告演示
└── docs/              # 文档
```

## GitHub 信息

- 许可证：MIT
