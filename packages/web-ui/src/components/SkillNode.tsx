import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface SkillNodeData {
  label: string;
  description: string;
  version: string;
  status: 'healthy' | 'warning' | 'critical';
  score: number;
}

const statusColors = {
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
};

const statusBgColors = {
  healthy: '#d1fae5',
  warning: '#fef3c7',
  critical: '#fee2e2',
};

function SkillNode({ data }: NodeProps<SkillNodeData>) {
  const { label, description, version, status, score } = data;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        border: `2px solid ${statusColors[status]}`,
        background: statusBgColors[status],
        minWidth: '180px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      
      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
        {label}
      </div>
      
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
        {description || 'No description'}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
        <span style={{ color: '#888' }}>v{version}</span>
        <span style={{ 
          padding: '2px 6px', 
          borderRadius: '4px',
          background: statusColors[status],
          color: 'white',
          fontWeight: 'bold'
        }}>
          {(score * 100).toFixed(0)}%
        </span>
      </div>
      
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}

export default memo(SkillNode);
