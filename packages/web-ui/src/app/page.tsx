'use client';

import React, { useState, useEffect } from 'react';
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
  dependencies: string[];
}

export default function Home() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch skills from API
    const mockSkills: Skill[] = [
      {
        id: '1',
        name: 'web-search',
        description: 'Search the web for information',
        version: '0.1.0',
        tags: ['search', 'web'],
        dependencies: [],
      },
      {
        id: '2',
        name: 'code-analysis',
        description: 'Analyze code for issues',
        version: '0.1.0',
        tags: ['code', 'analysis'],
        dependencies: ['1'],
      },
      {
        id: '3',
        name: 'report-generation',
        description: 'Generate reports from analysis',
        version: '0.1.0',
        tags: ['report', 'generation'],
        dependencies: ['2'],
      },
    ];

    setSkills(mockSkills);

    // Convert skills to React Flow nodes
    const flowNodes: Node[] = mockSkills.map((skill, index) => ({
      id: skill.id,
      position: { x: 250, y: index * 150 },
      data: { label: skill.name },
      style: {
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        background: '#fff',
      },
    }));

    // Convert dependencies to edges
    const flowEdges: Edge[] = [];
    mockSkills.forEach((skill) => {
      skill.dependencies.forEach((depId) => {
        flowEdges.push({
          id: `${depId}-${skill.id}`,
          source: depId,
          target: skill.id,
          animated: true,
        });
      });
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Agent Memory Garden</h1>
        <p>Loading skills...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
        <h1>Agent Memory Garden</h1>
        <p>Visualize and manage your agent's skills</p>
      </div>
      <div style={{ height: 'calc(100% - 80px)' }}>
        <ReactFlow nodes={nodes} edges={edges} fitView />
      </div>
    </div>
  );
}
