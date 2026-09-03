'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import SkillNode from '../components/SkillNode';
import { getLayoutedElements } from '../utils/layout';

interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
  dependencies: string[];
  content: string;
}

interface SkillHealth {
  skillId: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
}

const nodeTypes = {
  skillNode: SkillNode,
};

function Flow() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [healthChecks, setHealthChecks] = useState<SkillHealth[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockSkills: Skill[] = [
      {
        id: '1',
        name: 'web-search',
        description: 'Search the web for information',
        version: '1.0.0',
        tags: ['search', 'web'],
        dependencies: [],
        content: 'Search the web...',
      },
      {
        id: '2',
        name: 'code-analysis',
        description: 'Analyze code for issues',
        version: '1.0.0',
        tags: ['code', 'analysis'],
        dependencies: ['1'],
        content: 'Analyze code...',
      },
      {
        id: '3',
        name: 'report-generation',
        description: 'Generate reports from analysis',
        version: '1.0.0',
        tags: ['report', 'generation'],
        dependencies: ['2'],
        content: 'Generate reports...',
      },
      {
        id: '4',
        name: 'data-process',
        description: 'Process and transform data',
        version: '1.0.0',
        tags: ['data', 'process'],
        dependencies: ['1'],
        content: 'Process data...',
      },
      {
        id: '5',
        name: 'old-api',
        description: 'An outdated skill',
        version: '0.5.0',
        tags: [],
        dependencies: [''],
        content: 'Deprecated...',
      },
    ];

    const mockHealth: SkillHealth[] = [
      { skillId: '1', score: 0.78, status: 'healthy' },
      { skillId: '2', score: 0.65, status: 'healthy' },
      { skillId: '3', score: 0.55, status: 'warning' },
      { skillId: '4', score: 0.24, status: 'warning' },
      { skillId: '5', score: 0.13, status: 'critical' },
    ];

    setSkills(mockSkills);
    setHealthChecks(mockHealth);

    // Convert to React Flow nodes
    const flowNodes: Node[] = mockSkills.map((skill) => {
      const health = mockHealth.find((h) => h.skillId === skill.id);
      return {
        id: skill.id,
        type: 'skillNode',
        position: { x: 0, y: 0 },
        data: {
          label: skill.name,
          description: skill.description,
          version: skill.version,
          status: health?.status || 'healthy',
          score: health?.score || 0,
        },
      };
    });

    // Convert dependencies to edges
    const flowEdges: Edge[] = [];
    mockSkills.forEach((skill) => {
      skill.dependencies.forEach((depId) => {
        if (depId && mockSkills.some((s) => s.id === depId)) {
          flowEdges.push({
            id: `${depId}-${skill.id}`,
            source: depId,
            target: skill.id,
            animated: true,
            style: { stroke: '#888' },
          });
        }
      });
    });

    // Apply DAG layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges,
      'TB'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setLoading(false);
  }, [setNodes, setEdges]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Agent Memory Garden</h1>
        <p>Loading skills...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid #ddd',
        background: '#f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Agent Memory Garden</h1>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
            Visualize and manage your agent's skills
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
          <span>🟢 Healthy: {healthChecks.filter((h) => h.status === 'healthy').length}</span>
          <span>🟡 Warning: {healthChecks.filter((h) => h.status === 'warning').length}</span>
          <span>🔴 Critical: {healthChecks.filter((h) => h.status === 'critical').length}</span>
        </div>
      </div>
      <div style={{ height: 'calc(100% - 70px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background gap={16} />
          <MiniMap
            nodeColor={(node) => {
              const health = healthChecks.find((h) => h.skillId === node.id);
              if (health?.status === 'critical') return '#ef4444';
              if (health?.status === 'warning') return '#f59e0b';
              return '#10b981';
            }}
            maskColor="rgba(0,0,0,0.1)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
