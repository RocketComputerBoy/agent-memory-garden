'use client';

import React from 'react';
import Link from 'next/link';

const mockStats = {
  totalSkills: 12,
  healthy: 8,
  warning: 3,
  critical: 1,
  avgScore: 0.72,
  totalUsage: 1247,
};

export default function Dashboard() {
  return (
    <div>
      <nav className="nav">
        <div className="nav-brand">Agent Memory Garden</div>
        <div className="nav-links">
          <Link href="/" className="nav-link active">Dashboard</Link>
          <Link href="/skills" className="nav-link">Skills</Link>
          <Link href="/health" className="nav-link">Health</Link>
          <Link href="/evolution" className="nav-link">Evolution</Link>
          <Link href="/visualize" className="nav-link">Visualize</Link>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your skill garden</p>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{mockStats.totalSkills}</div>
            <div className="stat-label">Total Skills</div>
          </div>
          <div className="stat-card stat-healthy">
            <div className="stat-value">{mockStats.healthy}</div>
            <div className="stat-label">Healthy</div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-value">{mockStats.warning}</div>
            <div className="stat-label">Warning</div>
          </div>
          <div className="stat-card stat-critical">
            <div className="stat-value">{mockStats.critical}</div>
            <div className="stat-label">Critical</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{(mockStats.avgScore * 100).toFixed(0)}%</div>
            <div className="stat-label">Average Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{mockStats.totalUsage.toLocaleString()}</div>
            <div className="stat-label">Total Usage</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
            </div>
            <div className="action-list">
              <div className="action-item">
                <div className="action-icon upgrade">↑</div>
                <div className="action-details">
                  <div className="action-title">web-search upgraded</div>
                  <div className="action-reason">High quality and usage</div>
                </div>
              </div>
              <div className="action-item">
                <div className="action-icon optimize">!</div>
                <div className="action-details">
                  <div className="action-title">data-process needs optimization</div>
                  <div className="action-reason">Low content quality</div>
                </div>
              </div>
              <div className="action-item">
                <div className="action-icon retire">×</div>
                <div className="action-details">
                  <div className="action-title">old-api marked for retirement</div>
                  <div className="action-reason">Deprecated and low usage</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/skills" className="btn btn-primary" style={{ textAlign: 'center' }}>
                View All Skills
              </Link>
              <Link href="/health" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                Run Health Check
              </Link>
              <Link href="/evolution" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                View Evolution Actions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
