'use client';

import React from 'react';
import Link from 'next/link';

const mockEvolutionActions = [
  {
    type: 'retire',
    skillName: 'old-api',
    reason: 'Health score 15% is critical, usage count: 2',
    confidence: 0.9,
  },
  {
    type: 'optimize',
    skillName: 'data-process',
    reason: 'Has 2 high-severity issues: Missing examples, No error handling',
    confidence: 0.85,
  },
  {
    type: 'deprecate',
    skillName: 'report-generation',
    reason: 'Low quality (55%) and low usage (8 times)',
    confidence: 0.8,
  },
  {
    type: 'upgrade',
    skillName: 'web-search',
    reason: 'High quality (85%) and high usage (245 times)',
    confidence: 0.95,
  },
  {
    type: 'merge',
    skillName: 'data-process',
    reason: 'Similar to data-transform which has higher quality',
    confidence: 0.7,
  },
];

const actionIcons: Record<string, string> = {
  retire: '×',
  optimize: '!',
  deprecate: '↓',
  upgrade: '↑',
  merge: '⇔',
};

const actionColors: Record<string, string> = {
  retire: '#fee2e2',
  optimize: '#fef3c7',
  deprecate: '#e5e7eb',
  upgrade: '#d1fae5',
  merge: '#dbeafe',
};

export default function EvolutionPage() {
  return (
    <div>
      <nav className="nav">
        <div className="nav-brand">Agent Memory Garden</div>
        <div className="nav-links">
          <Link href="/" className="nav-link">Dashboard</Link>
          <Link href="/skills" className="nav-link">Skills</Link>
          <Link href="/health" className="nav-link">Health</Link>
          <Link href="/evolution" className="nav-link active">Evolution</Link>
          <Link href="/visualize" className="nav-link">Visualize</Link>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Evolution Actions</h1>
          <p className="page-subtitle">Automated suggestions for skill improvement</p>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{mockEvolutionActions.length}</div>
            <div className="stat-label">Pending Actions</div>
          </div>
          <div className="stat-card stat-critical">
            <div className="stat-value">{mockEvolutionActions.filter(a => a.type === 'retire').length}</div>
            <div className="stat-label">Retire</div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-value">{mockEvolutionActions.filter(a => a.type === 'optimize').length}</div>
            <div className="stat-label">Optimize</div>
          </div>
          <div className="stat-card stat-healthy">
            <div className="stat-value">{mockEvolutionActions.filter(a => a.type === 'upgrade').length}</div>
            <div className="stat-label">Upgrade</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Suggested Actions</h2>
            <button className="btn btn-primary">Run Analysis</button>
          </div>

          <div className="action-list">
            {mockEvolutionActions.map((action, index) => (
              <div key={index} className="action-item">
                <div 
                  className="action-icon"
                  style={{ background: actionColors[action.type] }}
                >
                  {actionIcons[action.type]}
                </div>
                <div className="action-details">
                  <div className="action-title">
                    <span style={{ textTransform: 'capitalize' }}>{action.type}</span>
                    {' '}{action.skillName}
                  </div>
                  <div className="action-reason">{action.reason}</div>
                </div>
                <div className="action-confidence">
                  Confidence: {(action.confidence * 100).toFixed(0)}%
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn btn-primary">Apply</button>
                  <button className="btn btn-secondary">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
