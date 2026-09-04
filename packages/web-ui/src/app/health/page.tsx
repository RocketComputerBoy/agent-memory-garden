'use client';

import React from 'react';
import Link from 'next/link';

const mockHealthData = [
  { id: '1', name: 'web-search', status: 'healthy', score: 0.85, issues: [], lastChecked: '2 minutes ago' },
  { id: '2', name: 'code-analysis', status: 'healthy', score: 0.78, issues: [], lastChecked: '2 minutes ago' },
  { id: '3', name: 'report-generation', status: 'warning', score: 0.55, issues: ['Low content quality'], lastChecked: '2 minutes ago' },
  { id: '4', name: 'data-process', status: 'warning', score: 0.45, issues: ['Missing examples', 'No error handling'], lastChecked: '2 minutes ago' },
  { id: '5', name: 'api-integration', status: 'healthy', score: 0.82, issues: [], lastChecked: '2 minutes ago' },
  { id: '6', name: 'old-api', status: 'critical', score: 0.15, issues: ['Deprecated content', 'Empty dependency', 'Low quality'], lastChecked: '2 minutes ago' },
];

const summary = {
  total: 6,
  healthy: 3,
  warning: 2,
  critical: 1,
  avgScore: 0.6,
};

export default function HealthPage() {
  return (
    <div>
      <nav className="nav">
        <div className="nav-brand">Agent Memory Garden</div>
        <div className="nav-links">
          <Link href="/" className="nav-link">Dashboard</Link>
          <Link href="/skills" className="nav-link">Skills</Link>
          <Link href="/health" className="nav-link active">Health</Link>
          <Link href="/evolution" className="nav-link">Evolution</Link>
          <Link href="/visualize" className="nav-link">Visualize</Link>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Health Monitor</h1>
          <p className="page-subtitle">Track skill health and issues</p>
        </div>

        <div className="stat-grid">
          <div className="stat-card stat-healthy">
            <div className="stat-value">{summary.healthy}</div>
            <div className="stat-label">Healthy</div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-value">{summary.warning}</div>
            <div className="stat-label">Warning</div>
          </div>
          <div className="stat-card stat-critical">
            <div className="stat-value">{summary.critical}</div>
            <div className="stat-label">Critical</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{(summary.avgScore * 100).toFixed(0)}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Skill Health Status</h2>
            <button className="btn btn-primary">Run Health Check</button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Status</th>
                <th>Score</th>
                <th>Issues</th>
                <th>Last Checked</th>
              </tr>
            </thead>
            <tbody>
              {mockHealthData.map(skill => (
                <tr key={skill.id}>
                  <td><strong>{skill.name}</strong></td>
                  <td>
                    <span className={`badge badge-${skill.status}`}>
                      {skill.status}
                    </span>
                  </td>
                  <td>{(skill.score * 100).toFixed(0)}%</td>
                  <td>
                    {skill.issues.length === 0 ? (
                      <span style={{ color: '#10b981' }}>No issues</span>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: '16px' }}>
                        {skill.issues.map((issue, i) => (
                          <li key={i} style={{ fontSize: '13px', color: '#666' }}>{issue}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td style={{ color: '#888' }}>{skill.lastChecked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
