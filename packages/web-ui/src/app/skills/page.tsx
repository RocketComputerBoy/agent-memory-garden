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
  author: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  dependencies: string[];
  examples: string[];
  notes: string;
}

const initialSkills: Skill[] = [
  {
    id: '1', name: 'web-search', description: 'Search the web for information', version: '1.0.0',
    status: 'healthy', score: 0.85, tags: ['search', 'web'],
    author: 'OpenAI', createdAt: '2025-01-15', updatedAt: '2025-08-20',
    usageCount: 245, dependencies: ['axios', 'cheerio'],
    examples: ['Search for latest news about AI', 'Find documentation for React hooks'],
    notes: 'Supports multiple search engines. Rate limiting: 100 requests/hour.'
  },
  {
    id: '2', name: 'code-analysis', description: 'Analyze code for issues', version: '1.2.0',
    status: 'healthy', score: 0.78, tags: ['code', 'analysis'],
    author: 'Anthropic', createdAt: '2025-02-10', updatedAt: '2025-07-15',
    usageCount: 189, dependencies: ['typescript', 'ast-types'],
    examples: ['Analyze a TypeScript file for bugs', 'Check code complexity'],
    notes: 'Supports JavaScript, TypeScript, Python. Uses AST analysis.'
  },
  {
    id: '3', name: 'report-generation', description: 'Generate reports from data', version: '1.0.0',
    status: 'warning', score: 0.55, tags: ['report'],
    author: 'Community', createdAt: '2025-03-05', updatedAt: '2025-06-10',
    usageCount: 8, dependencies: ['puppeteer', 'handlebars'],
    examples: ['Generate PDF report from JSON data', 'Create HTML summary'],
    notes: 'Template-based. Missing error handling for large datasets.'
  },
  {
    id: '4', name: 'data-process', description: 'Process and transform data', version: '0.9.0',
    status: 'warning', score: 0.45, tags: ['data'],
    author: 'Community', createdAt: '2025-04-20', updatedAt: '2025-05-01',
    usageCount: 42, dependencies: ['lodash', 'papaparse'],
    examples: ['Transform CSV to JSON', 'Clean and validate data'],
    notes: 'Early version. Limited to basic transformations.'
  },
  {
    id: '5', name: 'api-integration', description: 'Integrate with external APIs', version: '1.1.0',
    status: 'healthy', score: 0.82, tags: ['api'],
    author: 'OpenAI', createdAt: '2025-01-20', updatedAt: '2025-09-01',
    usageCount: 312, dependencies: ['axios', 'zod'],
    examples: ['Call REST API with authentication', 'Handle GraphQL queries'],
    notes: 'Supports REST and GraphQL. Built-in retry logic.'
  },
  {
    id: '6', name: 'old-api', description: 'Deprecated API handler', version: '0.5.0',
    status: 'critical', score: 0.15, tags: ['deprecated'],
    author: 'Unknown', createdAt: '2024-06-15', updatedAt: '2024-12-01',
    usageCount: 2, dependencies: [],
    examples: ['Legacy API calls'],
    notes: 'DEPRECATED: Use api-integration instead. Security vulnerabilities detected.'
  },
];

const statusDescriptions = {
  healthy: 'This skill is performing well with no detected issues.',
  warning: 'This skill has some issues that should be addressed.',
  critical: 'This skill has critical problems and should be fixed or replaced.',
};

