# Agent Memory Garden

Make Agent skill growth visible, controllable, and shareable.

## The Problem

Your Agent learned 47 skills, but 12 are outdated, 5 produce errors, 2 are going bad — and you have no idea.

## The Solution

Agent Memory Garden provides:

- **Skill Storage**: Organized skill management in SQLite + Markdown
- **Quality Assessment**: 4-dimension evaluation (applicability, content quality, execution guidance, robustness)
- **Health Monitoring**: Continuous tracking of skill health with automated diagnosis
- **Visualization**: Interactive DAG visualization of skill relationships
- **Version Control**: Git-native versioning with rollback capability
- **MCP Integration**: Framework-agnostic via Model Context Protocol

## Features

### Quality Assessment

Evaluate skills across 4 dimensions:
- **Applicability**: Relevance to agent's capabilities
- **Content Quality**: Completeness and accuracy
- **Execution Guidance**: Test coverage and error handling
- **Robustness**: Failure scenarios and edge cases

### Health Monitoring

Track skill health over time with automated diagnosis and fix suggestions.

### Visualization

Interactive DAG visualization of skill relationships using React Flow.

### Version Control

Git-native versioning with snapshot, diff, and rollback capabilities.

### MCP Integration

Framework-agnostic skill access via Model Context Protocol.

## Quick Start

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Initialize a new skill garden
npx agmg init

# Add a skill
npx agmg add skill-name --path ./skill.md

# Check skill health
npx agmg health

# Visualize skill relationships
npx agmg visualize
```

## Packages

- `@agent-memory-garden/core`: Core engine with skill storage, versioning, and quality assessment
- `@agent-memory-garden/cli`: Command-line interface for managing skill gardens
- `@agent-memory-garden/mcp-server`: MCP server for framework-agnostic skill access
- `@agent-memory-garden/web-ui`: Web interface for visualization and monitoring

## Development

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests
npm run test

# Run linter
npm run lint
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Web UI (Next.js)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Skill Garden│  │ Health      │  │ Diagnostics │    │
│  │ Visualization│  │ Dashboard   │  │ Console     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     CLI Tool (Node.js)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ skill init  │  │ skill check │  │ skill doctor│    │
│  │ skill list  │  │ skill eval  │  │ skill prune │    │
│  │ skill add   │  │ skill snapshot│ │ skill rollback│  │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    MCP Server (TypeScript)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ list_skills │  │ get_skill   │  │ search_skills│   │
│  │ get_health  │  │ get_dag     │  │ diagnose     │   │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Core Engine (TypeScript)             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Skill Store │  │ Version     │  │ Quality     │    │
│  │ (SQLite +   │  │ Control     │  │ Assessment  │    │
│  │  Markdown)  │  │ (Git)       │  │ (4-Dim)     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Health      │  │ Diagnosis   │  │ Auto-Prune  │    │
│  │ Tracker     │  │ Engine      │  │ Engine      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Contributing](docs/contributing.md)

## License

MIT
