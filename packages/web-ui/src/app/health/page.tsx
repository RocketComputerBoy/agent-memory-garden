'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HealthData {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: string[];
  lastChecked: string;
}

interface HealthHistory {
  timestamp: string;
  avgScore: number;
  healthy: number;
  warning: number;
  critical: number;
}

const initialHealthData: HealthData[] = [
  { id: '1', name: 'web-search', status: 'healthy', score: 0.85, issues: [], lastChecked: '2 minutes ago' },
  { id: '2', name: 'code-analysis', status: 'healthy', score: 0.78, issues: [], lastChecked: '2 minutes ago' },
  { id: '3', name: 'report-generation', status: 'warning', score: 0.55, issues: ['Low content quality'], lastChecked: '2 minutes ago' },
  { id: '4', name: 'data-process', status: 'warning', score: 0.45, issues: ['Missing examples', 'No error handling'], lastChecked: '2 minutes ago' },
  { id: '5', name: 'api-integration', status: 'healthy', score: 0.82, issues: [], lastChecked: '2 minutes ago' },
  { id: '6', name: 'old-api', status: 'critical', score: 0.15, issues: ['Deprecated content', 'Empty dependency', 'Low quality'], lastChecked: '2 minutes ago' },
];

export default function HealthPage() {
  const [healthData, setHealthData] = useState(initialHealthData);
  const [isChecking, setIsChecking] = useState(false);
  const [history, setHistory] = useState<HealthHistory[]>([
    { timestamp: '10 min ago', avgScore: 0.70, healthy: 3, warning: 2, critical: 1 },
    { timestamp: '5 min ago', avgScore: 0.72, healthy: 3, warning: 2, critical: 1 },
    { timestamp: '2 min ago', avgScore: 0.68, healthy: 3, warning: 2, critical: 1 },
  ]);
  const [selectedSkill, setSelectedSkill] = useState<HealthData | null>(null);

  const summary = {
    total: healthData.length,
    healthy: healthData.filter(h => h.status === 'healthy').length,
    warning: healthData.filter(h => h.status === 'warning').length,
    critical: healthData.filter(h => h.status === 'critical').length,
    avgScore: healthData.reduce((acc, h) => acc + h.score, 0) / healthData.length,
  };

  const runHealthCheck = () => {
    setIsChecking(true);
    
    setTimeout(() => {
      const updated = healthData.map(skill => {
        const scoreChange = (Math.random() - 0.5) * 0.1;
        let newScore = Math.max(0, Math.min(1, skill.score + scoreChange));
        
        let newStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (newScore < 0.3) newStatus = 'critical';
        else if (newScore < 0.6) newStatus = 'warning';
        
        const possibleIssues = [
          'Low content quality',
          'Missing examples',
          'No error handling',
          'Outdated dependencies',
          'Insufficient documentation',
        ];
        
        const newIssues: string[] = [];
        if (newScore < 0.5 && Math.random() > 0.5) {
          newIssues.push(possibleIssues[Math.floor(Math.random() * possibleIssues.length)]);
        }
        
        return {
          ...skill,
          score: newScore,
          status: newStatus,
          issues: newIssues,
          lastChecked: 'Just now',
        };
      });
      
      setHealthData(updated);
      
      const newHealthy = updated.filter(h => h.status === 'healthy').length;
      const newWarning = updated.filter(h => h.status === 'warning').length;
      const newCritical = updated.filter(h => h.status === 'critical').length;
      const newAvgScore = updated.reduce((acc, h) => acc + h.score, 0) / updated.length;
      
      setHistory(prev => [...prev.slice(-9), {
        timestamp: 'Just now',
        avgScore: newAvgScore,
        healthy: newHealthy,
        warning: newWarning,
        critical: newCritical,
      }]);
      
      setIsChecking(false);
    }, 1500);
  };

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

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Skill Health Status</h2>
              <button 
                className="btn btn-primary" 
                onClick={runHealthCheck}
                disabled={isChecking}
              >
                {isChecking ? 'Checking...' : 'Run Health Check'}
              </button>
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
                {healthData.map(skill => (
                  <tr 
                    key={skill.id} 
                    onClick={() => setSelectedSkill(skill)}
                    style={{ cursor: 'pointer', background: selectedSkill?.id === skill.id ? '#f0f9ff' : undefined }}
                  >
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Health Trend</h2>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
                  {history.map((entry, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ 
                        width: '100%', 
                        height: `${entry.avgScore * 100}px`,
                        background: entry.avgScore >= 0.7 ? '#10b981' : entry.avgScore >= 0.4 ? '#f59e0b' : '#ef4444',
                        borderRadius: '4px 4px 0 0',
                        minHeight: '4px',
                      }} />
                      <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>{entry.timestamp}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '12px' }}>
                  <span>🟢 Healthy</span>
                  <span>🟡 Warning</span>
                  <span>🔴 Critical</span>
                </div>
              </div>
            </div>

            {selectedSkill && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Skill Details</h2>
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{selectedSkill.name}</h3>
                  <div style={{ marginBottom: '8px' }}>
                    <span className={`badge badge-${selectedSkill.status}`}>{selectedSkill.status}</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Score</span>
                      <span>{(selectedSkill.score * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${selectedSkill.score * 100}%`,
                        background: selectedSkill.score >= 0.7 ? '#10b981' : selectedSkill.score >= 0.4 ? '#f59e0b' : '#ef4444',
                      }} />
                    </div>
                  </div>
                  {selectedSkill.issues.length > 0 && (
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Issues:</div>
                      <ul style={{ margin: 0, paddingLeft: '16px' }}>
                        {selectedSkill.issues.map((issue, i) => (
                          <li key={i} style={{ fontSize: '13px', color: '#666' }}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
