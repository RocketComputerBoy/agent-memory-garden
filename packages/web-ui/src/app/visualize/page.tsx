'use client';

import React, { useRef } from 'react';
import Link from 'next/link';

export default function VisualizePage() {
  const graphRef = useRef<HTMLDivElement>(null);

  const handleExportPNG = () => {
    // Simulate PNG export
    const link = document.createElement('a');
    link.download = 'skill-graph.png';
    
    // Create a simple canvas representation
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Title
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Skill Graph', 320, 50);
      
      // Draw sample nodes
      const nodes = [
        { x: 200, y: 150, name: 'web-search', color: '#10b981' },
        { x: 400, y: 150, name: 'code-analysis', color: '#10b981' },
        { x: 600, y: 150, name: 'api-integration', color: '#10b981' },
        { x: 150, y: 300, name: 'data-process', color: '#f59e0b' },
        { x: 400, y: 300, name: 'report-gen', color: '#f59e0b' },
        { x: 650, y: 300, name: 'old-api', color: '#ef4444' },
      ];
      
      // Draw edges
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 150);
      ctx.lineTo(150, 300);
      ctx.moveTo(200, 150);
      ctx.lineTo(400, 300);
      ctx.moveTo(400, 150);
      ctx.lineTo(400, 300);
      ctx.moveTo(400, 150);
      ctx.lineTo(650, 300);
      ctx.moveTo(600, 150);
      ctx.lineTo(400, 300);
      ctx.moveTo(600, 150);
      ctx.lineTo(650, 300);
      ctx.stroke();
      
      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 30, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.fillStyle = '#1e293b';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + 50);
      });
      
      // Legend
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#10b981';
      ctx.fillRect(50, 500, 16, 16);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Healthy', 72, 514);
      
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(150, 500, 16, 16);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Warning', 172, 514);
      
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(250, 500, 16, 16);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Critical', 272, 514);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  const handleExportSVG = () => {
    // Create SVG content
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <text x="400" y="50" text-anchor="middle" font-size="24" font-weight="bold" fill="#1e293b">Skill Graph</text>
  
  <!-- Edges -->
  <line x1="200" y1="150" x2="150" y2="300" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="200" y1="150" x2="400" y2="300" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="400" y1="150" x2="400" y2="300" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="400" y1="150" x2="650" y2="300" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="600" y1="150" x2="400" y2="300" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="600" y1="150" x2="650" y2="300" stroke="#cbd5e1" stroke-width="2"/>
  
  <!-- Nodes -->
  <circle cx="200" cy="150" r="30" fill="#10b981" stroke="#fff" stroke-width="3"/>
  <text x="200" y="200" text-anchor="middle" font-size="12" fill="#1e293b">web-search</text>
  
  <circle cx="400" cy="150" r="30" fill="#10b981" stroke="#fff" stroke-width="3"/>
  <text x="400" y="200" text-anchor="middle" font-size="12" fill="#1e293b">code-analysis</text>
  
  <circle cx="600" cy="150" r="30" fill="#10b981" stroke="#fff" stroke-width="3"/>
  <text x="600" y="200" text-anchor="middle" font-size="12" fill="#1e293b">api-integration</text>
  
  <circle cx="150" cy="300" r="30" fill="#f59e0b" stroke="#fff" stroke-width="3"/>
  <text x="150" y="350" text-anchor="middle" font-size="12" fill="#1e293b">data-process</text>
  
  <circle cx="400" cy="300" r="30" fill="#f59e0b" stroke="#fff" stroke-width="3"/>
  <text x="400" y="350" text-anchor="middle" font-size="12" fill="#1e293b">report-gen</text>
  
  <circle cx="650" cy="300" r="30" fill="#ef4444" stroke="#fff" stroke-width="3"/>
  <text x="650" y="350" text-anchor="middle" font-size="12" fill="#1e293b">old-api</text>
  
  <!-- Legend -->
  <rect x="50" y="500" width="16" height="16" fill="#10b981"/>
  <text x="72" y="514" font-size="14" fill="#1e293b">Healthy</text>
  
  <rect x="150" y="500" width="16" height="16" fill="#f59e0b"/>
  <text x="172" y="514" font-size="14" fill="#1e293b">Warning</text>
  
  <rect x="250" y="500" width="16" height="16" fill="#ef4444"/>
  <text x="272" y="514" font-size="14" fill="#1e293b">Critical</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'skill-graph.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

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
              <button className="btn btn-secondary" onClick={handleExportPNG}>Export PNG</button>
              <button className="btn btn-secondary" onClick={handleExportSVG}>Export SVG</button>
            </div>
          </div>
          
          <div ref={graphRef} style={{ 
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
