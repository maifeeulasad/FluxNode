# FluxNode

A powerful React TypeScript library for creating interactive flow diagrams with draggable nodes, connectable edges, and advanced features like panning, zooming, and a minimap.

## Features

- 🎯 **Interactive Nodes** - Drag and drop nodes with smooth interactions
- 🔗 **Connectable Edges** - Connect nodes with bezier curve edges
- 🔍 **Pan & Zoom** - Navigate large diagrams with mouse controls
- 🗺️ **Mini Map** - Overview and quick navigation of the entire diagram
- 📱 **Responsive** - Works on different screen sizes
- 🎨 **Customizable** - Style nodes and edges to fit your needs
- ⚡ **Performance** - Optimized for large diagrams with many nodes
- 🔧 **TypeScript** - Full type safety and IntelliSense support

## Installation

```bash
npm install flux-node
```

## Basic Usage

```typescript
import React, { useState, useCallback } from 'react';
import FluxNode, { 
  Node, 
  Edge, 
  NodeChange, 
  EdgeChange, 
  Connection,
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge 
} from 'flux-node';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Node 1' },
  },
  {
    id: '2',
    position: { x: 300, y: 100 },
    data: { label: 'Node 2' },
  },
];

const initialEdges: Edge[] = [];

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <FluxNode
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}

export default App;
```

## API Reference

### FluxNode Component Props

| Prop | Type | Description |
|------|------|-------------|
| `nodes` | `Node[]` | Array of nodes to display |
| `edges` | `Edge[]` | Array of edges connecting nodes |
| `onNodesChange` | `(changes: NodeChange[]) => void` | Callback for node changes (position, removal, etc.) |
| `onEdgesChange` | `(changes: EdgeChange[]) => void` | Callback for edge changes (removal, selection, etc.) |
| `onConnect` | `(params: Connection) => void` | Callback when nodes are connected |
| `fitView?` | `boolean` | Whether to fit all nodes in view on mount |

### Types

#### Node
```typescript
interface Node {
  id: string;
  position: Position;
  data: {
    label: string;
  };
  type?: string;
}
```

#### Edge
```typescript
interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
}
```

#### Position
```typescript
interface Position {
  x: number;
  y: number;
}
```

#### Connection
```typescript
interface Connection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
```

### Utility Functions

#### `applyNodeChanges(changes: NodeChange[], nodes: Node[]): Node[]`
Applies an array of node changes to the nodes array. Handles position updates, removals, and other node modifications.

#### `applyEdgeChanges(changes: EdgeChange[], edges: Edge[]): Edge[]`
Applies an array of edge changes to the edges array. Handles edge removals and other edge modifications.

#### `addEdge(connection: Connection, edges: Edge[]): Edge[]`
Creates a new edge from a connection and adds it to the edges array. Prevents duplicate edges.

## Controls

- **Pan**: Click and drag on empty space to pan around the diagram
- **Zoom**: Use mouse wheel to zoom in and out
- **Move Nodes**: Click and drag nodes to reposition them
- **Connect Nodes**: Click and drag from a node's right handle to another node's left handle
- **Mini Map**: Click on the mini map to quickly navigate to different areas

## Styling

The component uses inline styles for maximum compatibility. You can customize the appearance by modifying the component or extending it with your own styling system.

## Example

Check out the complete example in the [`example/App.tsx`](example/App.tsx) file. This shows a full implementation with:

- 3 pre-positioned nodes
- 1 initial connection
- Interactive controls overlay
- Full-screen layout
- All FluxNode features enabled

The example demonstrates:
- Node dragging and positioning
- Edge creation by connecting handles
- Pan and zoom functionality
- Minimap navigation
- State management with React hooks

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run dev
```

## License

MIT