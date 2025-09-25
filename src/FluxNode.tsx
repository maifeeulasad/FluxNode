import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// Types
export interface Position {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  position: Position;
  data: {
    label: string;
  };
  type?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface NodeChange {
  type: 'position' | 'dimensions' | 'remove' | 'select' | 'add';
  id: string;
  position?: Position;
  dimensions?: { width: number; height: number };
  selected?: boolean;
}

export interface EdgeChange {
  type: 'add' | 'remove' | 'select';
  id: string;
  selected?: boolean;
}

export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Utility functions
export const applyNodeChanges = (changes: NodeChange[], nodes: Node[]): Node[] => {
  return nodes.reduce((acc, node) => {
    const change = changes.find(c => c.id === node.id);
    if (!change) return [...acc, node];
    
    switch (change.type) {
      case 'position':
        return [...acc, { ...node, position: change.position || node.position }];
      case 'remove':
        return acc;
      default:
        return [...acc, node];
    }
  }, [] as Node[]);
};

export const applyEdgeChanges = (changes: EdgeChange[], edges: Edge[]): Edge[] => {
  return edges.reduce((acc, edge) => {
    const change = changes.find(c => c.id === edge.id);
    if (!change) return [...acc, edge];
    
    switch (change.type) {
      case 'remove':
        return acc;
      default:
        return [...acc, edge];
    }
  }, [] as Edge[]);
};

export const addEdge = (connection: Connection, edges: Edge[]): Edge[] => {
  const newEdge: Edge = {
    id: `${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
  };
  
  // Check if edge already exists
  const exists = edges.some(edge => 
    edge.source === newEdge.source && edge.target === newEdge.target
  );
  
  if (exists) return edges;
  return [...edges, newEdge];
};

// Components
const Handle: React.FC<{
  type: 'source' | 'target';
  position: 'top' | 'bottom' | 'left' | 'right';
  id?: string;
  onConnect?: (params: Connection) => void;
  nodeId: string;
}> = ({ type, position, id, onConnect, nodeId }) => {
  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: '#1a192b',
    border: '2px solid #fff',
    borderRadius: '50%',
    cursor: 'crosshair',
    zIndex: 10,
    ...getHandlePosition(position)
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (type === 'source') {
      e.stopPropagation();
      // Store connection start info
      (e.currentTarget as HTMLElement).dataset.connecting = 'true';
      (e.currentTarget as HTMLElement).dataset.nodeId = nodeId;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'target') {
      // Find any connecting handle
      const connectingHandle = document.querySelector('[data-connecting="true"]');
      if (connectingHandle && onConnect) {
        const sourceNodeId = connectingHandle.getAttribute('data-node-id');
        if (sourceNodeId && sourceNodeId !== nodeId) {
          onConnect({
            source: sourceNodeId,
            target: nodeId,
          });
        }
        connectingHandle.removeAttribute('data-connecting');
        connectingHandle.removeAttribute('data-node-id');
      }
    }
  };

  return (
    <div
      style={handleStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
};

const getHandlePosition = (position: string): React.CSSProperties => {
  switch (position) {
    case 'top':
      return { top: '-6px', left: '50%', transform: 'translateX(-50%)' };
    case 'bottom':
      return { bottom: '-6px', left: '50%', transform: 'translateX(-50%)' };
    case 'left':
      return { left: '-6px', top: '50%', transform: 'translateY(-50%)' };
    case 'right':
      return { right: '-6px', top: '50%', transform: 'translateY(-50%)' };
    default:
      return {};
  }
};

const NodeComponent: React.FC<{
  node: Node;
  onNodeChange: (change: NodeChange) => void;
  onConnect: (params: Connection) => void;
  scale: number;
}> = ({ node, onNodeChange, onConnect, scale }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const nodeStyle: React.CSSProperties = {
    position: 'absolute',
    left: node.position.x,
    top: node.position.y,
    padding: '10px 15px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    minWidth: '120px',
    cursor: 'grab',
    userSelect: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    zIndex: 5,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position.x * scale,
      y: e.clientY - node.position.y * scale,
    });
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: (e.clientX - dragStart.x) / scale,
          y: (e.clientY - dragStart.y) / scale,
        };
        onNodeChange({
          type: 'position',
          id: node.id,
          position: newPosition,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, node.id, onNodeChange, scale]);

  return (
    <div
      ref={nodeRef}
      style={nodeStyle}
      onMouseDown={handleMouseDown}
    >
      <Handle type="target" position="left" nodeId={node.id} onConnect={onConnect} />
      <Handle type="source" position="right" nodeId={node.id} onConnect={onConnect} />
      <div>{node.data.label}</div>
    </div>
  );
};

const EdgeComponent: React.FC<{
  edge: Edge;
  sourceNode: Node | undefined;
  targetNode: Node | undefined;
  scale: number;
}> = ({ edge, sourceNode, targetNode, scale }) => {
  if (!sourceNode || !targetNode) return null;

  const sourceX = sourceNode.position.x + 60; // Approximate node width/2
  const sourceY = sourceNode.position.y + 20; // Approximate node height/2
  const targetX = targetNode.position.x;
  const targetY = targetNode.position.y + 20;

  const pathData = `M ${sourceX} ${sourceY} C ${sourceX + 50} ${sourceY} ${targetX - 50} ${targetY} ${targetX} ${targetY}`;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <path
        d={pathData}
        stroke="#b1b1b7"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#b1b1b7"
          />
        </marker>
      </defs>
    </svg>
  );
};

const MiniMap: React.FC<{
  nodes: Node[];
  edges: Edge[];
  viewportWidth: number;
  viewportHeight: number;
  transform: { x: number; y: number; scale: number };
  onViewportChange: (x: number, y: number) => void;
}> = ({ nodes, edges, viewportWidth, viewportHeight, transform, onViewportChange }) => {
  const miniMapWidth = 200;
  const miniMapHeight = 150;
  
  // Calculate bounds
  const bounds = useMemo(() => {
    if (nodes.length === 0) return { minX: 0, maxX: 1000, minY: 0, maxY: 1000 };
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      maxX = Math.max(maxX, node.position.x + 120); // approximate node width
      minY = Math.min(minY, node.position.y);
      maxY = Math.max(maxY, node.position.y + 40); // approximate node height
    });
    
    // Add padding
    const padding = 100;
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
    };
  }, [nodes]);
  
  const scaleX = miniMapWidth / (bounds.maxX - bounds.minX);
  const scaleY = miniMapHeight / (bounds.maxY - bounds.minY);
  const scale = Math.min(scaleX, scaleY);
  
  const miniMapStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    width: miniMapWidth,
    height: miniMapHeight,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden',
    cursor: 'pointer',
    zIndex: 100,
  };

  const handleMiniMapClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale + bounds.minX;
    const y = (e.clientY - rect.top) / scale + bounds.minY;
    onViewportChange(-x + viewportWidth / 2, -y + viewportHeight / 2);
  };

  return (
    <div style={miniMapStyle} onClick={handleMiniMapClick}>
      <svg width="100%" height="100%">
        {nodes.map(node => (
          <rect
            key={node.id}
            x={(node.position.x - bounds.minX) * scale}
            y={(node.position.y - bounds.minY) * scale}
            width={120 * scale}
            height={40 * scale}
            fill="#6366f1"
            opacity={0.7}
          />
        ))}
        {/* Viewport indicator */}
        <rect
          x={(-transform.x - bounds.minX) * scale}
          y={(-transform.y - bounds.minY) * scale}
          width={viewportWidth / transform.scale * scale}
          height={viewportHeight / transform.scale * scale}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          opacity={0.8}
        />
      </svg>
    </div>
  );
};

const FluxNode: React.FC<{
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  fitView?: boolean;
}> = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, fitView }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNodeChange = useCallback((change: NodeChange) => {
    onNodesChange([change]);
  }, [onNodesChange]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(2, transform.scale * delta));
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    const worldX = (clientX - transform.x) / transform.scale;
    const worldY = (clientY - transform.y) / transform.scale;
    
    const newX = clientX - worldX * newScale;
    const newY = clientY - worldY * newScale;
    
    setTransform({ x: newX, y: newY, scale: newScale });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleViewportChange = useCallback((x: number, y: number) => {
    setTransform(prev => ({ ...prev, x, y }));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setTransform(prev => ({
          ...prev,
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        }));
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, panStart]);

  useEffect(() => {
    if (fitView && nodes.length > 0 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      
      nodes.forEach(node => {
        minX = Math.min(minX, node.position.x);
        maxX = Math.max(maxX, node.position.x + 120);
        minY = Math.min(minY, node.position.y);
        maxY = Math.max(maxY, node.position.y + 40);
      });
      
      const padding = 50;
      const contentWidth = maxX - minX + padding * 2;
      const contentHeight = maxY - minY + padding * 2;
      
      const scaleX = rect.width / contentWidth;
      const scaleY = rect.height / contentHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      setTransform({
        x: rect.width / 2 - centerX * scale,
        y: rect.height / 2 - centerY * scale,
        scale,
      });
    }
  }, [fitView, nodes]);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    backgroundImage: `
      radial-gradient(circle, #e5e7eb 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
    cursor: isPanning ? 'grabbing' : 'grab',
    border: '1px solid red',
  };

  const viewportStyle: React.CSSProperties = {
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
    transformOrigin: '0 0',
    width: '100%',
    height: '100%',
    position: 'relative',
    border: '1px solid blue',
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      <div style={viewportStyle}>
        {edges.map(edge => (
          <EdgeComponent
            key={edge.id}
            edge={edge}
            sourceNode={nodes.find(n => n.id === edge.source)}
            targetNode={nodes.find(n => n.id === edge.target)}
            scale={transform.scale}
          />
        ))}
        {nodes.map(node => (
          <NodeComponent
            key={node.id}
            node={node}
            onNodeChange={handleNodeChange}
            onConnect={onConnect}
            scale={1} // Node scaling handled by viewport
          />
        ))}
      </div>
      <MiniMap
        nodes={nodes}
        edges={edges}
        viewportWidth={containerRef.current?.clientWidth || 800}
        viewportHeight={containerRef.current?.clientHeight || 600}
        transform={transform}
        onViewportChange={handleViewportChange}
      />
    </div>
  );
};
export default FluxNode;