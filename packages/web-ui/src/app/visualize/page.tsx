'use client';

import React from 'react';
import Link from 'next/link';

export default function VisualizePage() {
  return (
    <div>
      <nav className="nav">
        <div className="nav-brand">Agent Memory Garden</div>
        <div className="nav-links">
          <Link href="/" className="nav-link">Dashboard</Link>
          <Link href="/skills" className="nav-link">Skills</Link>
          <Link href="/health" className="nav-link">Health</Link>
          <Link href="/evolution" className="nav-link">Evolution</Link>
          <Link href="/visualize" className="nav-link active">Visualize</Link>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Visualization</h1>
          <p className="page-subtitle">Interactive skill relationship graph</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Skill Graph</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary">Export PNG</button>
              <button className="btn btn-secondary">Export SVG</button>
            </div>
          </div>
          
          <div style={{ 
            height: '500px', 
            border: '1px dashed #ddd', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafafa'
          }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>Interactive Graph</p>
              <p style={{ fontSize: '14px' }}>React Flow visualization will render here</p>
              <Link 
                href="/visualize/graph" 
                className="btn btn-primary"
                style={{ marginTop: '16px', display: 'inline-block' }}
              >
                Open Full Graph
              </Link>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '13px', color: '#666' }}>
            <span>🟢 Healthy: 3</span>
            <span>🟡 Warning: 2</span>
            <span>🔴 Critical: 1</span>
            <span>📦 Total: 6</span>
          </div>
        </div>
      </div>
    </div>
  );
}
