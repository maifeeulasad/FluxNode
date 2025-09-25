import React, { useCallback, useState } from 'react';
import { FluxNode, NodeChange, Node, Edge, applyNodeChanges, EdgeChange, Connection, addEdge, applyEdgeChanges } from 'flux-node';


// Main App Component
const initialNodes: Node[] = [
  { id: 'n1', position: { x: 100, y: 100 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 100, y: 200 }, data: { label: 'Node 2' } },
  { id: 'n3', position: { x: 300, y: 150 }, data: { label: 'Node 3' } },
];

const initialEdges: Edge[] = [
  { id: 'n1-n2', source: 'n1', target: 'n2' }
];

export const App = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div style={{ 
        width: '95vw', height: '95vh', fontFamily: 'system-ui, -apple-system, sans-serif' 
      }}>
      <div style={{ 
        // position: 'absolute', 
        // top: '10px', 
        // left: '10px', 
        // zIndex: 1000,
        // backgroundColor: 'rgba(255, 255, 255, 0.9)',
        // padding: '10px',
        // borderRadius: '8px',
        // fontSize: '14px',
        // boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* <div><strong>React Flow Clone</strong></div> */}
        {/* <ul>
          <li>Drag nodes to move them</li>
          <li>Drag from right handle to left handle to connect</li>
          <li>Mouse wheel to zoom</li>
          <li>Drag background to pan</li>
          <li>Mini-map shows overview</li>
        </ul> */}
      </div>
      <FluxNode
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // fitView
      />
    </div>
  );
}