'use client';

import React, { useState, useEffect } from 'react';
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
import Link from 'next/link';
import SkillNode from '../../../components/SkillNode';
import { getLayoutedElements } from '../../../utils/layout';

interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
  dependencies: string[];
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
    const mockSkills: Skill[] = [
      { id: '1', name: 'web-search', description: 'Search the web', version: '1.0.0', tags: ['search'], dependencies: [] },
      { id: '2', name: 'code-analysis', description: 'Analyze code', version: '1.0.0', tags: ['code'], dependencies: ['1'] },
      { id: '3', name: 'report-generation', description: 'Generate reports', version: '1.0.0', tags: ['report'], dependencies: ['2'] },
      { id: '4', name: 'data-process', description: 'Process data', version: '1.0.0', tags: ['data'], dependencies: ['1'] },
      { id: '5', name: 'old-api', description: 'Deprecated', version: '0.5.0', tags: [], dependencies: [''] },
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

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges, 'TB');
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setLoading(false);
  }, [setNodes, setEdges]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div style={{ 
        padding: '12px 24px', 
        borderBottom: '1px solid #ddd',
        background: '#f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/visualize" style={{ color: '#3b82f6' }}>← Back</Link>
          <h1 style={{ margin: 0, fontSize: '18px' }}>Skill Graph</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
          <span>🟢 {healthChecks.filter((h) => h.status === 'healthy').length}</span>
          <span>🟡 {healthChecks.filter((h) => h.status === 'warning').length}</span>
          <span>🔴 {healthChecks.filter((h) => h.status === 'critical').length}</span>
        </div>
      </div>
      <div style={{ height: 'calc(100% - 50px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
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
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function GraphPage() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