export default function SkillsPage() {
  const [skills, setSkills] = useState(initialSkills);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [viewingSkill, setViewingSkill] = useState<Skill | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', description: '', version: '1.0.0', tags: '' });

  const filteredSkills = filter === 'all' ? skills : skills.filter(s => s.status === filter);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      setSkills(skills.filter(s => s.id !== id));
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
  };

  const handleSaveEdit = () => {
    if (editingSkill) {
      setSkills(skills.map(s => s.id === editingSkill.id ? editingSkill : s));
      setEditingSkill(null);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      alert('Please enter a skill name');
      return;
    }
    const skill: Skill = {
      id: Date.now().toString(),
      name: newSkill.name,
      description: newSkill.description,
      version: newSkill.version,
      status: 'healthy',
      score: 0.5,
      tags: newSkill.tags.split(',').map(t => t.trim()).filter(t => t),
      author: 'You',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
      dependencies: [],
      examples: [],
      notes: '',
    };
    setSkills([...skills, skill]);
    setNewSkill({ name: '', description: '', version: '1.0.0', tags: '' });
    setShowAddModal(false);
  };

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
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Skill</button>
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
                    <button className="btn btn-secondary" style={{ marginRight: '4px' }} onClick={() => setViewingSkill(skill)}>View</button>
                    <button className="btn btn-secondary" style={{ marginRight: '4px' }} onClick={() => handleEdit(skill)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(skill.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewingSkill && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', padding: '24px', borderRadius: '8px',
            width: '600px', maxHeight: '80vh', overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>{viewingSkill.name}</h2>
              <span className={`badge badge-${viewingSkill.status}`}>{viewingSkill.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Version</label>
                <p style={{ margin: '4px 0' }}>v{viewingSkill.version}</p>
              </div>
              <div>
                <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Author</label>
                <p style={{ margin: '4px 0' }}>{viewingSkill.author}</p>
              </div>
              <div>
                <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Created</label>
                <p style={{ margin: '4px 0' }}>{viewingSkill.createdAt}</p>
              </div>
              <div>
                <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Last Updated</label>
                <p style={{ margin: '4px 0' }}>{viewingSkill.updatedAt}</p>
              </div>
              <div>
                <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Usage Count</label>
                <p style={{ margin: '4px 0' }}>{viewingSkill.usageCount} times</p>
              </div>
              <div>
                <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Quality Score</label>
                <p style={{ margin: '4px 0' }}>{(viewingSkill.score * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Description</label>
              <p style={{ margin: '4px 0', lineHeight: '1.5' }}>{viewingSkill.description}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Status Detail</label>
              <p style={{ margin: '4px 0', color: '#666' }}>{statusDescriptions[viewingSkill.status]}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Tags</label>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {viewingSkill.tags.map((tag, i) => (
                  <span key={i} style={{ 
                    background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' 
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Dependencies</label>
              {viewingSkill.dependencies.length === 0 ? (
                <p style={{ margin: '4px 0', color: '#888' }}>None</p>
              ) : (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {viewingSkill.dependencies.map((dep, i) => (
                    <span key={i} style={{ 
                      background: '#dbeafe', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' 
                    }}>{dep}</span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Examples</label>
              {viewingSkill.examples.length === 0 ? (
                <p style={{ margin: '4px 0', color: '#888' }}>No examples</p>
              ) : (
                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                  {viewingSkill.examples.map((ex, i) => (
                    <li key={i} style={{ marginBottom: '4px', color: '#444' }}>{ex}</li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: '500', color: '#666', fontSize: '13px' }}>Notes</label>
              <p style={{ margin: '4px 0', lineHeight: '1.5', color: '#444' }}>
                {viewingSkill.notes || 'No notes'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setViewingSkill(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setEditingSkill(viewingSkill); setViewingSkill(null); }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSkill && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', padding: '24px', borderRadius: '8px', width: '400px',
          }}>
            <h2 style={{ marginBottom: '16px' }}>Edit Skill</h2>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Name</label>
              <input
                type="text"
                value={editingSkill.name}
                onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Description</label>
              <input
                type="text"
                value={editingSkill.description}
                onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Version</label>
              <input
                type="text"
                value={editingSkill.version}
                onChange={(e) => setEditingSkill({ ...editingSkill, version: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditingSkill(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', padding: '24px', borderRadius: '8px', width: '400px',
          }}>
            <h2 style={{ marginBottom: '16px' }}>Add New Skill</h2>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Name *</label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="e.g., web-search"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Description</label>
              <input
                type="text"
                value={newSkill.description}
                onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                placeholder="e.g., Search the web for information"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Version</label>
              <input
                type="text"
                value={newSkill.version}
                onChange={(e) => setNewSkill({ ...newSkill, version: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tags (comma separated)</label>
              <input
                type="text"
                value={newSkill.tags}
                onChange={(e) => setNewSkill({ ...newSkill, tags: e.target.value })}
                placeholder="e.g., search, web, api"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddSkill}>Add Skill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
