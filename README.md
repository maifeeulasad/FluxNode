# FluxNode

A simple React TypeScript library with a basic component.

## Installation

```bash
npm install flux-node
```

## Usage

```typescript
import React from 'react';
import { SimpleComponent } from 'flux-node';

function App() {
  return (
    <div>
      <SimpleComponent title="Hello World" content="This is a simple component" />
    </div>
  );
}

export default App;
```

## Component Props

### SimpleComponent

- `title?: string` - The title to display (default: "Default Title")
- `content?: string` - The content to display (default: "Default content")

## Development

```bash
# Build the library
npm run build

# Watch mode for development
npm run dev
```