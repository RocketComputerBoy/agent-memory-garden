'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  tags: string[];
}

const mockSkills: Skill[] = [
  { id: '1', name: 'web-search', description: 'Search the web for information', version: '1.0.0', status: 'healthy', score: 0.85, tags: ['search', 'web'] },
  { id: '2', name: 'code-analysis', description: 'Analyze code for issues', version: '1.2.0', status: 'healthy', score: 0.78, tags: ['code', 'analysis'] },
  { id: '3', name: 'report-generation', description: 'Generate reports from data', version: '1.0.0', status: 'warning', score: 0.55, tags: ['report'] },
  { id: '4', name: 'data-process', description: 'Process and transform data', version: '0.9.0', status: 'warning', score: 0.45, tags: ['data'] },
  { id: '5', name: 'api-integration', description: 'Integrate with external APIs', version: '1.1.0', status: 'healthy', score: 0.82, tags: ['api'] },
  { id: '6', name: 'old-api', description: 'Deprecated API handler', version: '0.5.0', status: 'critical', score: 0.15, tags: ['deprecated'] },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState(mockSkills);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');

  const filteredSkills = filter === 'all' ? skills : skills.filter(s => s.status === filter);

  return (
    <div>
      <nav className="nav">
        <div className="nav-brand">Agent Memory Garden</div>
        <div className="nav-links">
          <Link href="/" className="nav-link">Dashboard</Link>
          <Link href="/skills" className="nav-link active">Skills</Link>
          <Link href="/health" className="nav-link">Health</Link>
          <Link href="/evolution" className="nav-link">Evolution</Link>
          <Link href="/visualize" className="nav-link">Visualize</Link>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Skills</h1>
          <p className="page-subtitle">Manage your agent's skills</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('all')}
              >
                All ({skills.length})
              </button>
              <button 
                className={`btn ${filter === 'healthy' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('healthy')}
              >
                Healthy ({skills.filter(s => s.status === 'healthy').length})
              </button>
              <button 
                className={`btn ${filter === 'warning' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('warning')}
              >
                Warning ({skills.filter(s => s.status === 'warning').length})
              </button>
              <button 
                className={`btn ${filter === 'critical' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('critical')}
              >
                Critical ({skills.filter(s => s.status === 'critical').length})
              </button>
            </div>
            <button className="btn btn-primary">+ Add Skill</button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Version</th>
                <th>Status</th>
                <th>Score</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map(skill => (
                <tr key={skill.id}>
                  <td><strong>{skill.name}</strong></td>
                  <td>{skill.description}</td>
                  <td>v{skill.version}</td>
                  <td>
                    <span className={`badge badge-${skill.status}`}>
                      {skill.status}
                    </span>
                  </td>
                  <td>{(skill.score * 100).toFixed(0)}%</td>
                  <td>{skill.tags.join(', ')}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ marginRight: '4px' }}>Edit</button>
                    <button className="btn btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
