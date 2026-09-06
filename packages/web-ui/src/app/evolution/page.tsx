'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface EvolutionAction {
  id: string;
  type: 'retire' | 'optimize' | 'deprecate' | 'upgrade' | 'merge';
  skillName: string;
  reason: string;
  confidence: number;
}

const initialActions: EvolutionAction[] = [
  {
    id: '1',
    type: 'retire',
    skillName: 'old-api',
    reason: 'Health score 15% is critical, usage count: 2',
    confidence: 0.9,
  },
  {
    id: '2',
    type: 'optimize',
    skillName: 'data-process',
    reason: 'Has 2 high-severity issues: Missing examples, No error handling',
    confidence: 0.85,
  },
  {
    id: '3',
    type: 'deprecate',
    skillName: 'report-generation',
    reason: 'Low quality (55%) and low usage (8 times)',
    confidence: 0.8,
  },
  {
    id: '4',
    type: 'upgrade',
    skillName: 'web-search',
    reason: 'High quality (85%) and high usage (245 times)',
    confidence: 0.95,
  },
  {
    id: '5',
    type: 'merge',
    skillName: 'data-process',
    reason: 'Similar to data-transform which has higher quality',
    confidence: 0.7,
  },
];

const possibleActions: EvolutionAction[] = [
  { id: 'new1', type: 'optimize', skillName: 'api-integration', reason: 'Could benefit from better error handling', confidence: 0.75 },
  { id: 'new2', type: 'upgrade', skillName: 'code-analysis', reason: 'Consistent high performance and usage', confidence: 0.88 },
  { id: 'new3', type: 'deprecate', skillName: 'legacy-helper', reason: 'Functionality replaced by newer skills', confidence: 0.82 },
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
  const [actions, setActions] = useState(initialActions);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);
  const [dismissedCount, setDismissedCount] = useState(0);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      // Add 1-2 new random actions
      const numNewActions = Math.floor(Math.random() * 2) + 1;
      const newActions = possibleActions
        .sort(() => Math.random() - 0.5)
        .slice(0, numNewActions)
        .map(action => ({
          ...action,
          id: Date.now().toString() + Math.random(),
        }));
      
      setActions([...actions, ...newActions]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const applyAction = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      alert(`Applied: ${action.type} ${action.skillName}\n\nThis would actually modify the skill in a real implementation.`);
      setAppliedCount(appliedCount + 1);
      setActions(actions.filter(a => a.id !== actionId));
    }
  };

  const dismissAction = (actionId: string) => {
    setDismissedCount(dismissedCount + 1);
    setActions(actions.filter(a => a.id !== actionId));
  };

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
            <div className="stat-value">{actions.length}</div>
            <div className="stat-label">Pending Actions</div>
          </div>
          <div className="stat-card stat-critical">
            <div className="stat-value">{actions.filter(a => a.type === 'retire').length}</div>
            <div className="stat-label">Retire</div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-value">{actions.filter(a => a.type === 'optimize').length}</div>
            <div className="stat-label">Optimize</div>
          </div>
          <div className="stat-card stat-healthy">
            <div className="stat-value">{actions.filter(a => a.type === 'upgrade').length}</div>
            <div className="stat-label">Upgrade</div>
          </div>
        </div>

        {appliedCount > 0 || dismissedCount > 0 ? (
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            background: '#f0fdf4', 
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <strong>Session Summary:</strong> Applied: {appliedCount} | Dismissed: {dismissedCount}
          </div>
        ) : null}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Suggested Actions</h2>
            <button 
              className="btn btn-primary" 
              onClick={runAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>

          {actions.length === 0 ? (
            <div className="empty-state">
              <p>No pending actions</p>
              <p style={{ fontSize: '14px' }}>Click "Run Analysis" to generate new suggestions</p>
            </div>
          ) : (
            <div className="action-list">
              {actions.map((action) => (
                <div key={action.id} className="action-item">
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
                    <button className="btn btn-primary" onClick={() => applyAction(action.id)}>Apply</button>
                    <button className="btn btn-secondary" onClick={() => dismissAction(action.id)}>Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
